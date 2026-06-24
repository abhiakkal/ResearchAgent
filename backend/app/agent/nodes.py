import asyncio
import json
import os
import re
from functools import lru_cache
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from tavily import TavilyClient

from .state import AgentState


@lru_cache(maxsize=1)
def _llm() -> ChatGroq:
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0)


@lru_cache(maxsize=1)
def _llm_json() -> ChatGroq:
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        model_kwargs={"response_format": {"type": "json_object"}},
    )


@lru_cache(maxsize=1)
def _tavily() -> TavilyClient:
    return TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def _parse_json(text: str, default: Any) -> Any:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return default


async def plan_node(state: AgentState) -> dict:
    query = state["query"]
    response = await _llm_json().ainvoke([
        SystemMessage(content=(
            "You are a research planner. Break the user's question into 2-4 specific, "
            "searchable sub-queries that together will give a comprehensive answer. "
            'Return ONLY valid JSON: {"sub_queries": ["query1", "query2", ...]}'
        )),
        HumanMessage(content=f"Research question: {query}"),
    ])

    data = _parse_json(response.content, {"sub_queries": [query]})
    sub_queries = data.get("sub_queries", [query])[:4]

    return {
        "sub_queries": sub_queries,
        "thought_steps": [{
            "node": "plan",
            "message": f"Breaking into {len(sub_queries)} targeted sub-queries",
            "data": {"sub_queries": sub_queries},
        }],
    }


async def search_node(state: AgentState) -> dict:
    sub_queries = state["sub_queries"]
    all_results: list = []
    seen_urls: set = set()

    async def _search(q: str) -> None:
        raw = await asyncio.to_thread(
            _tavily().search, q, max_results=4, include_answer=False
        )
        for r in raw.get("results", []):
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                all_results.append({
                    "url": r["url"],
                    "title": r.get("title", ""),
                    "content": r.get("content", ""),
                })

    await asyncio.gather(*[_search(q) for q in sub_queries[:3]])

    top = all_results[:9]
    return {
        "search_results": top,
        "thought_steps": [{
            "node": "search",
            "message": f"Found {len(top)} relevant sources across the web",
            "data": {"sources": [r["title"] for r in top[:5]]},
        }],
    }


async def synthesize_node(state: AgentState) -> dict:
    query = state["query"]
    results = state["search_results"]

    context = "\n\n---\n\n".join(
        f"[{i+1}] {r['title']}\nURL: {r['url']}\n{r['content']}"
        for i, r in enumerate(results[:8])
    )
    citations = [
        {"index": i + 1, "url": r["url"], "title": r["title"]}
        for i, r in enumerate(results[:8])
    ]

    messages = [
        SystemMessage(content=(
            "You are an expert research synthesizer. Write a comprehensive, well-structured "
            "answer using the provided sources.\n"
            "Rules:\n"
            "- Cite sources inline as [1], [2], etc.\n"
            "- Use ## markdown headers for sections\n"
            "- Be thorough and informative\n"
            "- End with a ## Summary section\n"
            "- Do NOT include a references list at the end"
        )),
        HumanMessage(content=f"Question: {query}\n\nSources:\n\n{context}"),
    ]

    full_content = ""
    async for chunk in _llm().astream(messages):
        if hasattr(chunk, "content") and chunk.content:
            full_content += chunk.content

    return {
        "synthesis": full_content,
        "citations": citations,
        "thought_steps": [{
            "node": "synthesize",
            "message": f"Synthesizing answer from {len(citations)} sources",
            "data": {"source_count": len(citations)},
        }],
    }


async def reflect_node(state: AgentState) -> dict:
    synthesis = state.get("synthesis", "")
    iteration = state.get("iteration", 0)
    word_count = len(synthesis.split())

    is_complete = word_count >= 150 or iteration >= 1

    message = (
        f"Answer is comprehensive ({word_count} words) — research complete"
        if is_complete
        else "Answer needs more depth — searching for additional context"
    )

    return {
        "is_complete": is_complete,
        "iteration": iteration + 1,
        "thought_steps": [{
            "node": "reflect",
            "message": message,
            "data": {"word_count": word_count, "is_complete": is_complete},
        }],
    }


def should_continue(state: AgentState) -> str:
    if state.get("is_complete", True) or state.get("iteration", 0) >= 2:
        return "end"
    return "search"

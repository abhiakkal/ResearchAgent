import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..agent.graph import graph

router = APIRouter()

_NODE_NAMES = {"plan", "search", "synthesize", "reflect"}


class ResearchRequest(BaseModel):
    query: str


async def _event_stream(query: str):
    initial_state = {
        "query": query,
        "sub_queries": [],
        "search_results": [],
        "synthesis": "",
        "citations": [],
        "is_complete": False,
        "iteration": 0,
        "thought_steps": [],
    }

    try:
        async for event in graph.astream_events(initial_state, version="v2"):
            kind = event["event"]
            name = event.get("name", "")
            metadata = event.get("metadata", {})

            if kind == "on_chain_start" and name in _NODE_NAMES:
                yield f"data: {json.dumps({'type': 'node_start', 'node': name})}\n\n"

            elif kind == "on_chain_end" and name in _NODE_NAMES:
                output = event["data"].get("output", {})
                for step in output.get("thought_steps", []):
                    yield f"data: {json.dumps({'type': 'thought_step', **step})}\n\n"

                if name == "synthesize":
                    synthesis = output.get("synthesis", "")
                    citations = output.get("citations", [])
                    # Send full synthesis as fallback if streaming didn't carry tokens
                    yield f"data: {json.dumps({'type': 'synthesis_complete', 'content': synthesis, 'citations': citations})}\n\n"

            elif kind == "on_chat_model_stream":
                if metadata.get("langgraph_node") == "synthesize":
                    chunk = event["data"].get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        content = chunk.content
                        if isinstance(content, list):
                            content = "".join(
                                c.get("text", "") if isinstance(c, dict) else str(c)
                                for c in content
                            )
                        if content:
                            yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

        yield f"data: {json.dumps({'type': 'complete'})}\n\n"

    except Exception as exc:
        yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"


@router.post("/research")
async def research(request: ResearchRequest):
    return StreamingResponse(
        _event_stream(request.query),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

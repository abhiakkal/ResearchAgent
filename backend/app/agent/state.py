from typing import Annotated, Dict, List, Optional, TypedDict
import operator


class SearchResult(TypedDict):
    url: str
    title: str
    content: str


class Citation(TypedDict):
    index: int
    url: str
    title: str


class ThoughtStep(TypedDict):
    node: str
    message: str
    data: Optional[Dict]


class AgentState(TypedDict):
    query: str
    sub_queries: List[str]
    search_results: List[SearchResult]
    synthesis: str
    citations: List[Citation]
    is_complete: bool
    iteration: int
    thought_steps: Annotated[List[ThoughtStep], operator.add]

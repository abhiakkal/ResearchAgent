from langgraph.graph import END, StateGraph

from .nodes import plan_node, reflect_node, search_node, should_continue, synthesize_node
from .state import AgentState


def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("plan", plan_node)
    workflow.add_node("search", search_node)
    workflow.add_node("synthesize", synthesize_node)
    workflow.add_node("reflect", reflect_node)

    workflow.set_entry_point("plan")
    workflow.add_edge("plan", "search")
    workflow.add_edge("search", "synthesize")
    workflow.add_edge("synthesize", "reflect")
    workflow.add_conditional_edges(
        "reflect",
        should_continue,
        {"search": "search", "end": END},
    )

    return workflow.compile()


graph = build_graph()

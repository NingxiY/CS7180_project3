from backend.agents.base import BaseAgent
from backend.agents.schemas import AgentOpinion, UserContext


class HistoryAgent(BaseAgent):
    async def run(self, context: UserContext) -> AgentOpinion:
        return AgentOpinion(
            agent_name="history",
            advice="Based on your stated preferences and dealbreakers, you tend to value stability. Consider partners who demonstrate consistency early on.",
        )

from backend.agents.base import BaseAgent
from backend.agents.schemas import AgentOpinion, UserContext


class AstrologyAgent(BaseAgent):
    def run(self, context: UserContext) -> AgentOpinion:
        return AgentOpinion(
            agent_name="astrology",
            advice="Based on your birth chart, you are most compatible with earth signs.",
        )

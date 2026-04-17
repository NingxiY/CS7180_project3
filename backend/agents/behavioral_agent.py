from backend.agents.base import BaseAgent
from backend.agents.schemas import AgentOpinion, UserContext


class BehavioralAgent(BaseAgent):
    async def run(self, context: UserContext) -> AgentOpinion:
        return AgentOpinion(
            agent_name="behavioral",
            advice="Your communication style suggests you bond best through shared activities. Prioritize partners who enjoy the same hobbies as you.",
        )

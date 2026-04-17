import asyncio

from backend.agents.astrology_agent import AstrologyAgent
from backend.agents.behavioral_agent import BehavioralAgent
from backend.agents.history_agent import HistoryAgent
from backend.agents.schemas import AgentOpinion, JudgeOutput, UserContext
from backend.judge.judge import JudgeLayer


class Orchestrator:
    def __init__(self) -> None:
        self._agents = [AstrologyAgent(), BehavioralAgent(), HistoryAgent()]
        self._judge = JudgeLayer()

    async def run(self, context: UserContext) -> JudgeOutput:
        opinions: list[AgentOpinion] = list(
            await asyncio.gather(*[agent.run(context) for agent in self._agents])
        )
        return await self._judge.evaluate(opinions, context)

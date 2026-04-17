"""
TDD - Red phase.

This test will fail until the following are implemented:
  backend/agents/astrology_agent.py  -> AstrologyAgent
  backend/agents/schemas.py          -> UserContext, AgentOpinion
"""

import pytest

from backend.agents.astrology_agent import AstrologyAgent
from backend.agents.schemas import AgentOpinion, Preferences, UserContext


@pytest.fixture()
def sample_user_context() -> UserContext:
    return UserContext(
        user_id="user-001",
        birth_date="1995-06-15",
        preferences=Preferences(looking_for="long-term", interests=["hiking", "reading"]),
    )


class TestAstrologyAgent:
    @pytest.mark.asyncio
    async def test_returns_agent_opinion(self, sample_user_context: UserContext) -> None:
        agent = AstrologyAgent()
        result = await agent.run(sample_user_context)
        assert isinstance(result, AgentOpinion)

    @pytest.mark.asyncio
    async def test_agent_name_is_astrology(self, sample_user_context: UserContext) -> None:
        agent = AstrologyAgent()
        result = await agent.run(sample_user_context)
        assert result.agent_name == "astrology"

    @pytest.mark.asyncio
    async def test_advice_is_non_empty_string(self, sample_user_context: UserContext) -> None:
        agent = AstrologyAgent()
        result = await agent.run(sample_user_context)
        assert isinstance(result.advice, str)
        assert result.advice.strip() != ""

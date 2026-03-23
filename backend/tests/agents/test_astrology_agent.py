"""
TDD - Red phase.

This test will fail until the following are implemented:
  backend/agents/astrology_agent.py  -> AstrologyAgent
  backend/agents/schemas.py          -> UserContext, AgentOpinion
"""

import pytest

from backend.agents.astrology_agent import AstrologyAgent
from backend.agents.schemas import AgentOpinion, UserContext


@pytest.fixture()
def sample_user_context() -> UserContext:
    return UserContext(
        user_id="user-001",
        birth_date="1995-06-15",
        preferences={"looking_for": "long-term", "interests": ["hiking", "reading"]},
    )


class TestAstrologyAgent:
    def test_returns_agent_opinion(self, sample_user_context: UserContext) -> None:
        """AstrologyAgent.run() must return an AgentOpinion instance."""
        agent = AstrologyAgent()
        result = agent.run(sample_user_context)

        assert isinstance(result, AgentOpinion)

    def test_agent_name_is_astrology(self, sample_user_context: UserContext) -> None:
        """agent_name must identify this agent unambiguously."""
        agent = AstrologyAgent()
        result = agent.run(sample_user_context)

        assert result.agent_name == "astrology"

    def test_advice_is_non_empty_string(self, sample_user_context: UserContext) -> None:
        """advice must be a non-empty string — not None, not whitespace."""
        agent = AstrologyAgent()
        result = agent.run(sample_user_context)

        assert isinstance(result.advice, str)
        assert result.advice.strip() != ""

from typing import Optional

from anthropic import AsyncAnthropic

from backend.agents.astrology.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from backend.agents.base import BaseAgent
from backend.agents.schemas import AgentOpinion, UserContext
from backend.config import settings

_STUB_ADVICE = "Based on your birth chart, you are most compatible with earth signs."


class AstrologyAgent(BaseAgent):
    def __init__(self, client: Optional[AsyncAnthropic] = None) -> None:
        self._client = client

    async def run(self, context: UserContext) -> AgentOpinion:
        if settings.anthropic_api_key:
            try:
                advice = await self._call_llm(context)
                return AgentOpinion(agent_name="astrology", advice=advice, source="llm")
            except Exception as exc:
                print(f"[AstrologyAgent] LLM call failed ({exc!r}), using stub advice.")
        return AgentOpinion(agent_name="astrology", advice=_STUB_ADVICE, source="stub")

    async def _call_llm(self, context: UserContext) -> str:
        client = self._client or AsyncAnthropic(api_key=settings.anthropic_api_key)
        user_prompt = USER_PROMPT_TEMPLATE.format(
            birth_date=context.birth_date,
            looking_for=context.preferences.looking_for,
            interests=", ".join(context.preferences.interests) or "none",
            dealbreakers=", ".join(context.preferences.dealbreakers) or "none",
        )
        response = await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=256,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return response.content[0].text

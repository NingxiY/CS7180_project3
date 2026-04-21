from typing import Optional

from openai import AsyncOpenAI

from backend.agents.base import BaseAgent
from backend.agents.schemas import AgentOpinion, UserContext
from backend.config import settings

_STUB_ADVICE = "Based on your birth chart, you are most compatible with earth signs."


class AstrologyAgent(BaseAgent):
    def __init__(self, client: Optional[AsyncOpenAI] = None) -> None:
        self._client = client

    async def run(self, context: UserContext) -> AgentOpinion:
        if settings.openai_api_key:
            try:
                advice = await self._call_llm(context)
            except Exception as exc:
                print(f"[AstrologyAgent] LLM call failed ({exc!r}), using stub advice.")
                advice = _STUB_ADVICE
        else:
            advice = _STUB_ADVICE
        return AgentOpinion(agent_name="astrology", advice=advice)

    async def _call_llm(self, context: UserContext) -> str:
        client = self._client or AsyncOpenAI(api_key=settings.openai_api_key)
        prompt = (
            f"You are an astrology-based dating advisor.\n"
            f"User birth date: {context.birth_date}\n"
            f"Looking for: {context.preferences.looking_for}\n"
            f"Interests: {', '.join(context.preferences.interests) or 'none'}\n"
            f"Dealbreakers: {', '.join(context.preferences.dealbreakers) or 'none'}\n\n"
            f"Give 2-3 sentences of astrology-grounded dating advice for this person."
        )
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content or ""

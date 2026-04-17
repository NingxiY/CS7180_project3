from pydantic import BaseModel


class Preferences(BaseModel):
    looking_for: str
    interests: list[str] = []
    dealbreakers: list[str] = []


class UserContext(BaseModel):
    user_id: str
    birth_date: str
    preferences: Preferences


class AgentOpinion(BaseModel):
    agent_name: str
    advice: str


class JudgeScore(BaseModel):
    agent_name: str
    relevance: float
    safety: float
    coherence: float


class JudgeOutput(BaseModel):
    final_advice: str
    scores: list[JudgeScore]
    rationale: str

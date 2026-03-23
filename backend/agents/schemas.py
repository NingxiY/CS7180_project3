from pydantic import BaseModel


class UserContext(BaseModel):
    user_id: str
    birth_date: str
    preferences: dict


class AgentOpinion(BaseModel):
    agent_name: str
    advice: str

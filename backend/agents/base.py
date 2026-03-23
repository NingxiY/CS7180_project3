from abc import ABC, abstractmethod

from backend.agents.schemas import AgentOpinion, UserContext


class BaseAgent(ABC):
    @abstractmethod
    def run(self, context: UserContext) -> AgentOpinion:
        ...

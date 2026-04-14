from typing import Generic, List, TypeVar

from pydantic import BaseModel, computed_field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Resposta paginada genérica"""
    items: List[T]
    total: int
    skip: int
    limit: int
    pages: int

    @computed_field
    def current_page(self) -> int:
        """Calcula a página atual (1-indexado)"""
        return (self.skip // self.limit) + 1 if self.limit > 0 else 1

    @computed_field
    def has_next(self) -> bool:
        """Verifica se há próxima página"""
        return (self.skip + self.limit) < self.total

    @computed_field
    def has_previous(self) -> bool:
        """Verifica se há página anterior"""
        return self.skip > 0

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CebasResponse(BaseModel):
    status: str
    data: List[Dict[str, Any]] # Lista de dicionários dinâmicos
from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):    
    nome_completo: str = Field(alias='displayName')
    nome_abreviado: str = Field(alias='givenName')
    email_corporativo: str = Field(alias='mail')
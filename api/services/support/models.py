from sqlalchemy import Column, ForeignKey, Boolean, Integer, String, Date
from database import Base

class Tecnico(Base):
  __tablename__ = 'Tecnico'
  id = Column(Integer, primary_key=True, index=True)


class Tarefa(Base):
  __tablename__ = 'Tarefa'
  id = Column(Integer, primary_key=True, index=True)
  titulo = Column(String, index=True)
  servico = Column(String)
  tipo_de_suporte = Column(String)
  quem_pode_ajudar = Column(ForeignKey=Tecnico)
  data = Column(Date)
  descricao = Column(String)
  quem_solicitou = Column(String)
  ultima_atualizacao = Column(String)
  estado = Column(String)


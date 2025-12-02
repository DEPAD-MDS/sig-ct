def chat(token, data):
    pass
# o make chat recebe no body um json com uma conversa (de mensagens com role e content)
# e o token de autenticação.  O make chat inicializa uma conversa com o relator e retorna a resposta do relator.
# o make chat também utiliza dos serviços do cebas, repasses e geral para armazenar os dados;
  
def make_presentation(token, data):
    pass
# o make presentation recebe no body um json com uma pergunta de contexto da apresentação 
# que vai ser definida pelo o usuário e o token de autenticação. Nesse mesmo body, é passado o setor que 
# chamou a função (ex: depad, assessoria, repasses) para definir o template da apresentação e os dados 
# filtrados em json (as vezes nem é filtrado) a serem utilizados.
from lib.graph_api import GraphApiService
from functions.user.user_types import User

def get_info(token):
    service = GraphApiService(token)
    data =  service.get_graph_data('/me')
    user = User(**data)
    return user.model_dump()
        
def get_picture(token):
    service = GraphApiService(token)
    return service.get_graph_bytes('/me/photo/$value')

from lib.graph_api import GraphApiService

def get_data(token):
    service = GraphApiService(token)
    service.get_graph_spreadsheet()
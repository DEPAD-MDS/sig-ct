from lib.graph_api import GraphApiService
import requests

def get_geral_data(token):
  graph_api = GraphApiService(token)
  graph_api.get_graph_spreadsheet(drive_id='', sheet_id='', worksheet='', initial_interval='',last_interval='')
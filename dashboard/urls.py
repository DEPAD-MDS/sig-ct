from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard_view, name="dashboard"),
    path("api/data/", views.dashboard_data_api, name="dashboard-data-api"),
]



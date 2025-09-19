from django.shortcuts import render
from django.http import JsonResponse
from . import sharepoint_service

def dashboard_view(request):
    # Aqui precisa ser alterado
    file_name = "planilha.xlsx"
    try:
        excel_content = sharepoint_service.get_excel_file_from_sharepoint(file_name)
        processed_data = sharepoint_service.process_excel_data(excel_content)
        
        # Para a primeira versão, vamos apenas passar os dados para o template
        context = {
            'data': processed_data,
            'error': None
        }
        return render(request, 'dashboard/index.html', context)

    except Exception as e:
        context = {
            'data': None,
            'error': str(e)
        }
        return render(request, 'dashboard/index.html', context)

def dashboard_data_api(request):
    # View api
    file_name = "sua_planilha.xlsx"
    try:
        excel_content = sharepoint_service.get_excel_file_from_sharepoint(file_name)
        processed_data = sharepoint_service.process_excel_data(excel_content)
        return JsonResponse(processed_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



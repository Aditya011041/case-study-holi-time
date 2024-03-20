from django.shortcuts import render
from rest_framework.views import APIView
from projects.serializers import ProjectSerializer
from projectmanager.models import ProjManager
from projects.models import Project
from projectmanager.serializers import ProjManagerSerializer
from rest_framework.response import Response
from employees.models import Employee
from employees.serializers import EmployeeSerializer

class ManagerView(APIView):
    def get(self, request,  format=None):
        managers = ProjManager.objects.all()
        manager_data = []
        for manager in managers:
            manager_serializer = ProjManagerSerializer(manager)
            projects = Project.objects.filter(managers=manager)
            employees = Employee.objects.filter(project__in=projects).distinct()
            employee_serializer = EmployeeSerializer(employees, many=True)
            manager_data.append({
                'manager': manager_serializer.data,
                'employees': employee_serializer.data
            })
        return Response(manager_data)
    
    
#getting information about a project manager ----------------------
class OneManagerView(APIView):
    def get(self, request, pk, format=None):
        manager = ProjManager.objects.get(pk=pk)
        manager_serializer = ProjManagerSerializer(manager)
        manager_detail = []
        # Get all projects managed by this manager
        projects = Project.objects.filter(managers=manager)

        # Get all employees under these projects
        employees = Employee.objects.filter(project__in=projects).distinct()
        employees_serializer = EmployeeSerializer(employees, many=True)

        # Fetch all projects associated with each employee
        employee_projects = {}
        for employee in employees:
            employee_projects[employee.id] = ProjectSerializer(employee.project_set.all(), many=True).data

        manager_detail.append( {
            'manager': manager_serializer.data,
            'projects_under_manager': ProjectSerializer(projects, many=True).data,
            'employees': employees_serializer.data,
            'employee_projects': employee_projects
        })

        return Response(manager_detail)
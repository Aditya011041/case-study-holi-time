from rest_framework.views import APIView
from rest_framework.response import Response
from employees.models import Employee
from employees.serializers import EmployeeSerializer
from projectmanager.models import ProjManager
from projectmanager.serializers import ProjManagerSerializer
from projects.models import Project
from projects.serializers import ProjectSerializer
from rest_framework import status
from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User


class EmployeeId(APIView):
    def get(self,request):
        employees = Employee.objects.all()
        employee_serializer = EmployeeSerializer(employees, many=True)
        return Response(employee_serializer.data)


class EmpList(APIView):
    def get(self, request, pk, format=None):
        try:
            employee = Employee.objects.get(pk=pk)
            print({employee})
        except Employee.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        employee_serializer = EmployeeSerializer(employee)
        
        
        projects = Project.objects.filter(assigned_to=employee)
        project_serializer = ProjectSerializer(projects, many=True)
        projectsMan = ProjManager.objects.filter(projects__in =projects).distinct()
        projectMan_serializer = ProjManagerSerializer(projectsMan, many=True)
        
        data = {
            'employee': employee_serializer.data,
            'managers': projectMan_serializer.data,
            'projects': project_serializer.data
        }
        return Response(data)


class Login(APIView):
    def post(self, request, format=None):
        email = request.data.get('email')
        name  = request.data.get('name')
        default_user = User.objects.filter(email=email, username=name).first()

        if default_user:
            token = AccessToken.for_user(default_user)
            return JsonResponse({'token': str(token), 'emp_id': default_user.id, 'is_manager': False, 'manager_Id': None, 'message': 'Welcome to Beehyv admin' , 'superuser': True})
        user = authenticate(request, email=email , name=name)

        if user is not None:
            is_manager = isinstance(user, ProjManager)
            manager_ki_id = None
            if is_manager:
                manager_ki_id = user.id
#jwt token generating using from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken.for_user(user)
       

            return JsonResponse({'token': str(token), 'emp_id': user.id, 'is_manager': is_manager, 'manager_Id': manager_ki_id , 'message' : 'Welcome to Beehyv' })
        else:
            return JsonResponse({'error': 'Wrong credentials'}, status=400)
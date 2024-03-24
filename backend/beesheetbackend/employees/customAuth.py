from django.contrib.auth.backends import ModelBackend
from employees.models import Employee
from projectmanager.models import ProjManager

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        user = None

        if (email and password):
            employee = Employee.objects.filter(email=email , password=password).first()
            if employee:
                user = employee
                print(password)
            else:
                manager = ProjManager.objects.filter(email=email , password = password).first()
                if manager:
                    user = manager

        return user

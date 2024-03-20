from rest_framework import generics
from rest_framework import status
from beesheetbackend.employees.models import Employee
from beesheetbackend.projectmanager.models import ProjManager
from .models import Project
from .serializers import ProjectSerializer
from rest_framework.response import Response


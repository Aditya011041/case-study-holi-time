from rest_framework import serializers

from employees.serializers import EmployeeSerializer
from projectmanager.serializers import ProjManagerSerializer
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    managers = ProjManagerSerializer(many=True) 
    assigned_to = EmployeeSerializer(many=True)
    class Meta:
        model = Project
        fields = '__all__'


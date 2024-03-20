from django.db import models
from employees.models import Employee
from projectmanager.models import ProjManager



class Project(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(auto_now=True)
    assigned_to = models.ManyToManyField(Employee, blank=True)
    managers = models.ManyToManyField(ProjManager , related_name='projects')

    def __str__(self):
        return self.title
from django.db import models
from employees.models import Employee

# Create your models here.

class ProjManager(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120 , null=False)
    email = models.EmailField(max_length=60, null=False)
    employees = models.ManyToManyField(Employee ,related_name='employees' , blank=True)
    

    def __str__(self):
        return self.name

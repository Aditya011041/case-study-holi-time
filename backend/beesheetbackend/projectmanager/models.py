from django.db import models
from employees.models import Employee
from django.contrib.auth.hashers import make_password, check_password

# Create your models here.

class ProjManager(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120 , null=False)
    email = models.EmailField(max_length=60, null=False)
    employees = models.ManyToManyField(Employee ,related_name='employees' , blank=True)
    password = models.IntegerField(max_length=128 , null=False)
    

    def __str__(self): 
        return self.name

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

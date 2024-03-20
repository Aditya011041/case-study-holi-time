from django.db import models


class Employee(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=120 , null=False)
    email = models.EmailField(max_length=60, null=False)
    department = models.CharField(max_length=50)
    position = models.CharField(max_length=100) 
    payment = models.IntegerField(max_length=140 , null=True)
    is_manager = models.BooleanField(default=False)



    def __str__(self): 
        return self.name
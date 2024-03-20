from django.contrib import admin
from .models import Project

class ProjectAdmin(admin.ModelAdmin):
    filter_horizontal = ('assigned_to', 'managers')
    list_display = ['title' , 'description' , 'created_at']

admin.site.register(Project, ProjectAdmin)

# Generated by Django 5.0.2 on 2024-03-20 20:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_alter_project_managers'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='project',
            name='ended_at',
        ),
    ]

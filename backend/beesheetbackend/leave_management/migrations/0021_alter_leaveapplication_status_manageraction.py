# Generated by Django 5.0.2 on 2024-03-11 15:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave_management', '0020_remove_leaveapplication_manager_approvals_and_more'),
        ('projectmanager', '0008_alter_projmanager_employees'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leaveapplication',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=20),
        ),
        migrations.CreateModel(
            name='ManagerAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('APPROVE', 'Approve'), ('REJECT', 'Reject'), ('PENDING', 'Pending')], default='PENDING', max_length=20)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('leave_application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='leave_management.leaveapplication')),
                ('manager', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projectmanager.projmanager')),
            ],
        ),
    ]

from rest_framework.views import APIView
from employees.serializers import EmployeeSerializer
from employees.models import Employee
from projectmanager.models import ProjManager
from leave_management.serializers import LeaveApplicationSerializer, LeaveSummarySerializer , LeaveTypeSerializer
from leave_management.models import LeaveApplication, LeaveSummary , LeaveType
from rest_framework.response import Response
from django.http import Http404
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import F

# Create your views here. 

class LeaveApplicationAll(APIView):
    def get(self, request, format=None):
        leave_applications = LeaveApplication.objects.all()
        serializer = LeaveApplicationSerializer(leave_applications, many=True)
        return Response(serializer.data)

#leave application api methods here for mananger's ui
class LeaveApplicationList(APIView):
    def get(self, request,pk, format=None):
        leave_applications = LeaveApplication.objects.get(pk=pk)
        serializer = LeaveApplicationSerializer(leave_applications, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        employee_instance = Employee.objects.get(pk=pk)
        request.data['employee'] = employee_instance.id 
        serializer = LeaveApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    def delete(self,request , pk):
        leave_application = LeaveApplication.objects.get(pk=pk)
        leave_application.delete()
        return Response(status=204)

    def patch(self, request, managerId, leave_app_id):
        leave_application = LeaveApplication.objects.get(pk=leave_app_id)
        manager = ProjManager.objects.get(pk=managerId)
        action = request.data.get('action')
        
        if leave_application.superuser_changed_status:
            return Response({'error': 'Status changed by admin. Further changes denied.', 'superuser_changed_status': True}, status=404)
        
        if action in ['approve', 'reject', 'pending']:
            leave_application.status = None

        if action == 'approve':
            leave_application.managers.add(manager)
            leave_application.status = 'APPROVED'
        elif action == 'reject':
            leave_application.status = 'REJECTED'
        elif action == 'pending':
            leave_application.status = 'PENDING'

        leave_application.save()

        serializer = LeaveApplicationSerializer(leave_application)
        return Response(serializer.data)


class SuperuserStatusChangeView(APIView):
    def patch(self, request, leave_app_id):
        leave_application = LeaveApplication.objects.get(pk=leave_app_id)
        action = request.data.get('action')
        
        if action in ['approve', 'reject', 'pending']:
            leave_application.status = None

        if action == 'approve':
            leave_application.status = 'APPROVED'
        elif action == 'reject':
            leave_application.status = 'REJECTED'            
        elif action == 'pending':
            leave_application.status = 'PENDING'
            
        if leave_application.superuser_changed_status:
            return Response({'message': 'Status already changed by admin. Further changes denied.'})

        leave_application.superuser_changed_status = True

        leave_application.save()

        serializer = LeaveApplicationSerializer(leave_application)
        return Response(serializer.data)

#cancel leave and delete application and summary
class CancelLeaveApplication(APIView):
    def delete(self, request, empId, leave_app_id):
        try:
            leave_application = LeaveApplication.objects.get(pk=leave_app_id)
            if leave_application.employee_id != empId:
                return Response({"error": "Unauthorized"})
            leave_summary = LeaveSummary.objects.filter(employee=leave_application.employee).first()

            if leave_summary:
                leave_summary.delete()

            leave_application.delete()
            
            update_leave_report(None, leave_application, None)

            return Response({'message': 'Leave application removed successfully'})
        except LeaveApplication.DoesNotExist:
            raise Http404("Leave application not found")


  

class LeaveSummaryDetail(APIView):
    def get(self,request,pk):
        brief = LeaveSummary.objects.get(pk=pk)
        serializer = LeaveSummarySerializer(brief)
        return Response(serializer.data)
    
    
#api for types of leaves for leaveapplication form   
class LeaveTypeDetail(APIView):
    def get(self,request):
        leave_types = LeaveType.objects.all()
        serializer = LeaveTypeSerializer(leave_types, many=True)
        return Response(serializer.data)
    def post(self,request):
        serializer = LeaveTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self,request,pk):
        leave_id = LeaveType.objects.get(pk = pk)
        serializer = LeaveTypeSerializer(leave_id, data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

        


@receiver(post_save, sender=LeaveApplication)
def create_leave_report(sender, instance, created, **kwargs):
    if instance.status == 'APPROVED':
        employee = instance.employee
        leave_type_id = instance.leave_type_id 
        total_allocated_days = instance.leave_type.days_allocated
        total_used_days = (instance.end_date - instance.start_date).days + 1
        total_available_days = total_allocated_days - total_used_days
        leave_report = LeaveSummary.objects.create(
            total_available=total_available_days,
            total_used=total_used_days,
            leave_type_id=leave_type_id 
        )
        leave_report.employee.set([employee])


@receiver(post_save, sender=LeaveApplication)
def update_leave_report(sender, instance, created, **kwargs):
    if instance.status == 'REJECTED':
        employee = instance.employee
        leave_type_id = instance.leave_type_id 
        total_allocated_days = instance.leave_type.days_allocated
        
        leave_report_qs = LeaveSummary.objects.filter(employee=employee, leave_type_id=leave_type_id)
        if leave_report_qs.exists():
            leave_report = leave_report_qs.first()
            total_used = leave_report.total_used
            total_available_days = leave_report.total_available + total_used
            total_used_days = 0
            leave_report.total_available = total_available_days
            leave_report.total_used = total_used_days
            leave_report.save()
        else:
            leave_report = LeaveSummary.objects.create(
                total_available=total_allocated_days,
                total_used=0,
                leave_type_id=leave_type_id
            )
            leave_report.employee.set([employee])


#Count of leaves
class LeaveSummaryData(APIView):
    def get(self, request, emp_id):
        try:
            employee = Employee.objects.get(pk=emp_id)
            leave_summaries = LeaveSummary.objects.filter(employee=employee)
            leave_types = LeaveType.objects.all()

            serialized_leave_summaries = []
            leave_type_data = {}

            if leave_summaries.exists():
                for leave_summary in leave_summaries:
                    leave_type = leave_summary.leave_type
                    leave_type_data[leave_type.id] = {
                        'name': leave_type.name,
                        'days_allocated': leave_type.days_allocated,
                        'total_available': leave_summary.total_available,
                        'total_used': leave_summary.total_used
                    }
            else:
                for leave_type in leave_types:
                    leave_type_data[leave_type.id] = {
                        'name': leave_type.name,
                        'days_allocated': leave_type.days_allocated,
                        'total_available': leave_type.days_allocated,
                        'total_used': 0
                    }

            return Response({'leave_types': leave_type_data})
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'})


#to fetch leave application in manager's ui 
class ManagerLeaveApplicationList(APIView):
    serializer_class = LeaveApplicationSerializer

    def get_queryset(self):
        manager_Id = self.kwargs['manager_Id']

        manager = ProjManager.objects.get(id=manager_Id)

        manager_projects = manager.projects.all()

        employees_in_manager_projects = Employee.objects.filter(project__in=manager_projects)

        queryset = LeaveApplication.objects.filter(employee__in=employees_in_manager_projects)
        
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
#to fetch leave application in employee's ui    
class EmployeeApplicationList(APIView):
    serializer_class = LeaveApplicationSerializer
    
    def get_queryset(self):
        emp_id = self.kwargs['emp_id']

        employee = Employee.objects.get(id=emp_id)

        queryset = LeaveApplication.objects.filter(employee = employee)
        
        return queryset
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

class ViewDetails(APIView):
    def get(self,request,pk , format=None):
        try:
            employee = Employee.objects.get(pk=pk)
            serializer = EmployeeSerializer(employee)
            print({employee})
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(status='not found')


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Class, Student, Guardian, Invoice, Payment
from .serializers import (
    ClassSerializer, StudentSerializer,
    GuardianSerializer, InvoiceSerializer, PaymentSerializer
)

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class GuardianViewSet(viewsets.ModelViewSet):
    queryset = Guardian.objects.all()
    serializer_class = GuardianSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        queryset = Invoice.objects.all()
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'confirmed'
        payment.verified_by = request.data.get('verified_by', 'Admin')
        payment.verified_at = timezone.now()
        payment.invoice.status = 'paid'
        payment.invoice.save()
        payment.save()
        return Response({'message': 'Payment confirmed'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.verified_by = request.data.get('verified_by', 'Admin')
        payment.verified_at = timezone.now()
        payment.save()
        return Response({'message': 'Payment rejected'})
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Class, Student, Guardian, Invoice, Payment, ParentUser
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
        
        # Send confirmation email to guardian
        try:
            guardian = payment.invoice.student.guardians.first()
            if guardian:
                send_payment_confirmation_email(payment, payment.invoice, guardian)
        except Exception as e:
            print(f"Error sending email: {e}")
        
        return Response({'message': 'Payment confirmed and email sent to parent'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.verified_by = request.data.get('verified_by', 'Admin')
        payment.verified_at = timezone.now()
        payment.save()
        return Response({'message': 'Payment rejected'})
    

from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def parent_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        parent = ParentUser.objects.get(email=email)
        if check_password(password, parent.password):
            return Response({
                'token': parent.token,
                'parent_id': parent.id,
                'guardian_id': parent.guardian.id,
                'name': parent.guardian.full_name
            })
        else:
            return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
    except ParentUser.DoesNotExist:
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def parent_register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    guardian_id = request.data.get('guardian_id')
    
    if ParentUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        guardian = Guardian.objects.get(id=guardian_id)
        parent = ParentUser.objects.create(
            guardian=guardian,
            email=email,
            password=make_password(password)
        )
        return Response({'message': 'Registration successful', 'token': parent.token, 'parent_id': parent.id})
    except Guardian.DoesNotExist:
        return Response({'error': 'Guardian not found'}, status=status.HTTP_404_NOT_FOUND)
    

from rest_framework.permissions import IsAuthenticated

class ParentInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    
    def get_queryset(self):
        token = self.request.headers.get('Authorization', '').replace('Bearer ', '')
        try:
            parent = ParentUser.objects.get(token=token)
            student_ids = parent.guardian.student_set.values_list('id', flat=True)
            return Invoice.objects.filter(student_id__in=student_ids)
        except ParentUser.DoesNotExist:
            return Invoice.objects.none()

class ParentPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        token = self.request.headers.get('Authorization', '').replace('Bearer ', '')
        try:
            parent = ParentUser.objects.get(token=token)
            student_ids = parent.guardian.student_set.values_list('id', flat=True)
            return Payment.objects.filter(invoice__student_id__in=student_ids)
        except ParentUser.DoesNotExist:
            return Payment.objects.none()

    def create(self, request, *args, **kwargs):
        request.data._mutable = True
        request.data['verified_by'] = 'Parent'
        return super().create(request, *args, **kwargs)
    
def send_payment_confirmation_email(payment, invoice, guardian):
    """Send email confirmation to parent when payment is confirmed"""
    subject = f"Payment Confirmed - {invoice.student.full_name}"
    
    message = f"""
    Dear {guardian.full_name},

    Your payment has been successfully verified and confirmed by the school.

    Payment Details:
    ─────────────────────────────
    Student: {invoice.student.full_name}
    Invoice Reference: {invoice.reference_code}
    Month: {invoice.month}
    Amount Paid: {payment.amount_paid} ETB
    Payment Method: {dict(payment.CHANNEL_CHOICES).get(payment.channel, payment.channel)}
    Confirmed Date: {payment.verified_at.strftime('%B %d, %Y')}
    ─────────────────────────────

    Thank you for paying on time. If you have any questions, please contact the school's finance office.

    Best regards,
    School Finance Team
    """
    
    if guardian.email:
        send_mail(
            subject,
            message,
            'noreply@schoolfees.com',
            [guardian.email],
            fail_silently=True
        )
from rest_framework import serializers
from .models import Class, Student, Guardian, Invoice, Payment

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    guardians = GuardianSerializer(many=True, read_only=True)
    student_class = ClassSerializer(read_only=True)
    student_class_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(), source='student_class', write_only=True
    )

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'student_class', 'student_class_id', 'guardians']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'
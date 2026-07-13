from django.db import models
import secrets

class Class(models.Model):
    name = models.CharField(max_length=100)  # e.g. "Grade 7B"
    term = models.CharField(max_length=50)   # e.g. "Term 2 2025/26"

    def __str__(self):
        return f"{self.name} - {self.term}"

class Student(models.Model):
    full_name = models.CharField(max_length=200)
    student_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.full_name

class Guardian(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='guardians')
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    def __str__(self):
        return f"{self.full_name} (parent of {self.student.full_name})"

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('pending', 'Pending Verification'),
        ('paid', 'Paid'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    reference_code = models.CharField(max_length=50, unique=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=30)  # e.g. "July 2026"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reference_code} - {self.student.full_name} - {self.status}"

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]
    CHANNEL_CHOICES = [
        ('cash', 'Cash at School'),
        ('bank', 'Bank Receipt'),
        ('mobile', 'Mobile Banking'),
    ]
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    bank_reference = models.CharField(max_length=100, blank=True)
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.CharField(max_length=100, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.invoice.reference_code} - {self.channel} - {self.status}"

class AdminUser(models.Model):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)  # e.g. "Finance Officer"
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class ParentUser(models.Model):
    guardian = models.OneToOneField(Guardian, on_delete=models.CASCADE, related_name='parent_user')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    token = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} - {self.guardian.full_name}"
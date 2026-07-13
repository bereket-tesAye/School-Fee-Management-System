from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'classes', views.ClassViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'guardians', views.GuardianViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'parent/invoices', views.ParentInvoiceViewSet, basename='parent-invoices')
router.register(r'parent/payments', views.ParentPaymentViewSet, basename='parent-payments')

urlpatterns = [
    path('', include(router.urls)),
    path('parent/login/', views.parent_login),
    path('parent/register/', views.parent_register),
]
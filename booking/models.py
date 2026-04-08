from django.contrib.auth.models import User
from django.db import models


class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    phone = models.CharField(max_length=20, blank=True)
    vehicle_number = models.CharField(max_length=50, blank=True)
    current_location = models.CharField(max_length=255, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username} driver profile'


class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    AMBULANCE_BASIC = 'basic'
    AMBULANCE_ADVANCED = 'advanced'
    AMBULANCE_TRANSFER = 'transfer'

    AMBULANCE_CHOICES = [
        (AMBULANCE_BASIC, 'Basic Life Support'),
        (AMBULANCE_ADVANCED, 'Advanced Life Support'),
        (AMBULANCE_TRANSFER, 'Inter-Hospital Transfer'),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_bookings')
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_bookings')
    pickup_address = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    patient_phone = models.CharField(max_length=20, blank=True)
    ambulance_type = models.CharField(max_length=20, choices=AMBULANCE_CHOICES, default=AMBULANCE_BASIC)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    current_location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Booking #{self.id} - {self.patient.username}'
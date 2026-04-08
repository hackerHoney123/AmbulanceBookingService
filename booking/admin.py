from django.contrib import admin

from .models import Booking, DriverProfile


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'vehicle_number', 'current_location', 'is_available')
    search_fields = ('user__username', 'user__email', 'phone', 'vehicle_number')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'driver', 'status', 'pickup_address', 'destination', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('patient__username', 'patient__email', 'driver__username', 'pickup_address', 'destination')
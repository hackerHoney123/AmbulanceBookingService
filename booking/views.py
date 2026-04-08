from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group, User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from .models import Booking, DriverProfile


def _is_driver(user):
    return hasattr(user, 'driver_profile')


def home(request):
    return render(request, 'index.html')


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        if not email or not password:
            messages.error(request, 'Please enter both email and password')
            return render(request, 'login.html')

        user_qs = User.objects.filter(email__iexact=email).order_by('-id')
        if not user_qs.exists():
            messages.error(request, 'Incorrect email or password')
            return render(request, 'login.html')

        # If duplicate email rows exist in legacy data, use the latest account
        # to keep login behavior consistent instead of raising an exception.
        user_obj = user_qs.first()

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            messages.error(request, 'Incorrect email or password')
            return render(request, 'login.html')

        auth_login(request, user)
        if user.is_staff or user.is_superuser:
            return redirect('/admin/')
        if _is_driver(user):
            return redirect('driver_dashboard')
        return redirect('patient_dashboard')

    return render(request, 'login.html')


def signup_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        role = request.POST.get('role', 'patient')
        phone = request.POST.get('phone', '').strip()
        vehicle_number = request.POST.get('vehicle_number', '').strip()

        if not username or not email or not password:
            messages.error(request, 'Please fill in all required fields')
            return render(request, 'login.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, 'login.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return render(request, 'login.html')

        user = User.objects.create_user(username=username, email=email, password=password)
        if role == 'driver':
            DriverProfile.objects.create(
                user=user,
                phone=phone,
                vehicle_number=vehicle_number,
            )
            drivers_group, _ = Group.objects.get_or_create(name='drivers')
            user.groups.add(drivers_group)

        auth_login(request, user)
        if role == 'driver':
            messages.success(request, 'Driver account created successfully')
            return redirect('driver_dashboard')

        messages.success(request, 'Account created successfully')
        return redirect('patient_dashboard')

    return render(request, 'login.html')


def logout_view(request):
    auth_logout(request)
    return redirect('home')


def admin_logout(request):
    auth_logout(request)
    return redirect('home')
@login_required(login_url='login')
def patient_dashboard(request):
    if request.user.is_staff or request.user.is_superuser:
        return redirect('/admin/')

    if _is_driver(request.user):
        return redirect('driver_dashboard')

    if request.method == 'POST':
        pickup_address = request.POST.get('pickup_address', '').strip()
        destination = request.POST.get('destination', '').strip()
        patient_phone = request.POST.get('patient_phone', '').strip()
        ambulance_type = request.POST.get('ambulance_type', Booking.AMBULANCE_BASIC)

        if not pickup_address or not destination:
            messages.error(request, 'Pickup address and destination are required')
        else:
            Booking.objects.create(
                patient=request.user,
                pickup_address=pickup_address,
                destination=destination,
                patient_phone=patient_phone,
                ambulance_type=ambulance_type,
            )
            messages.success(request, 'Booking submitted successfully. Waiting for driver acceptance.')
            return redirect('patient_dashboard')

    status_filter = request.GET.get('status', 'all')
    bookings_qs = Booking.objects.filter(patient=request.user).select_related('driver').order_by('-created_at')
    if status_filter in {Booking.STATUS_PENDING, Booking.STATUS_ACCEPTED, Booking.STATUS_COMPLETED}:
        bookings_qs = bookings_qs.filter(status=status_filter)

    all_bookings = Booking.objects.filter(patient=request.user)
    stats = {
        'total': all_bookings.count(),
        'pending': all_bookings.filter(status=Booking.STATUS_PENDING).count(),
        'accepted': all_bookings.filter(status=Booking.STATUS_ACCEPTED).count(),
        'completed': all_bookings.filter(status=Booking.STATUS_COMPLETED).count(),
    }

    return render(
        request,
        'patient_dashboard.html',
        {
            'bookings': bookings_qs,
            'stats': stats,
            'status_filter': status_filter,
        },
    )


@login_required(login_url='login')
def driver_dashboard(request):
    if request.user.is_staff or request.user.is_superuser:
        return redirect('/admin/')

    if not _is_driver(request.user):
        return redirect('patient_dashboard')

    driver_profile = request.user.driver_profile
    pending_bookings = Booking.objects.filter(status=Booking.STATUS_PENDING).select_related('patient').order_by('-created_at')
    my_bookings = Booking.objects.filter(driver=request.user).select_related('patient').order_by('-created_at')
    active_bookings = my_bookings.filter(status=Booking.STATUS_ACCEPTED)
    completed_bookings = my_bookings.filter(status=Booking.STATUS_COMPLETED)
    stats = {
        'pending_pool': pending_bookings.count(),
        'active': active_bookings.count(),
        'completed': completed_bookings.count(),
    }

    return render(
        request,
        'driver_dashboard.html',
        {
            'driver_profile': driver_profile,
            'pending_bookings': pending_bookings,
            'my_bookings': my_bookings,
            'active_bookings': active_bookings,
            'completed_bookings': completed_bookings,
            'stats': stats,
        },
    )


@login_required(login_url='login')
def cancel_booking(request, booking_id):
    if request.method != 'POST':
        return redirect('patient_dashboard')

    booking = get_object_or_404(Booking, id=booking_id, patient=request.user)
    if booking.status != Booking.STATUS_PENDING:
        messages.error(request, 'Only pending bookings can be cancelled')
        return redirect('patient_dashboard')

    booking.delete()
    messages.success(request, 'Booking cancelled successfully')
    return redirect('patient_dashboard')


@login_required(login_url='login')
def complete_booking(request, booking_id):
    if request.method != 'POST':
        return redirect('driver_dashboard')

    if not _is_driver(request.user):
        messages.error(request, 'Only drivers can complete bookings')
        return redirect('patient_dashboard')

    booking = get_object_or_404(Booking, id=booking_id, driver=request.user)
    if booking.status != Booking.STATUS_ACCEPTED:
        messages.error(request, 'Only accepted bookings can be marked completed')
        return redirect('driver_dashboard')

    booking.status = Booking.STATUS_COMPLETED
    booking.save(update_fields=['status', 'updated_at'])
    messages.success(request, f'Booking #{booking.id} marked as completed')
    return redirect('driver_dashboard')


@login_required(login_url='login')
def accept_booking(request, booking_id):
    if not _is_driver(request.user):
        messages.error(request, 'Only drivers can accept bookings')
        return redirect('patient_dashboard')

    booking = get_object_or_404(Booking, id=booking_id)
    if booking.status != Booking.STATUS_PENDING:
        messages.error(request, 'This booking has already been processed')
        return redirect('driver_dashboard')

    driver_profile = request.user.driver_profile
    booking.driver = request.user
    booking.status = Booking.STATUS_ACCEPTED
    booking.current_location = driver_profile.current_location
    booking.accepted_at = timezone.now()
    booking.save(update_fields=['driver', 'status', 'current_location', 'accepted_at', 'updated_at'])

    messages.success(request, 'Booking accepted')
    return redirect('driver_dashboard')


@login_required(login_url='login')
def update_driver_location(request):
    if not _is_driver(request.user):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'ok': False, 'error': 'Only drivers can update location'}, status=403)
        messages.error(request, 'Only drivers can update location')
        return redirect('patient_dashboard')

    if request.method != 'POST':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'ok': False, 'error': 'POST required'}, status=405)
        return redirect('driver_dashboard')

    current_location = request.POST.get('current_location', '').strip()
    lat = request.POST.get('latitude', '').strip()
    lng = request.POST.get('longitude', '').strip()
    if lat and lng:
        current_location = f'Lat {lat}, Lng {lng}'

    driver_profile = request.user.driver_profile
    driver_profile.current_location = current_location
    driver_profile.save(update_fields=['current_location'])

    Booking.objects.filter(driver=request.user, status=Booking.STATUS_ACCEPTED).update(current_location=current_location)

    is_silent = request.POST.get('silent') == '1'
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        return JsonResponse({'ok': True, 'current_location': current_location})

    if not is_silent:
        messages.success(request, 'Current location updated')
    return redirect('driver_dashboard')
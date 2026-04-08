from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('admin/logout/', views.admin_logout, name='admin_logout'),
    path('dashboard/patient/', views.patient_dashboard, name='patient_dashboard'),
    path('dashboard/driver/', views.driver_dashboard, name='driver_dashboard'),
    path('booking/<int:booking_id>/accept/', views.accept_booking, name='accept_booking'),
    path('driver/location/', views.update_driver_location, name='update_driver_location'),
]
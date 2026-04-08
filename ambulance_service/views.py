from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from django.contrib import messages


def home(request):
    return render(request, 'index.html')

def login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        try:
            user = User.objects.get(email=email)
            user = authenticate(request, username=user.username, password=password)
            if user is not None:
                auth_login(request, user)
                messages.success(request, f'Welcome {user.username}!')
                return redirect('home')
            else:
                messages.error(request, 'Invalid password')
        except User.DoesNotExist:
            messages.error(request, 'User not found')
        
        return render(request, 'login.html')
    
    return render(request, 'login.html')

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            auth_login(request, user)
            messages.success(request, f'Account created successfully! Welcome {username}!')
            return redirect('home')
        
        return render(request, 'login.html')
    
    return render(request, 'login.html')
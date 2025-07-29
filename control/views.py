from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required

# --- VIEWS YANG SUDAH ADA (DENGAN DECORATOR) ---

@login_required # Melindungi halaman ini
def index_view(request):
    """
    Menampilkan halaman kendali robot.
    Hanya bisa diakses oleh user yang sudah login.
    """
    return render(request, 'control/index.html')

@login_required # Melindungi halaman ini
def monitoring_view(request):
    """
    Menampilkan halaman monitoring.
    Hanya bisa diakses oleh user yang sudah login.
    """
    return render(request, 'control/monitoring.html')


# --- VIEWS BARU UNTUK AUTENTIKASI ---

def register_view(request):
    """
    Menangani registrasi user baru.
    """
    if request.user.is_authenticated:
        return redirect('monitoring') # Jika sudah login, lempar ke halaman utama

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) # Langsung login setelah registrasi berhasil
            return redirect('monitoring') 
    else:
        form = UserCreationForm()
    return render(request, 'control/register.html', {'form': form})

def login_view(request):
    """
    Menangani login user.
    """
    if request.user.is_authenticated:
        return redirect('monitoring') # Jika sudah login, lempar ke halaman utama

    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            # Arahkan ke halaman yang tadinya mau dituju, atau ke monitoring jika tidak ada
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('monitoring')
    else:
        form = AuthenticationForm()
    return render(request, 'control/login.html', {'form': form})

def logout_view(request):
    """
    Menangani logout user.
    Hanya bisa diakses via metode POST untuk keamanan.
    """
    if request.method == 'POST':
        logout(request)
        return redirect('login') # Arahkan kembali ke halaman login
    # Jika diakses via GET, bisa arahkan ke halaman utama atau login
    return redirect('login')
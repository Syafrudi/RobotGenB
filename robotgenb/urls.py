from django.contrib import admin
from django.urls import path, include # <--- PASTIKAN 'include' SUDAH DI-IMPOR

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('control.urls')), # <--- TAMBAHKAN BARIS INI
]
from django.urls import path
from . import views # Impor views dari folder yang sama

urlpatterns = [
    # Jika URL kosong (homepage), panggil fungsi 'index_view'.
    # name='index' digunakan oleh tag {% url 'index' %} di template.
    path('', views.index_view, name='index'),

    # Jika URL adalah 'monitoring/', panggil fungsi 'monitoring_view'.
    # name='monitoring' digunakan oleh tag {% url 'monitoring' %} di template.
    path('monitoring/', views.monitoring_view, name='monitoring'),
]
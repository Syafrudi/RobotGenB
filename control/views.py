from django.shortcuts import render
import json # Kita akan butuh ini nanti untuk data sensor

# View untuk halaman kendali utama (index.html)
def index_view(request):
    # Fungsi ini hanya merender template index.html
    return render(request, 'control/index.html')

# View untuk halaman monitoring (monitoring.html)
def monitoring_view(request):
    # Untuk sekarang, kita siapkan struktur data yang akan dikirim ke template.
    # Ini mensimulasikan data yang nanti akan kita ambil dari database.
    
    # 1. Daftar sensor untuk loop {% for %} di template
    sensors_list = [
        {'id': 1},
        {'id': 2},
        {'id': 3},
        {'id': 4},
    ]

    # 2. Data awal untuk grafik (format JSON seperti yang kita siapkan di HTML)
    # Ini akan mengisi grafik saat halaman pertama kali dimuat.
    sensor_initial_data = {
        "1": [{"time": "00:00", "value": 65}],
        "2": [{"time": "00:00", "value": 72}],
        "3": [{"time": "00:00", "value": 58}],
        "4": [{"time": "00:00", "value": 81}],
    }

    # Kita akan membungkus data JSON ini dalam tag <script> agar bisa dibaca oleh JavaScript.
    # Ini adalah 'jembatan' antara backend Django dan frontend JavaScript.
    sensor_data_json = f"""
    <script id="sensor-data" type="application/json">
    {json.dumps(sensor_initial_data)}
    </script>
    """

    # Gabungkan semua data yang ingin dikirim ke template dalam sebuah dictionary
    context = {
        'sensors': sensors_list,
        'sensor_data_json': sensor_data_json,
    }
    
    # Render template monitoring.html dan kirim 'context' ke dalamnya
    return render(request, 'control/monitoring.html', context)
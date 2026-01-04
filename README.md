🧾 Giới thiệu

Petorium là một website dùng để quản lý phòng khám cho thú cưng, được làm như một bài tập môn Cơ sở dữ liệu Web. 
GitHub

📦 Hướng dẫn chạy dự án
1. Clone mã nguồn

git clone https://github.com/nardouhn/Petorium.git

cd Petorium



2. Thiết lập môi trường

Mở Docker Desktop và mở VS Code, sau đó mở Terminal và chạy các lệnh sau:

🐾 Nếu chạy lần đầu:
# Tạo dữ liệu mặc định cho backend
docker exec backend_flask_app python /app/scripts/seed_defaults.py

# Nếu dùng Git Bash cần chuyển dòng cho script
dos2unix backend/docker-entrypoint.sh

chmod +x backend/docker-entrypoint.sh

# Khởi động database và nạp dữ liệu
docker compose up -d db && sleep 2 && \
cat insert_data.sql | docker compose exec -T db psql -U postgres -d vet_clinic

# Chạy các trigger (nếu có)
cat triggers.sql | docker compose exec -T db psql -U postgres -d vet_clinic


GitHub

🛠️ Chạy ứng dụng

Sau khi thiết lập xong lần đầu:

docker compose up


(Khởi động toàn bộ ứng dụng bằng Docker Compose) 
GitHub

🐶 Mục đích

Đây là một hệ thống website quản lý phòng khám thú cưng, với backend, frontend, database và các thành phần cần thiết để chạy.

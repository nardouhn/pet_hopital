git clone https://github.com/nardouhn/Petorium.git

cd Petorium

git worktree add ../backend backend

Mở Docker Desktop

## Window ##

Mở VS Code và chạy trong Terminal:

# Chạy thêm nếu lần đầu:

(powershell) docker exec backend_flask_app python /app/scripts/seed_defaults.py

(git bash)  dos2unix /backend2/backend/docker-entrypoint.sh

(git bash)  chmod +x /backend2/backend/docker-entrypoint.sh

(git bash) docker compose up -d db && sleep 2 && cat insert_data.sql | docker compose exec -T db psql -U postgres -d vet_clinic

cat triggers.sql | docker compose exec -T db psql -U postgres -d vet_clinic 

# Chạy lần sau:
(powershell) docker compose up

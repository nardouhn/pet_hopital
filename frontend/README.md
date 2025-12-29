🔹 Bước 0: Kiểm tra đã cài Git chưa

Mở Terminal / Command Prompt và chạy:

git --version


Nếu hiện phiên bản (vd: git version 2.43.0) → OK

Nếu báo lỗi → cần cài Git trước: https://git-scm.com



# Window: Mở Terminal / Command Prompt và chạy: #

git clone https://github.com/nardouhn/Petorium.git

cd pet_hopital

git branch -a

git checkout frontend

git pull

npm install

npm run dev

# Mở Terminal trên macOS #

cd ~

mkdir Projects

cd Projects

git clone https://github.com/nardouhn/Petorium.git

cd pet_hopital

git branch -a

git checkout frontend

git pull origin frontend

cd frontend

npm install

npm run dev

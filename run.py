from app import create_app
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # tạo table DB nếu chưa có
    # Chạy Flask lắng nghe tất cả IP trong container, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
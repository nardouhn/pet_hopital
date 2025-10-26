# Chọn base image Python nhẹ
FROM python:3.11-slim

# Set thư mục làm việc trong container
WORKDIR /app

# Copy requirements và cài package
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ project vào container
COPY . .

# Expose port mà Flask chạy
EXPOSE 5000

# Chạy backend Flask
CMD ["python", "run.py"]

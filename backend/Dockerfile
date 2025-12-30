FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y build-essential libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt ./
RUN echo '--- requirements.txt (build debug) ---' && cat requirements.txt && echo '--- end ---'
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh || true

EXPOSE 8080

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "run:app", "--workers", "2"]

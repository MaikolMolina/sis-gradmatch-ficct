# SIS-GradMatch: Sistema Inteligente de Gestion de Proyectos de Grado
# FICCT - UAGRM | Semestre II-2026
# Autor: Molina Cortez Maikol Anthony

FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar modulos de la solucion
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY sitio_web_corporativo/ ./sitio_web_corporativo/
COPY mobile/build/web/ ./mobile/build/web/

# Crear directorios para persistencia de archivos subidos y base de datos
RUN mkdir -p /app/storage/drafts /app/storage/profiles /app/storage/documents

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080 8000

# Ejecutar servidor FastAPI respetando la variable PORT provista por Google Cloud Run
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]

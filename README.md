# SIS-GradMatch: Sistema Inteligente de Gestión de Proyectos de Grado y Asignación Automatizada con Machine Learning

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)
![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Cloud_Run-4285F4?logo=googlecloud)
![Licencia](https://img.shields.io/badge/License-Academic_FICCT-darkred.svg)

**SIS-GradMatch** es una plataforma integral desarrollada para la **Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)** de la **Universidad Autónoma Gabriel René Moreno (UAGRM)**, orientada a optimizar el ciclo de vida de los proyectos y tesis de grado en la carrera de **Ingeniería en Sistemas**.

El sistema integra un motor de emparejamiento inteligente basado en Procesamiento de Lenguaje Natural (TF-IDF y Similitud de Coseno), control de tribunales revisores balanceados por balanceo de carga, seguimiento de borradores y observaciones en tiempo real, portal web SPA para estudiantes, docentes y directores de carrera, y aplicación móvil híbrida multiplataforma.

---

## 🏛️ Datos Académicos e Institucionales

* **Institución:** Universidad Autónoma Gabriel René Moreno (UAGRM)
* **Facultad:** Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)
* **Carrera:** Ingeniería en Sistemas (Plan 187-3)
* **Materia:** Ingeniería de Software II (INF512-SB) & Taller de Grado
* **Desarrollador:** Molina Cortez Maikol Anthony
* **Docente Guía:** Ing. Rolando Antoni Martínez Canedo
* **Director de Carrera:** M.Sc. Ing. Leonardo Vargas Peña
* **Periodo de Desarrollo:** Semestre II-2026 (6 semanas de iteración continua hasta el 18/11/2026)

---

## 🏗️ Arquitectura del Sistema

La solución adopta una arquitectura en capas, desacoplada y orientada a servicios (Microservicios / Monolito Modular Cloud-Ready):

```
                               ┌────────────────────────────────┐
                               │        Clientes / UI           │
                               └───────┬───────────────┬────────┘
                                       │               │
                     ┌─────────────────┴─┐   ┌─────────┴─────────────┐
                     │  Portal Web SPA   │   │ App Móvil Flutter     │
                     │  (HTML5/CSS3/JS)  │   │ (Android / iOS / Web) │
                     └─────────────────┬─┘   └─────────┬─────────────┘
                                       │               │
                                       ▼               ▼
                               ┌────────────────────────────────┐
                               │   REST API Gateway & Backend   │
                               │  FastAPI (Python 3.12 Asínc.)  │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────┬───────┴───────────────────────┐
               │                       │                               │
               ▼                       ▼                               ▼
    ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
    │ Motor ML Matchmaking ││   Base de Datos      ││ Almacenamiento Seguro│
    │  TF-IDF + Coseno     ││  SQLAlchemy / SQLite ││  /storage/drafts     │
    │  Asignación Docente  ││  (Cloud SQL Ready)   ││  Documentos & Tesis  │
    └──────────────────────┘└──────────────────────┘└──────────────────────┘
```

### Componentes Principales

1. **Backend REST API (`/backend`):**
   - Construido sobre **FastAPI** y **Python 3.12**, con soporte nativo de asincronía (`async/await`).
   - Autenticación JWT (`PyJWT`) con control de roles (`ESTUDIANTE`, `DOCENTE_GUIA`, `DOCENTE_REVISOR`, `JEFE_CARRERA`).
   - Algoritmo de Matchmaking semántico basado en vectorización TF-IDF con ponderación de carga académica activa para evitar saturación de docentes tutores y tribunales.
   - Puntos de entrada para gestión de perfiles, seguimiento de borradores, dictamen de tribunales y analíticas de titulación.

2. **Portal Web SPA (`/frontend`):**
   - Single-Page Application responsiva construida con estándares modernos (HTML5, TailwindCSS / CSS variables, ES6 Modules).
   - Paneles diferenciados con navegación fluida sin recargas:
     - **Panel Estudiante:** Registro de perfil, simulación y postulación a docentes sugeridos por IA, subida y seguimiento de borradores/observaciones.
     - **Panel Docente:** Aceptación/rechazo de tutorías, revisión de capítulos y retroalimentación granular.
     - **Panel Director / CPD:** Dashboard de analíticas de titulación, asignación de tribunales y reportes.

3. **Aplicación Móvil (`/mobile`):**
   - Implementada en **Flutter 3** con lenguaje **Dart**.
   - Arquitectura basada en Provider/StatefulWidgets para gestión de estado reactivo.
   - Funciona nativamente en **Android**, **iOS** y compilada para **Web** (alojada y servida directamente desde `/mobile`).

4. **Sitio Web Corporativo (`/sitio_web_corporativo`):**
   - Landing page institucional de presentación y divulgación del proyecto FICCT, accesible vía `/corporativo`.

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Python 3.11 o 3.12
* Git
* (Opcional) Docker y Docker Compose
* (Opcional) Flutter SDK 3.x para compilación móvil

### Opción 1: Ejecución Directa con Python

```bash
# 1. Clonar el repositorio
git clone https://github.com/MaikolMolina/sis-gradmatch-ficct.git
cd sis-gradmatch-ficct

# 2. Crear y activar entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Iniciar el servidor
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Una vez iniciado, el sistema estará disponible en:
* **Portal Web Estudiantes / Docentes:** [http://localhost:8000/portal](http://localhost:8000/portal)
* **App Móvil (Web Build):** [http://localhost:8000/mobile](http://localhost:8000/mobile)
* **Sitio Corporativo:** [http://localhost:8000/corporativo](http://localhost:8000/corporativo)
* **Documentación Swagger / OpenAPI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Opción 2: Ejecución con Docker

```bash
# Construir la imagen Docker
docker build -t sis-gradmatch:latest .

# Ejecutar el contenedor
docker run -d -p 8000:8080 --name sis-gradmatch-app sis-gradmatch:latest
```

Acceso disponible en `http://localhost:8000/portal`.

---

## ☁️ Despliegue en Google Cloud Platform (Cloud Run)

El sistema está configurado para despliegue automatizado sin servidor (*serverless*) en **Google Cloud Run**:

```bash
# Autenticar con Google Cloud
gcloud auth login
gcloud config set project gradmatch-uagrm-2026-515209

# Construir imagen con Cloud Build
gcloud builds submit --tag gcr.io/gradmatch-uagrm-2026-515209/gradmatch-service:latest

# Desplegar en Cloud Run con escalamiento automático
gcloud run deploy gradmatch-service \
    --image gcr.io/gradmatch-uagrm-2026-515209/gradmatch-service:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080
```

---

## 🧪 Pruebas Unitarias y de Integración

El proyecto cuenta con una suite completa de pruebas unitarias y de integración desarrolladas con `pytest`:

```bash
# Ejecutar todas las pruebas
pytest backend/tests/ -v

# Ejecutar con reporte de cobertura
pytest --cov=backend/app backend/tests/
```

Las pruebas cubren:
* Cálculo de similitud de cosenos y normalización TF-IDF.
* Algoritmo de asignación con restricciones de capacidad docente.
* Flujo de autenticación y verificación de roles JWT.
* Ciclo de vida de entregables, subida de documentos y resolución de observaciones.

---

## 📄 Licencia y Derechos de Autor

Desarrollado con fines académicos y de titulación en la **Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)** - **Universidad Autónoma Gabriel René Moreno (UAGRM)**.

© 2026 **Molina Cortez Maikol Anthony**. Todos los derechos reservados.

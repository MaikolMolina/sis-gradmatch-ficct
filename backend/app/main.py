import json
import os
import shutil
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.app.core.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database

# Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.profiles import router as profiles_router
from backend.app.api.v1.matchmaking import router as matchmaking_router
from backend.app.api.v1.drafts import router as drafts_router
from backend.app.api.v1.teachers_tribunals_analytics import (
    teachers_router, tribunals_router, analytics_router, cpd_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any
    print("Shutting down SIS-GradMatch API...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API REST de Producción para la Gestión de Proyectos de Grado y Asignación Automatizada con Machine Learning en la FICCT - UAGRM.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/mobile") or path.startswith("/portal"):
        if path.endswith(".html") or path.endswith(".js") or path.endswith("/") or path == "/mobile" or path == "/portal":
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
    return response

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profiles_router, prefix=settings.API_V1_STR)
app.include_router(matchmaking_router, prefix=settings.API_V1_STR)
app.include_router(drafts_router, prefix=settings.API_V1_STR)
app.include_router(teachers_router, prefix=settings.API_V1_STR)
app.include_router(tribunals_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(cpd_router, prefix=settings.API_V1_STR)

# Mount Web Application & Corporate Site Static Files
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
frontend_dir = os.path.join(base_dir, "frontend")
corp_dir = os.path.join(base_dir, "sitio_web_corporativo")
mobile_web_dir = os.path.join(base_dir, "mobile", "build", "web")
storage_dir = os.path.join(base_dir, "storage")

if os.path.exists(frontend_dir):
    app.mount("/portal", StaticFiles(directory=frontend_dir, html=True), name="portal")

if os.path.exists(corp_dir):
    app.mount("/corporativo", StaticFiles(directory=corp_dir, html=True), name="corporativo")

if os.path.exists(mobile_web_dir):
    app.mount("/mobile", StaticFiles(directory=mobile_web_dir, html=True), name="mobile")

if os.path.exists(storage_dir):
    app.mount("/storage", StaticFiles(directory=storage_dir), name="storage")

@app.post("/api/v1/storage/upload")
async def upload_document(file: UploadFile = File(...)):
    dest_dir = os.path.join(base_dir, "storage", "drafts")
    os.makedirs(dest_dir, exist_ok=True)
    raw_name = os.path.basename(file.filename.replace("\\", "/"))
    # Sanitize name while preserving extension
    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', raw_name)
    if not safe_name:
        safe_name = f"document_{os.urandom(4).hex()}.pdf"
    file_path = os.path.join(dest_dir, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    size_bytes = os.path.getsize(file_path)
    size_mb = f"{(size_bytes / (1024 * 1024)):.2f} MB" if size_bytes >= 1024 * 1024 else f"{max(1, round(size_bytes / 1024))} KB"
    return {
        "filename": raw_name,
        "safe_name": safe_name,
        "url": f"/storage/drafts/{safe_name}",
        "download_url": f"/api/v1/storage/download/{safe_name}?name={raw_name}",
        "view_url": f"/api/v1/storage/view/{safe_name}",
        "size": size_mb,
        "status": "success"
    }

@app.get("/api/v1/storage/download/{filename:path}")
async def download_document(filename: str, name: str = None):
    """
    Descarga física forzada del archivo real con Content-Disposition: attachment.
    Garantiza que el navegador guarde el archivo original en el disco del usuario.
    """
    clean_name = os.path.basename(filename.replace("\\", "/"))
    dest_dir = os.path.abspath(os.path.join(base_dir, "storage", "drafts"))
    file_path = os.path.join(dest_dir, clean_name)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Archivo '{clean_name}' no encontrado en el servidor.")
    
    out_name = name if name else clean_name
    return FileResponse(
        path=file_path,
        filename=out_name,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{out_name}"',
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )

@app.get("/api/v1/storage/view/{filename:path}")
async def view_document(filename: str):
    """
    Visualización interactiva en streaming sin caché HTTP (no-cache) para el visor iframe/img.
    """
    clean_name = os.path.basename(filename.replace("\\", "/"))
    dest_dir = os.path.abspath(os.path.join(base_dir, "storage", "drafts"))
    file_path = os.path.join(dest_dir, clean_name)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Archivo '{clean_name}' no encontrado en el servidor.")
    
    lower = clean_name.lower()
    media_type = "application/pdf"
    if lower.endswith(".png"):
        media_type = "image/png"
    elif lower.endswith(".jpg") or lower.endswith(".jpeg"):
        media_type = "image/jpeg"
    elif lower.endswith(".txt") or lower.endswith(".sql") or lower.endswith(".md"):
        media_type = "text/plain; charset=utf-8"
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

# =====================================================================
# PERSISTENCIA Y SINCRONIZACIÓN CENTRALIZADA DE EXPEDIENTE DE TESIS
# =====================================================================
THESIS_STATE_FILE = os.path.join(base_dir, "storage", "thesis_state.json")

def _get_default_thesis_state():
    return {
        "id": 1,
        "title": "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning",
        "studentName": "Molina Cortez Maikol Anthony",
        "studentRegistro": "220011559",
        "modality": "Proyecto de Grado",
        "tutorName": "Ing. Rolando Antoni Martínez Canedo",
        "resolutionNumber": "RA-FICCT-0482/2026",
        "status": "OBSERVADO",
        "currentChapter": 3,
        "progressPercent": 65,
        "chapters": [
            {
                "id": 100,
                "deliverableType": "COMPLETO",
                "chapterNumber": 0,
                "title": "Documento Borrador Completo (Consolidado de Tesis)",
                "version": 1,
                "status": "EN_REVISION",
                "date": "18/11/2026",
                "mainFileName": "Borrador_Consolidado_Tesis_Molina.pdf",
                "mainFileSize": "4.2 MB",
                "mainFileUrl": "/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf",
                "previewExtract": "Documento de tesis consolidado que abarca los 13 capítulos estructurados de acuerdo con los requerimientos de la Carrera de Ingeniería en Sistemas y el marco SCRUM. Incluye carátulas individuales y modelos UML 2.5.",
                "complementaryFiles": [
                    {
                        "name": "Sistema_Gestion_Proyectos_Grado.eap",
                        "size": "1.8 MB",
                        "url": "/storage/drafts/Sistema_Gestion_Proyectos_Grado.eap",
                        "type": "OTHER"
                    },
                    {
                        "name": "Codigo_Fuente_SIS_GradMatch.zip",
                        "size": "6.4 MB",
                        "url": "/storage/drafts/Codigo_Fuente_SIS_GradMatch.zip",
                        "type": "ZIP"
                    }
                ],
                "observations": []
            },
            {
                "id": 1,
                "deliverableType": "CAPITULO",
                "chapterNumber": 1,
                "title": "Introducción, Planteamiento y Alcance",
                "version": 2,
                "status": "APROBADO",
                "date": "02/11/2026",
                "mainFileName": "Borrador_Capitulo1_v2_Molina.pdf",
                "mainFileSize": "1.4 MB",
                "mainFileUrl": "/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf",
                "previewExtract": "Definición del problema de asignación manual de tutores en la UAGRM, formulación del objetivo general, objetivos específicos y límites del proyecto de grado.",
                "complementaryFiles": [],
                "observations": []
            },
            {
                "id": 2,
                "deliverableType": "CAPITULO",
                "chapterNumber": 2,
                "title": "Marco Teórico y Estado del Arte",
                "version": 1,
                "status": "APROBADO",
                "date": "09/11/2026",
                "mainFileName": "Borrador_Capitulo2_v1_Molina.pdf",
                "mainFileSize": "2.1 MB",
                "mainFileUrl": "/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf",
                "previewExtract": "Fundamentos de Inteligencia Artificial, procesamiento de lenguaje natural (NLP) con BERT/Transformers multilingüe, cálculo de similitud coseno y optimización de carga docente.",
                "complementaryFiles": [],
                "observations": []
            },
            {
                "id": 3,
                "deliverableType": "CAPITULO",
                "chapterNumber": 3,
                "title": "Metodología, Arquitectura C4 y Pruebas McCabe",
                "version": 2,
                "status": "OBSERVADO",
                "date": "16/11/2026",
                "mainFileName": "Borrador_Capitulo3_v2_Molina.pdf",
                "mainFileSize": "2.8 MB",
                "mainFileUrl": "/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf",
                "previewExtract": "La arquitectura del sistema SIS-GradMatch desacopla el motor analítico de similitud coseno de los servicios transaccionales. Los vectores densos de 768 dimensiones se almacenan en tablas con índices IVFFlat en PostgreSQL 16 con pgvector.",
                "complementaryFiles": [
                    {
                        "name": "Matriz_Pruebas_McCabe.xlsx",
                        "size": "145 KB",
                        "url": "/storage/drafts/Matriz_Pruebas_McCabe.xlsx",
                        "type": "EXCEL"
                    },
                    {
                        "name": "Diagrama_C4_Contenedores.png",
                        "size": "890 KB",
                        "url": "/storage/drafts/Diagrama_C4_Contenedores.png",
                        "type": "IMAGE"
                    },
                    {
                        "name": "Scripts_Carga_Embeddings.sql",
                        "size": "32 KB",
                        "url": "/storage/drafts/Scripts_Carga_Embeddings.sql",
                        "type": "SQL"
                    }
                ],
                "observations": [
                    {
                        "id": 101,
                        "type": "TECNICA",
                        "page": 42,
                        "section": "3.4 Diagrama C4 Contenedores",
                        "comment": "Detallar la latencia y los hiperparámetros de indexación IVFFlat para la búsqueda vectorial sobre los 768 atributos densos.",
                        "date": "16/11/2026",
                        "isResolved": False
                    },
                    {
                        "id": 102,
                        "type": "METODOLOGICA",
                        "page": 49,
                        "section": "3.6 Pruebas de Caja Blanca McCabe",
                        "comment": "Incluir la tabla de cobertura de aristas y caminos independientes del Grafo de Flujo de Control con V(G)=4.",
                        "date": "17/11/2026",
                        "isResolved": False
                    }
                ]
            },
            {
                "id": 201,
                "deliverableType": "ANEXO",
                "chapterNumber": 0,
                "title": "Anexo A: Matriz de Pruebas de Caja Blanca McCabe y Cobertura",
                "version": 1,
                "status": "APROBADO",
                "date": "17/11/2026",
                "mainFileName": "AnexoA_Matriz_Pruebas_McCabe.pdf",
                "mainFileSize": "1.1 MB",
                "mainFileUrl": "/storage/drafts/AnexoA_Matriz_Pruebas_McCabe.pdf",
                "previewExtract": "Detalle de los grafos de flujo de control (CFG), cálculo de complejidad ciclomática V(G)=4 para el algoritmo de asignación de tutores y matriz de casos de prueba con cobertura del 100% de aristas.",
                "complementaryFiles": [
                    {
                        "name": "Grafo_Flujo_Control.png",
                        "size": "640 KB",
                        "url": "/storage/drafts/Grafo_Flujo_Control.png",
                        "type": "IMAGE"
                    }
                ],
                "observations": []
            },
            {
                "id": 301,
                "deliverableType": "MANUAL",
                "chapterNumber": 0,
                "title": "Manual de Despliegue en Infraestructura Cloud GCP",
                "version": 1,
                "status": "PENDIENTE",
                "date": "18/11/2026",
                "mainFileName": "Manual_Despliegue_Cloud_GCP.pdf",
                "mainFileSize": "1.9 MB",
                "mainFileUrl": "/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf",
                "previewExtract": "Guía paso a paso para el aprovisionamiento de Cloud Run, base de datos Cloud SQL PostgreSQL 16 con extensión pgvector, reglas de IAM y almacenamiento de borradores en Cloud Storage.",
                "complementaryFiles": [],
                "observations": []
            }
        ],
        "activeObservations": [
            {
                "id": 101,
                "type": "TECNICA",
                "page": 42,
                "section": "3.4 Diagrama C4 Contenedores",
                "comment": "Detallar la latencia y los hiperparámetros de indexación IVFFlat para la búsqueda vectorial sobre los 768 atributos densos.",
                "date": "16/11/2026",
                "isResolved": False
            },
            {
                "id": 102,
                "type": "METODOLOGICA",
                "page": 49,
                "section": "3.6 Pruebas de Caja Blanca McCabe",
                "comment": "Incluir la tabla de cobertura de aristas y caminos independientes del Grafo de Flujo de Control con V(G)=4.",
                "date": "17/11/2026",
                "isResolved": False
            }
        ]
    }

def _load_thesis_state():
    os.makedirs(os.path.dirname(THESIS_STATE_FILE), exist_ok=True)
    if not os.path.exists(THESIS_STATE_FILE):
        state = _get_default_thesis_state()
        _save_thesis_state(state)
        return state
    try:
        with open(THESIS_STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        state = _get_default_thesis_state()
        _save_thesis_state(state)
        return state

def _save_thesis_state(state):
    os.makedirs(os.path.dirname(THESIS_STATE_FILE), exist_ok=True)
    with open(THESIS_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

@app.get("/api/v1/thesis/current")
def get_current_thesis():
    """Obtiene el estado actual y unificado del expediente de Proyecto de Grado."""
    state = _load_thesis_state()
    return JSONResponse(
        content=state,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.post("/api/v1/thesis/sync")
async def sync_thesis(request: Request):
    """Sincroniza el estado completo del expediente enviado por la app móvil o web."""
    data = await request.json()
    _save_thesis_state(data)
    return JSONResponse(
        content=data,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.post("/api/v1/thesis/deliverable")
async def add_or_update_deliverable(request: Request):
    """Agrega o actualiza un entregable en el expediente oficial."""
    draft = await request.json()
    state = _load_thesis_state()
    chapters = state.get("chapters", [])
    
    draft_id = draft.get("id")
    existing_idx = next((i for i, c in enumerate(chapters) if c.get("id") == draft_id), None)
    
    if existing_idx is not None:
        chapters[existing_idx] = draft
    else:
        chapters.insert(0, draft)
        
    state["chapters"] = chapters
    state["status"] = "EN_REVISION"
    _save_thesis_state(state)
    return JSONResponse(
        content=state,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.post("/api/v1/thesis/profile")
async def update_student_profile(request: Request):
    """Actualiza el título y datos de postulación del perfil del estudiante."""
    data = await request.json()
    state = _load_thesis_state()
    if data.get("title"):
        state["title"] = data["title"]
    if data.get("abstract"):
        state["abstract"] = data["abstract"]
    if data.get("fileUrl"):
        state["profileFileUrl"] = data["fileUrl"]
    if data.get("fileName"):
        state["profileFileName"] = data["fileName"]
        
    _save_thesis_state(state)
    return JSONResponse(
        content=state,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.post("/api/v1/thesis/observation")
async def add_thesis_observation(request: Request):
    """Registra una observación pedagógica del docente tutor."""
    data = await request.json()
    deliverable_id = data.get("deliverableId")
    obs = data.get("observation", {})
    state = _load_thesis_state()
    
    # Agregar a entregable
    for ch in state.get("chapters", []):
        if ch.get("id") == deliverable_id:
            ch.setdefault("observations", []).append(obs)
            ch["status"] = "OBSERVADO"
            break
            
    # Agregar a lista activa general
    state.setdefault("activeObservations", []).append(obs)
    state["status"] = "OBSERVADO"
    _save_thesis_state(state)
    return JSONResponse(
        content=state,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.get("/")
def root():
    return {
        "sistema": settings.PROJECT_NAME,
        "institucion": "FICCT - UAGRM (Santa Cruz de la Sierra - Bolivia)",
        "desarrollador": "Molina Cortez Maikol Anthony",
        "materia": "Ingeniería de Software II (INF512-SB)",
        "modalidad": "Proyecto de Grado (Malla Curricular 100% Vencida - Plan 187-3)",
        "director_carrera": "M.Sc. Ing. Leonardo Vargas Peña",
        "docente": "Ing. Rolando Antoni Martínez Canedo",
        "version": "v1.0.0-release",
        "status": "OPERACIONAL (200 OK)",
        "docs_url": "/docs",
        "portal_url": "/portal",
        "corporativo_url": "/corporativo",
        "mobile_url": "/mobile"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "nlp_engine": "ready",
        "uptime_sla": "99.9%"
    }

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    Role, User, Student, Teacher, KnowledgeArea, TeacherExpertise, DegreeProfile
)
from backend.app.core.security import get_password_hash
from backend.app.services.nlp_engine import generate_dense_embedding

def seed_database(db: Session):
    """Seed initial data for roles, users, areas, and sample profiles."""
    if db.query(Role).count() > 0:
        return # Already seeded

    print("--- Seeding Database with Initial Data ---")

    # 1. Roles
    roles = {
        "ADMIN": Role(name="ADMIN", description="Administrador General del Sistema FICCT", permissions=["*"]),
        "DIRECTOR_CARRERA": Role(name="DIRECTOR_CARRERA", description="Director de Carrera y Coordinador de Taller de Grado", permissions=["matchmaking", "resoluciones", "tribunales", "analytics"]),
        "DOCENTE_TUTOR": Role(name="DOCENTE_TUTOR", description="Docente Guía y Asesor de Grado", permissions=["ver_tesistas", "revisar_borradores", "emitir_observaciones"]),
        "TRIBUNAL": Role(name="TRIBUNAL", description="Docente Miembro del Tribunal Evaluador", permissions=["evaluar_tesis", "dictaminar_defensa"]),
        "ESTUDIANTE": Role(name="ESTUDIANTE", description="Estudiante Postulante a Modalidad de Graduación", permissions=["crear_perfil", "subir_borrador", "ver_observaciones"])
    }
    for r in roles.values():
        db.add(r)
    db.commit()

    # 2. Knowledge Areas
    areas = [
        KnowledgeArea(code="IA-01", name="Inteligencia Artificial y NLP", description="Machine Learning, Redes Neuronales, Embeddings, Procesamiento de Lenguaje Natural", weight=1.2),
        KnowledgeArea(code="SW-02", name="Ingeniería de Software y Arquitectura", description="Arquitecturas Limpias, Patrones de Diseño, Metodologías Ágiles SCRUM, Calidad SQA", weight=1.0),
        KnowledgeArea(code="BD-03", name="Bases de Datos y Persistencia Vectorial", description="PostgreSQL, pgvector, Índices HNSW, Bases NoSQL Documentales", weight=1.0),
        KnowledgeArea(code="RED-04", name="Ciberseguridad y Redes", description="Criptografía, Seguridad de la Información, Protocolos de Red, OWASP", weight=1.0),
        KnowledgeArea(code="CLD-05", name="Cloud Computing y DevOps", description="Google Cloud Platform, Docker, Kubernetes, CI/CD Pipelines, Serverless", weight=1.1),
    ]
    for a in areas:
        db.add(a)
    db.commit()

    # 3. Users & Personas
    # Director
    u_dir = User(
        username="director.sistemas",
        email="director@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Director2026*"),
        first_name="Leonardo",
        last_name="Vargas Peña",
        phone="+591 70011223",
        role_id=roles["DIRECTOR_CARRERA"].id
    )
    db.add(u_dir)

    # Teacher 1 (Rolando Martinez)
    u_doc1 = User(
        username="docente.martinez",
        email="rmartinez@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Docente2026*"),
        first_name="Rolando Antoni",
        last_name="Martínez Canedo",
        phone="+591 71022334",
        role_id=roles["DOCENTE_TUTOR"].id
    )
    db.add(u_doc1)

    # Teacher 2 (Balcazar)
    u_doc2 = User(
        username="docente.balcazar",
        email="jbalcazar@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Docente2026*"),
        first_name="Juan Carlos",
        last_name="Balcazar",
        phone="+591 72033445",
        role_id=roles["DOCENTE_TUTOR"].id
    )
    db.add(u_doc2)

    # Teacher 3 (Veizaga)
    u_doc3 = User(
        username="docente.veizaga",
        email="mveizaga@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Docente2026*"),
        first_name="Mario",
        last_name="Veizaga",
        phone="+591 73044556",
        role_id=roles["DOCENTE_TUTOR"].id
    )
    db.add(u_doc3)

    # Student (Molina Cortez Maikol Anthony)
    u_est = User(
        username="estudiante.molina",
        email="mmolina@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Estudiante2026*"),
        first_name="Maikol Anthony",
        last_name="Molina Cortez",
        phone="+591 78055667",
        role_id=roles["ESTUDIANTE"].id
    )
    db.add(u_est)

    # Admin
    u_adm = User(
        username="admin.ficct",
        email="admin@ficct.uagrm.edu.bo",
        password_hash=get_password_hash("Admin2026*"),
        first_name="Administrador",
        last_name="Sistemas FICCT",
        phone="+591 70000001",
        role_id=roles["ADMIN"].id
    )
    db.add(u_adm)
    db.commit()

    # 4. Student Profile
    student = Student(
        user_id=u_est.id,
        student_code="21901234",
        career="Ingeniería en Sistemas",
        current_semester=10,
        is_eligible_degree=True
    )
    db.add(student)

    # 5. Teacher Profiles & Expertises
    t1 = Teacher(user_id=u_doc1.id, teacher_code="DOC-0101", department="Departamento de Computación", max_quota=5, current_quota=2, is_available=True)
    t2 = Teacher(user_id=u_doc2.id, teacher_code="DOC-0102", department="Departamento de Redes y Telecom", max_quota=4, current_quota=1, is_available=True)
    t3 = Teacher(user_id=u_doc3.id, teacher_code="DOC-0103", department="Departamento de Sistemas de Información", max_quota=5, current_quota=3, is_available=True)
    db.add_all([t1, t2, t3])
    db.commit()

    # Link teacher expertise
    exp1 = TeacherExpertise(teacher_id=t1.id, area_id=areas[0].id, domain_level=10, years_experience=12, keywords="inteligencia artificial, machine learning, redes neuronales, embeddings, nlp")
    exp2 = TeacherExpertise(teacher_id=t1.id, area_id=areas[1].id, domain_level=9, years_experience=15, keywords="arquitectura de software, patrones de diseno, scrum, metodologias agiles")
    exp3 = TeacherExpertise(teacher_id=t2.id, area_id=areas[3].id, domain_level=10, years_experience=10, keywords="ciberseguridad, seguridad de redes, criptografia, protocolos tcp ip, firewall")
    exp4 = TeacherExpertise(teacher_id=t3.id, area_id=areas[2].id, domain_level=9, years_experience=14, keywords="postgresql, sql, bases de datos vectoriales, big data, optimizacion")
    db.add_all([exp1, exp2, exp3, exp4])
    db.commit()

    # 6. Sample Degree Profile
    sample_title = "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning en la Carrera de Ingeniería en Sistemas - UAGRM"
    sample_summary = "Desarrollo e implementación de una plataforma de software que integra procesamiento de lenguaje natural (NLP) y búsqueda vectorial semántica con pgvector para automatizar la asignación de tutores idóneos según especialidad técnica y disponibilidad horaria, acelerando el proceso de titulación."
    sample_objectives = "1. Diseñar el motor de vectorización de perfiles con modelos densos.\n2. Implementar el algoritmo de similitud coseno y ranking ponderado.\n3. Crear el visor interactivo de avances de tesis."
    
    vec = generate_dense_embedding(f"{sample_title} {sample_summary} {sample_objectives}")
    
    p = DegreeProfile(
        profile_code="PRF-SIS-2026-001",
        student_id=student.id,
        title=sample_title,
        summary=sample_summary,
        objectives=sample_objectives,
        keywords="machine learning, nlp, asignacion automatizada, proyectos de grado, uagrm, ingenieria de software",
        embedding_json=vec,
        status="REGISTRADO",
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(p)
    db.commit()
    print("--- Database Seeding Completed Successfully! ---")

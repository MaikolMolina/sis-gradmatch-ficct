/**
 * SIS-GradMatch: API Client & Service Layer
 * Soporta conexión REST en vivo con FastAPI y fallback transparente.
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const API_BASE = (window.location.origin.includes('8000') || window.location.pathname.startsWith('/portal')) 
    ? '/api/v1' 
    : 'http://localhost:8000/api/v1';

const ApiService = {
    async checkHealth() {
        try {
            const healthUrl = API_BASE.startsWith('/') ? '/health' : `${API_BASE.replace('/api/v1', '')}/health`;
            const res = await fetch(healthUrl, { method: 'GET' });
            if (res.ok) {
                if (window.Store && typeof window.Store.setBackendStatus === 'function') {
                    window.Store.setBackendStatus(true);
                }
                return true;
            }
        } catch (e) {
            console.warn('API backend no detectada en localhost:8000. Operando con motor mock local.', e);
        }
        if (window.Store && typeof window.Store.setBackendStatus === 'function') {
            window.Store.setBackendStatus(false);
        }
        return false;
    },

    // 1. Matchmaking Engine
    async runMatchmaking(perfilId, wSemantic = 0.70, wCapacity = 0.30) {
        if (Store.state.backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/matchmaking/calculate/${perfilId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ peso_semantico: wSemantic, peso_capacidad: wCapacity })
                });
                if (res.ok) return await res.json();
            } catch (err) {
                console.error('Error calculando matchmaking en API:', err);
            }
        }

        // Realistic Mock Computation
        return {
            perfil_id: perfilId,
            titulo_perfil: "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada con Machine Learning",
            candidatos_recomendados: [
                {
                    docente_id: 1,
                    nombre: "Ing. Rolando Antoni Martínez Canedo",
                    departamento: "Ingeniería de Software & Arquitectura",
                    afinidad_semantica: 0.942,
                    cupo_actual: 3,
                    cupo_maximo: 5,
                    score_balanceo: 0.915,
                    ranking: 1,
                    justificacion: "Afinidad semántica sobresaliente (94.2%) con la línea de investigación en Ingeniería de Software, Arquitectura Limpia y Sistemas Inteligentes. Disponibilidad de 2 plazas de tutoría."
                },
                {
                    docente_id: 2,
                    nombre: "Lic. Luis Vargas Pérez",
                    departamento: "Bases de Datos & Big Data",
                    afinidad_semantica: 0.810,
                    cupo_actual: 2,
                    cupo_maximo: 4,
                    score_balanceo: 0.795,
                    ranking: 2,
                    justificacion: "Alta coincidencia en modelos relacionales avanzados y almacenamiento estructurado de proyectos de grado."
                },
                {
                    docente_id: 3,
                    nombre: "Ing. Marcos Balderrama Ruiz",
                    departamento: "Ciencias de la Computación & Redes",
                    afinidad_semantica: 0.680,
                    cupo_actual: 4,
                    cupo_maximo: 5,
                    score_balanceo: 0.650,
                    ranking: 3,
                    justificacion: "Experiencia en infraestructura distribuida y despliegues cloud para aplicaciones académicas."
                }
            ],
            algoritmo_empleado: "Cosine Similarity + Ponderación de Capacidad k-NN",
            dimensiones_vector: 768
        };
    },

    // 2. Confirm Tutor Assignment & Issue Administrative Resolution
    async confirmAssignment(perfilId, docenteId, resolucionNumero) {
        if (Store.state.backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/matchmaking/confirmar-asignacion`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        perfil_id: perfilId,
                        docente_id: docenteId,
                        numero_resolucion: resolucionNumero
                    })
                });
                if (res.ok) return await res.json();
            } catch (err) {
                console.error('Error confirmando asignación en API:', err);
            }
        }

        return {
            status: "APROBADA",
            numero_resolucion: resolucionNumero || `RA-FICCT-${Math.floor(1000 + Math.random() * 9000)}/2026`,
            fecha_emision: new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' }),
            autoridad: "Ing. Rolando Antoni Martínez Canedo - Director Carrera Ing. Sistemas",
            mensaje: "Asignación formal de tutor confirmada y registrada en el libro de actas digitales."
        };
    },

    // 3. Tutor Inbox & Workspace
    async getTutorInbox(username) {
        if (Store.state.backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/tutor/bandeja`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.error('Error obteniendo bandeja tutor:', err);
            }
        }

        return [
            {
                id: 1,
                estudiante: "Molina Cortez Maikol Anthony",
                registro: "220011559",
                titulo_tesis: "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada con ML",
                modalidad: "Proyecto de Grado",
                capitulo_actual: 3,
                estado_avance: "OBSERVADO",
                fecha_ultimo_envio: "18/11/2026",
                porcentaje_progreso: 65,
                observaciones_pendientes: 2
            },
            {
                id: 2,
                estudiante: "Condori Flores Carlos",
                registro: "219045123",
                titulo_tesis: "Plataforma de Detección de Fallas en Redes de Telecomunicaciones mediante IoT",
                modalidad: "Trabajo Dirigido",
                capitulo_actual: 2,
                estado_avance: "EN_REVISION",
                fecha_ultimo_envio: "15/11/2026",
                porcentaje_progreso: 40,
                observaciones_pendientes: 0
            },
            {
                id: 3,
                estudiante: "Guzmán Silva Andrea",
                registro: "220199432",
                titulo_tesis: "Modelo Predictivo de Deserción Universitaria con Redes Neuronales Profundas",
                modalidad: "Tesis de Grado",
                capitulo_actual: 4,
                estado_avance: "APROBADO",
                fecha_ultimo_envio: "10/11/2026",
                porcentaje_progreso: 85,
                observaciones_pendientes: 0
            }
        ];
    },

    // 4. Student Timeline & Profile
    async getStudentTimeline(registro) {
        return {
            estudiante: {
                nombre: "Molina Cortez Maikol Anthony",
                registro: "220011559",
                carrera: "Ingeniería en Sistemas",
                semestre: 9,
                habilitado_cpd: true
            },
            steps: [
                { id: 1, title: "Habilitación Académica", status: "completed", date: "05/10/2026" },
                { id: 2, title: "Perfil de Grado NLP", status: "completed", date: "18/10/2026" },
                { id: 3, title: "Asignación de Tutor", status: "completed", date: "28/10/2026" },
                { id: 4, title: "Revisión Borradores", status: "active", date: "En curso" },
                { id: 5, title: "Visto Bueno & Dictamen", status: "pending", date: "Pendiente" },
                { id: 6, title: "Tribunal Evaluador", status: "pending", date: "Pendiente" },
                { id: 7, title: "Defensa Pública", status: "pending", date: "Pendiente" }
            ],
            tesis_actual: {
                titulo: "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning",
                tutor: "Ing. Rolando Antoni Martínez Canedo",
                resolucion: "RA-FICCT-0482/2026",
                capitulos: [
                    { numero: 1, titulo: "Introducción y Alcance", estado: "APROBADO", version: 2 },
                    { numero: 2, titulo: "Marco Teórico y Estado del Arte", estado: "APROBADO", version: 1 },
                    { numero: 3, titulo: "Metodología y Diseño de la Solución", estado: "OBSERVADO", version: 2 }
                ],
                observaciones_activas: [
                    {
                        id: 101,
                        capitulo: 3,
                        pagina: 42,
                        seccion: "3.4 Diagrama C4 Contenedores",
                        tipo: "TECNICA",
                        comentario: "Detallar la comunicación gRPC/REST entre el servicio de Matchmaking y la base de datos pgvector.",
                        fecha: "16/11/2026"
                    },
                    {
                        id: 102,
                        capitulo: 3,
                        pagina: 49,
                        seccion: "3.6 Pruebas de Caja Blanca McCabe",
                        tipo: "METODOLOGICA",
                        comentario: "Incluir la tabla de cobertura de aristas y caminos independientes del Grafo de Flujo de Control.",
                        fecha: "17/11/2026"
                    }
                ]
            }
        };
    },

    // 5. Director Real-Time Analytics & KPIs
    async getAnalyticsMetrics() {
        if (Store.state.backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/analytics/metricas`);
                if (res.ok) return await res.json();
            } catch (err) {}
        }

        return {
            kpis: {
                total_postulantes: 48,
                perfiles_procesados_nlp: 42,
                tutores_asignados: 39,
                resoluciones_emitidas: 35,
                similitud_promedio_ia: "88.4%",
                tasa_aprobacion_primer_intento: "79.2%"
            },
            distribucion_areas: [
                { area: "Inteligencia Artificial & Datos", cantidad: 18, color: "#003366" },
                { area: "Ingeniería de Software & Arquitectura", cantidad: 14, color: "#10b981" },
                { area: "Ciberseguridad & Redes", cantidad: 9, color: "#f59e0b" },
                { area: "Sistemas Distribuidos & Cloud", cantidad: 7, color: "#c00000" }
            ],
            carga_docentes: [
                { docente: "Ing. Rolando Martínez", cupo_max: 5, asignados: 3 },
                { docente: "Lic. Luis Vargas", cupo_max: 4, asignados: 2 },
                { docente: "Ing. Marcos Balderrama", cupo_max: 5, asignados: 4 },
                { docente: "Ing. Shirley Valenzuela", cupo_max: 4, asignados: 3 },
                { docente: "Ing. Carlos Miranda", cupo_max: 3, asignados: 2 }
            ]
        };
    },

    // 6. CPD Academic Validation
    async checkCPD(registro) {
        if (Store.state.backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/cpd/habilitacion/${registro}`);
                if (res.ok) return await res.json();
            } catch (err) {}
        }

        // Mock verification rules
        const regNum = parseInt(registro) || 220011559;
        const isValid = regNum > 200000000;
        return {
            registro_universitario: registro,
            estudiante: "Molina Cortez Maikol Anthony",
            carrera: "Ingeniería en Sistemas",
            semestre_actual: 9,
            estado_matricula: "REGULAR",
            materias_aprobadas: 46,
            materias_requeridas: 46,
            habilitado_taller_grado: isValid,
            codigo_verificacion_cpd: "CPD-UAGRM-VERIF-982103"
        };
    }
};

window.ApiService = ApiService;

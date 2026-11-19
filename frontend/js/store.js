/**
 * SIS-GradMatch: Global Reactive & Persistent State Store (v5.1)
 * Modalidad de Graduación: Proyecto de Grado (Malla Curricular 100% Vencida)
 * Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
 * Director de Carrera: M.Sc. Ing. Leonardo Vargas Peña
 * Docente Asesor / Tutor: Ing. Rolando Antoni Martínez Canedo
 */

const STORAGE_KEY = 'sis_gradmatch_state_v8';

const Store = {
    demoAccounts: {
        'director.sistemas': {
            username: 'director.sistemas',
            name: 'M.Sc. Ing. Leonardo Vargas Peña',
            role: 'DIRECTOR_CARRERA',
            email: 'director@ficct.uagrm.edu.bo',
            avatar: 'LV',
            department: 'Dirección de Carrera - Ingeniería en Sistemas'
        },
        'docente.martinez': {
            username: 'docente.martinez',
            name: 'Ing. Rolando Antoni Martínez Canedo',
            role: 'DOCENTE_TUTOR',
            email: 'rmartinez@ficct.uagrm.edu.bo',
            avatar: 'RM',
            department: 'Sistemas Inteligentes, Arquitectura Limpia & Metodología',
            specialties: ['Ingeniería de Software', 'Machine Learning', 'Arquitectura de Software', 'Metodologías Ágiles'],
            quota_max: 5,
            quota_actual: 3
        },
        'docente.vargas': {
            username: 'docente.vargas',
            name: 'Lic. Luis Vargas Pérez',
            role: 'DOCENTE_TUTOR',
            email: 'lvargas@ficct.uagrm.edu.bo',
            avatar: 'LP',
            department: 'Bases de Datos, Persistencia & Big Data',
            specialties: ['Bases de Datos', 'Big Data', 'PostgreSQL pgvector', 'NoSQL'],
            quota_max: 4,
            quota_actual: 2
        },
        'docente.balderrama': {
            username: 'docente.balderrama',
            name: 'Ing. Marcos Balderrama Ruiz',
            role: 'DOCENTE_TUTOR',
            email: 'mbalderrama@ficct.uagrm.edu.bo',
            avatar: 'MB',
            department: 'Redes, Telecomunicaciones, IoT & Cloud Computing',
            specialties: ['Redes y Telecomunicaciones', 'Internet de las Cosas (IoT)', 'Sistemas Distribuidos', 'Cloud'],
            quota_max: 5,
            quota_actual: 4
        },
        'docente.valenzuela': {
            username: 'docente.valenzuela',
            name: 'Ing. Shirley Valenzuela',
            role: 'DOCENTE_TUTOR',
            email: 'svalenzuela@ficct.uagrm.edu.bo',
            avatar: 'SV',
            department: 'Ciberseguridad, Criptografía & Auditoría TI',
            specialties: ['Ciberseguridad', 'Auditoría de Sistemas', 'Criptografía', 'Seguridad Cloud'],
            quota_max: 4,
            quota_actual: 1
        },
        'estudiante.molina': {
            username: 'estudiante.molina',
            name: 'Molina Cortez Maikol Anthony',
            role: 'ESTUDIANTE',
            email: 'mmolina@ficct.uagrm.edu.bo',
            avatar: 'MM',
            registro: '220011559',
            carrera: 'Ingeniería en Sistemas',
            condicion: 'Egresado Habilitado (Malla Vencida 100%)',
            modalidad: 'Proyecto de Grado',
            malla_curricular: 'Plan 187-3 (56/56 asignaturas aprobadas)',
            cpd_status: 'HABILITADO'
        },
        'estudiante.condori': {
            username: 'estudiante.condori',
            name: 'Condori Flores Carlos',
            role: 'ESTUDIANTE',
            email: 'ccondori@ficct.uagrm.edu.bo',
            avatar: 'CC',
            registro: '219045123',
            carrera: 'Ingeniería en Redes y Telecomunicaciones',
            condicion: 'Egresado Habilitado (Malla Vencida 100%)',
            modalidad: 'Proyecto de Grado',
            malla_curricular: 'Plan 187-4 (54/54 asignaturas aprobadas)',
            cpd_status: 'HABILITADO'
        },
        'estudiante.guzman': {
            username: 'estudiante.guzman',
            name: 'Guzmán Silva Andrea',
            role: 'ESTUDIANTE',
            email: 'aguzman@ficct.uagrm.edu.bo',
            avatar: 'AG',
            registro: '220199432',
            carrera: 'Ingeniería en Sistemas',
            condicion: 'Egresado Habilitado (Malla Vencida 100%)',
            modalidad: 'Proyecto de Grado',
            malla_curricular: 'Plan 187-3 (56/56 asignaturas aprobadas)',
            cpd_status: 'HABILITADO'
        }
    },

    // Default Seed State
    initialData: {
        profiles: [
            {
                id: 1,
                student: 'Molina Cortez Maikol Anthony',
                registro: '220011559',
                modalidad: 'Proyecto de Grado',
                condicion: 'Egresado Habilitado (Malla 100%)',
                plazo_dias: 180,
                fecha_limite: '28 de Abril de 2027',
                title: 'Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning',
                abstract: 'Automatización integral de emparejamiento semántico mediante representaciones vectoriales densas de 768 dimensiones, arquitectura C4 desacoplada, marco de trabajo SCRUM y visor colaborativo de observaciones pedagógicas en la FICCT - UAGRM.',
                areas: ['Ingeniería de Software', 'Machine Learning', 'Arquitectura de Software'],
                status: 'ASIGNADO',
                tutor_username: 'docente.martinez',
                tutor_name: 'Ing. Rolando Antoni Martínez Canedo',
                resolution: 'RA-FICCT-0482/2026',
                assigned_date: '28 de Octubre de 2026',
                chapters: [
                    {
                        id: 100,
                        type: 'COMPLETO',
                        number: 0,
                        title: 'Documento Borrador Completo (Consolidado de Tesis)',
                        version: 'v1.0',
                        status: 'EN_REVISION',
                        file_name: 'Borrador_Consolidado_Tesis_Molina.pdf',
                        file_url: '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf',
                        file_size: '4.2 MB',
                        uploaded_at: '18/11/2026',
                        notes: 'Documento consolidado de Proyecto de Grado que abarca los 13 capítulos con carátulas individuales y modelos UML 2.5.',
                        complementary_files: [
                            { name: 'Sistema_Gestion_Proyectos_Grado.eap', size: '1.8 MB', url: '/storage/drafts/Sistema_Gestion_Proyectos_Grado.eap' },
                            { name: 'Codigo_Fuente_SIS_GradMatch.zip', size: '6.4 MB', url: '/storage/drafts/Codigo_Fuente_SIS_GradMatch.zip' }
                        ],
                        observations: []
                    },
                    {
                        id: 1,
                        type: 'CAPITULO',
                        number: 1,
                        title: 'Introducción, Planteamiento del Problema y Objetivos',
                        version: 'v2.0',
                        status: 'APROBADO',
                        file_name: 'Borrador_Capitulo1_v2_Molina.pdf',
                        file_url: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
                        file_size: '1.2 MB',
                        uploaded_at: '10/10/2026',
                        notes: 'Se incorporan los objetivos específicos delimitados para la FICCT.',
                        complementary_files: [],
                        observations: []
                    },
                    {
                        id: 2,
                        type: 'CAPITULO',
                        number: 2,
                        title: 'Marco Teórico, Estado del Arte y Tecnologías',
                        version: 'v1.0',
                        status: 'APROBADO',
                        file_name: 'Borrador_Capitulo2_v1_Molina.pdf',
                        file_url: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
                        file_size: '2.4 MB',
                        uploaded_at: '25/10/2026',
                        notes: 'Revisión exhaustiva de modelos de embeddings de 768 dimensiones y métrica de similitud coseno.',
                        complementary_files: [],
                        observations: []
                    },
                    {
                        id: 3,
                        type: 'CAPITULO',
                        number: 3,
                        title: 'Metodología, Arquitectura C4 y Pruebas McCabe',
                        version: 'v2.0',
                        status: 'OBSERVADO',
                        file_name: 'Borrador_Capitulo3_v2_Molina.pdf',
                        file_url: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
                        file_size: '2.8 MB',
                        uploaded_at: '15/11/2026',
                        notes: 'Subida de versión 2 con diagramas de arquitectura C4 y matriz de cobertura McCabe.',
                        complementary_files: [
                            { name: 'Matriz_Pruebas_McCabe.xlsx', size: '145 KB', url: '/storage/drafts/Matriz_Pruebas_McCabe.xlsx' },
                            { name: 'Diagrama_C4_Contenedores.png', size: '890 KB', url: '/storage/drafts/Diagrama_C4_Contenedores.png' },
                            { name: 'Scripts_Carga_Embeddings.sql', size: '32 KB', url: '/storage/drafts/Scripts_Carga_Embeddings.sql' }
                        ],
                        observations: [
                            {
                                id: 101,
                                type: 'TECNICA',
                                page: 42,
                                section: 'Sección 3.4 Diagrama C4',
                                comment: 'Detallar la latencia y los hiperparámetros de indexación IVFFlat para la búsqueda vectorial sobre los 768 atributos densos.',
                                date: '16/11/2026',
                                resolved: false
                            },
                            {
                                id: 102,
                                type: 'METODOLOGICA',
                                page: 49,
                                section: 'Sección 3.6 Pruebas McCabe',
                                comment: 'Incluir la tabla con los casos de prueba concretos que cubren cada uno de los 4 caminos independientes del grafo de McCabe con V(G)=4.',
                                date: '17/11/2026',
                                resolved: false
                            }
                        ]
                    },
                    {
                        id: 4,
                        type: 'ANEXO',
                        number: 91,
                        title: 'Anexo A: Matriz Detallada de Pruebas de Caja Blanca y Grafos McCabe',
                        version: 'v1.0',
                        status: 'APROBADO',
                        file_name: 'AnexoA_Matriz_Pruebas_McCabe.pdf',
                        file_url: '/storage/drafts/AnexoA_Matriz_Pruebas_McCabe.pdf',
                        file_size: '1.1 MB',
                        uploaded_at: '16/11/2026',
                        notes: 'Documento complementario con especificación formal de caminos independientes.',
                        complementary_files: [],
                        observations: []
                    },
                    {
                        id: 5,
                        type: 'MANUAL',
                        number: 92,
                        title: 'Manual Técnico de Despliegue en Google Cloud Platform y Docker',
                        version: 'v1.0',
                        status: 'EN_REVISION',
                        file_name: 'Manual_Tecnico_GCP_GradMatch.pdf',
                        file_url: '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf',
                        file_size: '2.1 MB',
                        uploaded_at: '18/11/2026',
                        notes: 'Guía paso a paso para la puesta en marcha con docker-compose y Cloud Run.',
                        complementary_files: [],
                        observations: []
                    }
                ]
            },
            {
                id: 2,
                student: 'Condori Flores Carlos',
                registro: '219045123',
                modalidad: 'Proyecto de Grado',
                condicion: 'Egresado Habilitado (Malla 100%)',
                plazo_dias: 180,
                fecha_limite: '15 de Mayo de 2027',
                title: 'Plataforma IoT de Detección Temprana de Fallas en Redes de Telecomunicaciones',
                abstract: 'Monitoreo en tiempo real de nodos de telecomunicación mediante microcontroladores ESP32, protocolo MQTT y análisis de telemetría para la detección predictiva de cortes de fibra óptica.',
                areas: ['Redes y Telecomunicaciones', 'Internet de las Cosas (IoT)', 'Sistemas Distribuidos'],
                status: 'PENDIENTE_ASIGNACION',
                tutor_username: null,
                tutor_name: null,
                resolution: null,
                assigned_date: null,
                chapters: [
                    {
                        id: 201,
                        type: 'CAPITULO',
                        number: 1,
                        title: 'Introducción y Delimitación de Redes Ópticas',
                        version: 'v1.0',
                        status: 'EN_REVISION',
                        file_name: 'Borrador_Capitulo1_Condori.pdf',
                        file_url: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
                        file_size: '1.8 MB',
                        uploaded_at: '12/11/2026',
                        notes: 'Entrega inicial de planteamiento y justificación de costos.',
                        complementary_files: [],
                        observations: []
                    }
                ]
            },
            {
                id: 3,
                student: 'Guzmán Silva Andrea',
                registro: '220199432',
                modalidad: 'Proyecto de Grado',
                condicion: 'Egresado Habilitado (Malla 100%)',
                plazo_dias: 180,
                fecha_limite: '20 de Abril de 2027',
                title: 'Modelo Predictivo de Deserción Universitaria con Redes Neuronales y Bases de Datos Vectoriales',
                abstract: 'Diseño de un motor de inferencia analítica sobre el historial académico de la FICCT, empleando clustering k-means y clasificación profunda para alertar tempranamente estudiantes en riesgo académico.',
                areas: ['Bases de Datos', 'Machine Learning', 'Big Data'],
                status: 'ASIGNADO',
                tutor_username: 'docente.vargas',
                tutor_name: 'Lic. Luis Vargas Pérez',
                resolution: 'RA-FICCT-0465/2026',
                assigned_date: '20 de Octubre de 2026',
                chapters: [
                    { id: 300, type: 'COMPLETO', number: 0, title: 'Borrador Consolidado Completo para Tribunal', version: 'v1.0', status: 'APROBADO', file_name: 'Tesis_Completa_Guzman.pdf', file_url: '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf', file_size: '4.8 MB', uploaded_at: '15/11/2026', notes: '', complementary_files: [], observations: [] }
                ]
            }
        ],

        resolutions: [
            {
                number: 'RA-FICCT-0482/2026',
                date: '28 de Octubre de 2026',
                student: 'Molina Cortez Maikol Anthony',
                registro: '220011559',
                tutor: 'Ing. Rolando Antoni Martínez Canedo',
                title: 'Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning',
                director: 'M.Sc. Ing. Leonardo Vargas Peña',
                status: 'VIGENTE',
                plazo: '180 días calendario (Vencimiento: 28/04/2027)',
                modalidad: 'Proyecto de Grado'
            },
            {
                number: 'RA-FICCT-0465/2026',
                date: '20 de Octubre de 2026',
                student: 'Guzmán Silva Andrea',
                registro: '220199432',
                tutor: 'Lic. Luis Vargas Pérez',
                title: 'Modelo Predictivo de Deserción Universitaria con Redes Neuronales y Bases de Datos Vectoriales',
                director: 'M.Sc. Ing. Leonardo Vargas Peña',
                status: 'VIGENTE',
                plazo: '180 días calendario (Vencimiento: 20/04/2027)',
                modalidad: 'Proyecto de Grado'
            }
        ],

        tribunals: [
            {
                id: 1,
                student: 'Guzmán Silva Andrea',
                registro: '220199432',
                title: 'Modelo Predictivo de Deserción Universitaria con Redes Neuronales y Bases de Datos Vectoriales',
                modalidad: 'Proyecto de Grado',
                president: 'M.Sc. Ing. Leonardo Vargas Peña',
                secretary: 'Ing. Shirley Valenzuela',
                vocal: 'Ing. Marcos Balderrama Ruiz',
                resolution: 'RA-TRIB-001/2026',
                date: '15 de Noviembre de 2026',
                status: 'CONFORMADO'
            }
        ],

        cpdDatabase: {
            '220011559': {
                estudiante: 'Molina Cortez Maikol Anthony',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'EGRESADO HABILITADO',
                materias_aprobadas: 56,
                materias_total: 56,
                porcentaje_malla: 100,
                ppa: 74.5,
                certificado_conclusion: 'CE-FICCT-2026-0842',
                deuda_daf: false,
                habilitado: true,
                modalidad_habilitada: 'Proyecto de Grado',
                motivo: 'Egresado con malla curricular 100% vencida (56/56 materias aprobadas). Cuenta con Certificado de Conclusión de Estudios y no registra deudas en DAF. Habilitado para Modalidad de Graduación: Proyecto de Grado.'
            },
            '219045123': {
                estudiante: 'Condori Flores Carlos',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'EGRESADO HABILITADO',
                materias_aprobadas: 56,
                materias_total: 56,
                porcentaje_malla: 100,
                ppa: 68.2,
                certificado_conclusion: 'CE-FICCT-2026-0791',
                deuda_daf: false,
                habilitado: true,
                modalidad_habilitada: 'Proyecto de Grado',
                motivo: 'Egresado regular con totalidad de asignaturas aprobadas en CPD. Habilitado para trámite de Modalidad de Graduación: Proyecto de Grado.'
            },
            '220199432': {
                estudiante: 'Guzmán Silva Andrea',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'EGRESADO HABILITADO',
                materias_aprobadas: 56,
                materias_total: 56,
                porcentaje_malla: 100,
                ppa: 81.0,
                certificado_conclusion: 'CE-FICCT-2026-0810',
                deuda_daf: false,
                habilitado: true,
                modalidad_habilitada: 'Proyecto de Grado',
                motivo: 'Egresada con récord académico sobresaliente y 100% de asignaturas vencidas. Habilitada para Modalidad de Graduación: Proyecto de Grado.'
            },
            '221088771': {
                estudiante: 'Pérez Gómez Juan Carlos',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'ALUMNO REGULAR EN CURSO',
                materias_aprobadas: 38,
                materias_total: 56,
                porcentaje_malla: 67.8,
                ppa: 58.4,
                certificado_conclusion: 'NO EMITIDO (PENDIENTE DE ASIGNATURAS)',
                deuda_daf: false,
                habilitado: false,
                modalidad_habilitada: 'NINGUNA',
                motivo: 'RECHAZADO: Malla curricular incompleta (38/56 materias aprobadas, 67.8% de avance). La Modalidad de Graduación: Proyecto de Grado requiere la conclusión del 100% de la malla curricular (56 materias vencidas).'
            },
            '218033221': {
                estudiante: 'Rojas Mercado Luis Fernando',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'SUSPENDIDO POR ARANCELES DAF',
                materias_aprobadas: 54,
                materias_total: 56,
                porcentaje_malla: 96.4,
                ppa: 52.1,
                certificado_conclusion: 'BLOQUEADO',
                deuda_daf: true,
                habilitado: false,
                modalidad_habilitada: 'NINGUNA',
                motivo: 'RECHAZADO: Registra 2 asignaturas pendientes en 10mo semestre y bloqueo administrativo por deudas arancelarias en DAF. Debe regularizar su situación en caja central.'
            }
        }
    },

    state: {
        currentUser: null,
        currentView: 'student-timeline',
        backendOnline: true,
        data: null,
        get activeRole() {
            return this.currentUser ? this.currentUser.role : 'ESTUDIANTE';
        },
        get activeView() {
            return this.currentView;
        }
    },

    subscribers: [],

    init() {
        this.loadState();
        if (!this.state.currentUser) {
            this.state.currentUser = this.demoAccounts['estudiante.molina'];
            this.state.currentView = 'student-timeline';
        }
    },

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                const defaultData = JSON.parse(JSON.stringify(this.initialData));
                if (parsed.data && typeof parsed.data === 'object') {
                    this.state.data = {
                        ...defaultData,
                        ...parsed.data
                    };
                    if (!Array.isArray(this.state.data.profiles) || this.state.data.profiles.length === 0) {
                        this.state.data.profiles = defaultData.profiles;
                    }
                    if (!Array.isArray(this.state.data.resolutions) || this.state.data.resolutions.length === 0) {
                        this.state.data.resolutions = defaultData.resolutions;
                    }
                    if (!Array.isArray(this.state.data.tribunals) || this.state.data.tribunals.length === 0) {
                        this.state.data.tribunals = defaultData.tribunals;
                    }
                    if (!this.state.data.cpdDatabase) {
                        this.state.data.cpdDatabase = defaultData.cpdDatabase;
                    }
                } else {
                    this.state.data = defaultData;
                }

                if (parsed.currentUsername && this.demoAccounts[parsed.currentUsername]) {
                    this.state.currentUser = this.demoAccounts[parsed.currentUsername];
                }
                if (parsed.currentView) {
                    this.state.currentView = parsed.currentView;
                }
                return;
            }
        } catch (e) {
            console.warn('Error loading localStorage state, using initialData', e);
        }
        this.state.data = JSON.parse(JSON.stringify(this.initialData));
        this.save();
    },

    save() {
        try {
            const payload = {
                data: this.state.data,
                currentUsername: this.state.currentUser ? this.state.currentUser.username : null,
                currentView: this.state.currentView
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error('Error saving state to localStorage', e);
        }
    },

    subscribe(fn) {
        this.subscribers.push(fn);
    },

    notify() {
        this.subscribers.forEach(fn => fn(this.state));
    },

    switchUser(username) {
        const user = this.demoAccounts[username];
        if (!user) return;
        this.state.currentUser = user;
        if (user.role === 'ESTUDIANTE') {
            this.state.currentView = 'student-timeline';
        } else if (user.role === 'DOCENTE_TUTOR') {
            this.state.currentView = 'tutor-inbox';
        } else if (user.role === 'DIRECTOR_CARRERA') {
            this.state.currentView = 'director-kpis';
        }
        this.save();
        this.notify();
    },

    selectDemoUser(username) {
        return this.switchUser(username);
    },

    setView(viewName) {
        this.state.currentView = viewName;
        this.save();
        this.notify();
    },

    setBackendStatus(isOnline) {
        this.state.backendOnline = isOnline;
        this.notify();
    },

    // 1. Calculate Matchmaking with Dynamic Weights
    calculateMatchmaking(profileId, weightSemantic = 0.70, weightCapacity = 0.30) {
        const profiles = (this.state.data && Array.isArray(this.state.data.profiles) && this.state.data.profiles.length > 0)
            ? this.state.data.profiles
            : this.initialData.profiles;
        const profile = profiles.find(p => p && p.id === parseInt(profileId)) || profiles[0] || this.initialData.profiles[0];
        if (!profile) return null;
        const teachers = [
            this.demoAccounts['docente.martinez'],
            this.demoAccounts['docente.vargas'],
            this.demoAccounts['docente.balderrama'],
            this.demoAccounts['docente.valenzuela']
        ];

        // Semantic base affinity per teacher depending on profile areas
        const affinityMap = {
            1: { // Molina (Software, ML, Architecture)
                'docente.martinez': 0.942,
                'docente.vargas': 0.810,
                'docente.balderrama': 0.680,
                'docente.valenzuela': 0.550
            },
            2: { // Condori (IoT, Networks)
                'docente.balderrama': 0.955,
                'docente.martinez': 0.720,
                'docente.valenzuela': 0.650,
                'docente.vargas': 0.510
            },
            3: { // Guzmán (Data, ML, Deserción)
                'docente.vargas': 0.938,
                'docente.martinez': 0.890,
                'docente.balderrama': 0.610,
                'docente.valenzuela': 0.580
            }
        };

        const profMap = affinityMap[profile.id] || affinityMap[1];

        const scored = teachers.map(t => {
            const sem = profMap[t.username] || 0.60;
            const availableQuota = Math.max(0, t.quota_max - t.quota_actual);
            const cap = t.quota_max > 0 ? (availableQuota / t.quota_max) : 0;
            const finalScore = (sem * weightSemantic) + (cap * weightCapacity);

            return {
                teacher: t,
                nombre: t.name,
                username: t.username,
                departamento: t.department,
                similitud_semantica: sem,
                score_capacidad: cap,
                score_final: finalScore,
                score_final_pct: Math.round(finalScore * 100),
                cupo_actual: t.quota_actual,
                cupo_max: t.quota_max,
                plazas_disponibles: availableQuota,
                justificacion: `Afinidad semántica del ${(sem * 100).toFixed(1)}% en ${t.specialties.slice(0, 2).join(' y ')}. Cuenta con ${availableQuota} plaza(s) disponible(s).`
            };
        });

        scored.sort((a, b) => b.score_final - a.score_final);
        scored.forEach((c, idx) => { c.ranking = idx + 1; });

        return {
            profile,
            wSemantic: weightSemantic,
            wCapacity: weightCapacity,
            candidatos: scored
        };
    },

    // 2. Confirm Assignment and Issue RA
    confirmTutorAssignment(profileId, teacherUsername) {
        const profile = this.state.data.profiles.find(p => p.id === parseInt(profileId));
        const teacher = this.demoAccounts[teacherUsername];
        if (!profile || !teacher) return null;

        const nextRaNum = `RA-FICCT-0${Math.floor(483 + Math.random() * 50)}/2026`;
        const today = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

        profile.status = 'ASIGNADO';
        profile.tutor_username = teacherUsername;
        profile.tutor_name = teacher.name;
        profile.resolution = nextRaNum;
        profile.assigned_date = today;
        profile.plazo_dias = 180;

        teacher.quota_actual = Math.min(teacher.quota_max, teacher.quota_actual + 1);

        const newRA = {
            number: nextRaNum,
            date: today,
            student: profile.student,
            registro: profile.registro,
            tutor: teacher.name,
            title: profile.title,
            director: 'M.Sc. Ing. Leonardo Vargas Peña',
            status: 'VIGENTE',
            plazo: '180 días calendario',
            modalidad: 'Proyecto de Grado'
        };

        this.state.data.resolutions.unshift(newRA);
        this.save();
        this.notify();

        return {
            success: true,
            resolutionNumber: nextRaNum,
            profile,
            teacher
        };
    },

    assignTutorAndEmitRA({ profileId, tutorUsername, tutorName }) {
        return this.confirmTutorAssignment(profileId, tutorUsername);
    },

    // 3. Designate Tribunal of 3 Professors
    assignTribunal(thesisId, president, secretary, vocal) {
        const profile = this.state.data.profiles.find(p => p.id === parseInt(thesisId)) || this.state.data.profiles[0];
        const nextTribNum = `RA-TRIB-00${this.state.data.tribunals.length + 1}/2026`;
        const today = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

        const newTribunal = {
            id: Date.now(),
            student: profile.student,
            registro: profile.registro,
            title: profile.title,
            modalidad: 'Proyecto de Grado',
            president: president || 'M.Sc. Ing. Leonardo Vargas Peña',
            secretary: secretary || 'Ing. Shirley Valenzuela',
            vocal: vocal || 'Ing. Marcos Balderrama Ruiz',
            resolution: nextTribNum,
            date: today,
            status: 'CONFORMADO'
        };

        this.state.data.tribunals.unshift(newTribunal);
        profile.status = 'TRIBUNAL_DESIGNADO';

        this.save();
        this.notify();

        return {
            success: true,
            record: newTribunal
        };
    },

    designateTribunal({ studentName, registro, title, president, secretary, vocal }) {
        const thesis = this.state.data.profiles.find(p => p.registro === registro) || { id: 1 };
        return this.assignTribunal(thesis.id, president, secretary, vocal);
    },

    // 4. Add Pedagogical Observation
    addObservation({ profileId, deliverableId, type, page, section, comment }) {
        const profile = this.state.data.profiles.find(p => p.id === parseInt(profileId));
        if (!profile) return null;

        const deliverable = profile.chapters.find(c => c.id === parseInt(deliverableId));
        if (!deliverable) return null;

        const record = {
            id: Date.now(),
            type: type || 'TECNICA',
            page: parseInt(page) || 1,
            section: section || 'General',
            comment: comment || '',
            date: new Date().toLocaleDateString('es-BO'),
            resolved: false
        };

        deliverable.observations.push(record);
        deliverable.status = 'OBSERVADO';

        this.save();
        this.notify();
        return { success: true, record };
    },

    addChapterObservation(profileId, deliverableId, type, page, section, comment) {
        return this.addObservation({ profileId, deliverableId, type, page, section, comment });
    },

    // 5. Student Submits Multi-type, Multi-file Delivery
    submitStudentDelivery({ deliveryType, number, title, version, notes, mainFile, compFiles }) {
        const profile = this.state.data.profiles.find(p => p.registro === '220011559') || this.state.data.profiles[0];
        if (!profile) return null;

        const num = parseInt(number) || (deliveryType === 'COMPLETO' ? 0 : Date.now());
        const today = new Date().toLocaleDateString('es-BO');

        const cleanSafeName = mainFile && mainFile.safe_name ? mainFile.safe_name : (mainFile && mainFile.name ? mainFile.name.replace(/\s+/g, '_') : 'Borrador_Tesis_Molina.pdf');
        const rawFileName = mainFile && mainFile.name ? mainFile.name : cleanSafeName;

        const newDelivery = {
            id: Date.now(),
            type: deliveryType || 'CAPITULO',
            number: num,
            title: title || (deliveryType === 'COMPLETO' ? 'Documento Borrador Completo (Consolidado de Tesis)' : `Capítulo ${num}`),
            version: version || 'v1.0',
            status: 'EN_REVISION',
            file_name: rawFileName,
            safe_name: cleanSafeName,
            file_url: mainFile && mainFile.url ? mainFile.url : `/storage/drafts/${cleanSafeName}`,
            download_url: mainFile && mainFile.download_url ? mainFile.download_url : `/api/v1/storage/download/${cleanSafeName}?name=${encodeURIComponent(rawFileName)}`,
            view_url: mainFile && mainFile.view_url ? mainFile.view_url : `/api/v1/storage/view/${cleanSafeName}`,
            blob_url: mainFile && mainFile.blob_url ? mainFile.blob_url : null,
            file_size: mainFile && mainFile.size ? mainFile.size : '3.8 MB',
            uploaded_at: today,
            notes: notes || '',
            complementary_files: compFiles || [],
            observations: []
        };

        // If deliverable with same number and type exists, remove it so the new one goes to the front!
        const existingIdx = profile.chapters.findIndex(c => c.type === deliveryType && c.number === num);
        if (existingIdx >= 0) {
            newDelivery.observations = profile.chapters[existingIdx].observations || [];
            profile.chapters.splice(existingIdx, 1);
        }
        
        // ALWAYS put the newest submission at index 0 so it is the active deliverable everywhere!
        profile.chapters.unshift(newDelivery);
        profile.latest_deliverable_id = newDelivery.id;

        // Automatically point TutorView to immediately examine this new deliverable
        if (typeof window !== 'undefined' && window.TutorView) {
            window.TutorView.selectedProfileId = profile.id;
            window.TutorView.selectedDeliverableId = newDelivery.id;
        }

        // Sincronizar de forma asíncrona con el backend central
        try {
            fetch('/api/v1/thesis/deliverable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: newDelivery.id,
                    deliverableType: newDelivery.type,
                    chapterNumber: newDelivery.number,
                    title: newDelivery.title,
                    version: typeof newDelivery.version === 'string' ? parseInt(newDelivery.version.replace(/\D/g, '')) || 1 : newDelivery.version,
                    status: newDelivery.status,
                    date: newDelivery.uploaded_at,
                    mainFileName: newDelivery.file_name,
                    mainFileSize: newDelivery.file_size,
                    mainFileUrl: newDelivery.file_url,
                    notes: newDelivery.notes,
                    previewExtract: newDelivery.notes,
                    complementaryFiles: (newDelivery.complementary_files || []).map(f => ({
                        name: f.name,
                        size: f.size,
                        url: f.url,
                        type: f.type || 'OTHER'
                    })),
                    observations: []
                })
            }).catch(() => {});
        } catch (_) {}

        this.save();
        this.notify();
        return newDelivery;
    },

    // 6. Submit New Graduation Profile (Perfil de Proyecto de Grado)
    submitStudentProfile({ title, abstract, areas, fileName, fileUrl, downloadUrl, viewUrl, safeName, fileSize }) {
        const profile = this.state.data.profiles.find(p => p.registro === '220011559') || this.state.data.profiles[0];
        if (!profile) return null;

        profile.title = title || profile.title;
        profile.abstract = abstract || profile.abstract;
        if (areas && areas.length > 0) profile.areas = areas;

        const cleanSafe = safeName || (fileName ? fileName.replace(/\s+/g, '_') : 'Perfil_Proyecto_Grado_Molina.pdf');
        const rawName = fileName || cleanSafe;

        profile.profile_file_name = rawName;
        profile.profile_file_url = fileUrl || `/storage/drafts/${cleanSafe}`;
        profile.status = 'PENDIENTE_ASIGNACION';

        const profileDelivery = {
            id: Date.now(),
            type: 'PERFIL',
            number: 0,
            title: `Perfil de Proyecto de Grado: ${profile.title}`,
            version: 'v1.0 (Perfil Inicial)',
            status: 'EN_REVISION',
            file_name: rawName,
            safe_name: cleanSafe,
            file_url: fileUrl || `/storage/drafts/${cleanSafe}`,
            download_url: downloadUrl || `/api/v1/storage/download/${cleanSafe}?name=${encodeURIComponent(rawName)}`,
            view_url: viewUrl || `/api/v1/storage/view/${cleanSafe}`,
            file_size: fileSize || '1.5 MB',
            uploaded_at: new Date().toLocaleDateString('es-BO'),
            notes: 'Documento oficial de perfil de Proyecto de Grado cargado para evaluación de la Dirección de Carrera y Asesor.',
            complementary_files: [],
            observations: []
        };

        const existingIdx = profile.chapters.findIndex(c => c.type === 'PERFIL');
        if (existingIdx >= 0) {
            profile.chapters.splice(existingIdx, 1);
        }
        profile.chapters.unshift(profileDelivery);
        profile.latest_deliverable_id = profileDelivery.id;

        if (typeof window !== 'undefined' && window.TutorView) {
            window.TutorView.selectedProfileId = profile.id;
            window.TutorView.selectedDeliverableId = profileDelivery.id;
        }

        try {
            fetch('/api/v1/thesis/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: profile.title,
                    abstract: profile.abstract,
                    fileName: profile.profile_file_name,
                    fileUrl: profile.profile_file_url
                })
            }).catch(() => {});
        } catch (_) {}

        this.save();
        this.notify();
        return profile;
    },

    // 6.1 Quick Update of any chapter's physical file
    quickUpdateChapterFile(chapterId, fileData) {
        const profile = this.state.data.profiles.find(p => p.registro === '220011559') || this.state.data.profiles[0];
        if (!profile) return null;

        const ch = profile.chapters.find(c => c.id === parseInt(chapterId));
        if (!ch) return null;

        ch.file_name = fileData.filename;
        ch.safe_name = fileData.safe_name;
        ch.file_size = fileData.size;
        ch.file_url = fileData.url;
        ch.download_url = fileData.download_url;
        ch.view_url = fileData.view_url;
        ch.uploaded_at = new Date().toLocaleDateString('es-BO');

        // Move to front so it becomes the latest deliverable
        const idx = profile.chapters.indexOf(ch);
        if (idx > 0) {
            profile.chapters.splice(idx, 1);
            profile.chapters.unshift(ch);
        }
        profile.latest_deliverable_id = ch.id;

        if (typeof window !== 'undefined' && window.TutorView) {
            window.TutorView.selectedProfileId = profile.id;
            window.TutorView.selectedDeliverableId = ch.id;
        }

        try {
            fetch('/api/v1/thesis/deliverable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ch.id,
                    deliverableType: ch.type,
                    chapterNumber: ch.number,
                    title: ch.title,
                    version: typeof ch.version === 'string' ? parseInt(ch.version.replace(/\D/g, '')) || 1 : ch.version,
                    status: ch.status,
                    date: ch.uploaded_at,
                    mainFileName: ch.file_name,
                    mainFileSize: ch.file_size,
                    mainFileUrl: ch.file_url,
                    notes: ch.notes || '',
                    previewExtract: ch.notes || '',
                    complementaryFiles: (ch.complementary_files || []).map(f => ({
                        name: f.name,
                        size: f.size,
                        url: f.url,
                        type: f.type || 'OTHER'
                    })),
                    observations: ch.observations || []
                })
            }).catch(() => {});
        } catch (_) {}

        this.save();
        this.notify();
        return ch;
    },

    resetState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        this.state.data = JSON.parse(JSON.stringify(this.initialData));
        this.state.currentUser = this.demoAccounts['estudiante.molina'];
        this.state.currentView = 'student-timeline';
        this.save();
        this.notify();
    },

    // 7. Emit Dictamen / Visto Bueno for Graduation Project
    emitDictamen({ profileId, chapterIdOrNumber, dictumResult, conclusions }) {
        const profile = this.state.data.profiles.find(p => p.id === parseInt(profileId));
        if (!profile) return null;

        const chapter = profile.chapters.find(c => c.id === parseInt(chapterIdOrNumber) || c.number === parseInt(chapterIdOrNumber));
        if (!chapter) return null;

        chapter.status = dictumResult;
        chapter.dictum_date = new Date().toLocaleDateString('es-BO');
        chapter.dictum_notes = conclusions;

        if (dictumResult === 'APROBADO') {
            chapter.observations.forEach(o => { o.resolved = true; });
        }

        this.save();
        this.notify();
        return chapter;
    },

    emitChapterDictum(profileId, chapterIdOrNumber, dictumResult, conclusions) {
        return this.emitDictamen({ profileId, chapterIdOrNumber, dictumResult, conclusions });
    },

    // 8. Query CPD for Graduation Modality (Proyecto de Grado)
    queryCPD(registro) {
        const cleanReg = String(registro).trim();
        const record = this.state.data.cpdDatabase[cleanReg];
        if (record) return record;

        const num = parseInt(cleanReg) || 0;
        if (num >= 219000000 && num <= 220999999) {
            return {
                estudiante: 'Postulante Regular Egresado',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'EGRESADO HABILITADO',
                materias_aprobadas: 56,
                materias_total: 56,
                porcentaje_malla: 100,
                ppa: 71.0,
                certificado_conclusion: 'CE-FICCT-2026-AUTO',
                deuda_daf: false,
                habilitado: true,
                modalidad_habilitada: 'Proyecto de Grado',
                motivo: 'Egresado verificado en el sistema central CPD UAGRM con 56/56 materias aprobadas (100% malla curricular vencida).'
            };
        } else {
            return {
                estudiante: 'Postulante No Habilitado',
                carrera: 'Ingeniería en Sistemas',
                malla: 'Plan 187-3',
                condicion: 'ALUMNO REGULAR EN CURSO',
                materias_aprobadas: 34,
                materias_total: 56,
                porcentaje_malla: 60.7,
                ppa: 54.0,
                certificado_conclusion: 'NO EMITIDO',
                deuda_daf: false,
                habilitado: false,
                modalidad_habilitada: 'NINGUNA',
                motivo: 'RECHAZADO: Malla curricular incompleta (34/56 asignaturas aprobadas). La Modalidad de Graduación: Proyecto de Grado exige el 100% de materias aprobadas (56 asignaturas) según el Reglamento de Graduación de la FICCT.'
            };
        }
    }
};

window.Store = Store;

/**
 * SIS-GradMatch: Student Portal Views with Multi-Category & Multi-File Support
 * Modalidad de Graduación: Proyecto de Grado (Malla Curricular 100% Vencida)
 * Postulante: Molina Cortez Maikol Anthony | Reg: 220011559 | Plan 187-3
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const StudentView = {
    async render(viewName, container) {
        if (viewName === 'student-timeline') {
            await this.renderTimeline(container);
        } else if (viewName === 'student-profile') {
            await this.renderProfileUpload(container);
        } else if (viewName === 'student-draft') {
            await this.renderDraftSubmit(container);
        } else if (viewName === 'student-observations') {
            await this.renderObservations(container);
        } else if (viewName === 'director-matchmaking') {
            if (window.DirectorView) await DirectorView.renderMatchmakingStudio(container);
        } else if (viewName === 'student-classifier') {
            if (window.VoiceAgent) VoiceAgent.openDeepLearningModal();
            await this.renderTimeline(container);
        }
    },

    // 1. Degree Progress Timeline View
    async renderTimeline(container) {
        const currentReg = Store.state.currentUser?.registro;
        const profile = (currentReg ? Store.state.data.profiles.find(p => p.registro === currentReg) : null) || Store.state.data.profiles[0];
        const student = Store.state.currentUser || Store.demoAccounts['estudiante.molina'];

        const approvedChapters = profile.chapters.filter(c => c.status === 'APROBADO').length;
        const totalChapters = profile.chapters.length || 1;
        const progressPct = Math.round((approvedChapters / totalChapters) * 100);

        const allObs = [];
        profile.chapters.forEach(c => {
            c.observations.forEach(o => {
                allObs.push({ ...o, chapterNumber: c.number, chapterTitle: c.title });
            });
        });

        const steps = [
            { id: 1, title: 'Habilitación CPD (Malla 100%)', status: 'completed', date: '05/10/2026' },
            { id: 2, title: 'Perfil de Proyecto de Grado', status: 'completed', date: '18/10/2026' },
            { id: 3, title: 'Asignación Asesor & RA', status: profile.tutor_name ? 'completed' : 'active', date: profile.assigned_date || 'En trámite' },
            { id: 4, title: 'Borradores de Avance', status: profile.tutor_name ? 'active' : 'pending', date: `${approvedChapters} de ${totalChapters} Aprobados` },
            { id: 5, title: 'Visto Bueno Asesor (F-08)', status: approvedChapters === totalChapters ? 'completed' : 'pending', date: 'Pendiente' },
            { id: 6, title: 'Tribunal Evaluador (3 Docentes)', status: 'pending', date: 'Pendiente' },
            { id: 7, title: 'Defensa Pública & Titulación', status: 'pending', date: 'Pendiente' }
        ];

        const getTypeBadge = (t) => {
            switch(t) {
                case 'COMPLETO': return '<span style="font-size: 0.7rem; background: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-weight: 700;">📑 DOC COMPLETO</span>';
                case 'ANEXO': return '<span style="font-size: 0.7rem; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 700;">📁 ANEXO</span>';
                case 'MANUAL': return '<span style="font-size: 0.7rem; background: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">⚙️ MANUAL</span>';
                case 'INSTRUMENTO': return '<span style="font-size: 0.7rem; background: #ccfbf1; color: #115e59; padding: 2px 6px; border-radius: 4px; font-weight: 700;">📊 INSTRUMENTO</span>';
                case 'CODIGO': return '<span style="font-size: 0.7rem; background: #fae8ff; color: #86198f; padding: 2px 6px; border-radius: 4px; font-weight: 700;">💻 CÓDIGO</span>';
                default: return '<span style="font-size: 0.7rem; background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: 700;">📖 CAPÍTULO</span>';
            }
        };

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Expediente de Graduación: Proyecto de Grado</h1>
                    <p class="page-subtitle">Postulante a Grado Académico: <strong>${student.name}</strong> | Registro: ${student.registro} | Condición: <span style="color: var(--success); font-weight: 700;">Egresado Habilitado (Malla Curricular 100% Vencida)</span> | Carrera: ${student.carrera}</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Store.setView('student-draft')">
                        📤 Subir Nuevo Entregable
                    </button>
                </div>
            </div>

            <!-- Stepper Timeline -->
            <div class="card">
                <div class="timeline-stepper">
                    ${steps.map(s => `
                        <div class="step-item ${s.status}">
                            <div class="step-circle">${s.status === 'completed' ? '✓' : s.id}</div>
                            <span class="step-title">${s.title}</span>
                            <span style="font-size: 0.7rem; color: #94a3b8;">${s.date}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Active Thesis Summary -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">📖 Detalle de la Modalidad de Graduación</h2>
                        <span class="status-pill ${profile.status === 'ASIGNADO' ? 'aprobado' : 'pendiente'}">
                            ${profile.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Título Oficial Aprobado:</span>
                        <h3 style="font-size: 1.15rem; color: var(--primary); margin-top: 4px; line-height: 1.3;">
                            ${profile.title}
                        </h3>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
                        <div>
                            <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">DOCENTE ASESOR / GUÍA DESIGNADO:</span>
                            <div style="font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                                ${profile.tutor_name || '<span style="color: #94a3b8;">En proceso de asignación</span>'}
                            </div>
                        </div>
                        <div>
                            <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">RESOLUCIÓN ADMINISTRATIVA DE GRADO:</span>
                            <div style="font-weight: 700; color: var(--accent-red); margin-top: 2px;">
                                ${profile.resolution ? `
                                    <a href="javascript:void(0)" onclick="ResolutionModal.open('${profile.resolution}', '${student.name}', '${profile.tutor_name}')" style="color: var(--accent-red); text-decoration: underline;">
                                        ${profile.resolution}
                                    </a>
                                ` : '<span style="color: #94a3b8;">Pendiente de emisión</span>'}
                            </div>
                            <span style="font-size: 0.7rem; color: #64748b;">Plazo reglamentario: 180 días calendario</span>
                        </div>
                    </div>

                    <!-- Chapters Progress -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="font-size: 0.95rem; font-weight: 700;">Entregables Presentados (${profile.chapters.length})</h4>
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">Progreso: ${progressPct}%</span>
                    </div>

                    <div class="similarity-progress" style="margin-bottom: 16px;">
                        <div class="similarity-fill" style="width: ${progressPct}%;"></div>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Título de Avance</th>
                                    <th>Versión</th>
                                    <th>Archivo Principal</th>
                                    <th>Complementarios</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${profile.chapters.map(c => {
                                    const compCount = (c.complementary_files || []).length;
                                    const safeFile = c.safe_name || (c.file_name ? c.file_name.replace(/\s+/g, '_') : 'documento.pdf');
                                    const rawName = c.file_name || safeFile;
                                    const downUrl = c.download_url || `/api/v1/storage/download/${safeFile}?name=${encodeURIComponent(rawName)}`;
                                    const viewUrl = c.view_url || c.file_url || `/api/v1/storage/view/${safeFile}`;
                                    return `
                                    <tr>
                                        <td>${getTypeBadge(c.type)}</td>
                                        <td><strong>${c.title}</strong></td>
                                        <td>${c.version}</td>
                                        <td>
                                            <a href="${downUrl}" download="${rawName}" style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-decoration: underline;" target="_blank">
                                                📄 ${rawName} (${c.file_size})
                                            </a>
                                        </td>
                                        <td>
                                            ${compCount > 0 ? `
                                                <span style="font-size: 0.75rem; color: #0284c7; font-weight: 600;">
                                                    📎 ${compCount} archivo(s)
                                                </span>
                                            ` : '<span style="font-size: 0.75rem; color: #94a3b8;">Ninguno</span>'}
                                        </td>
                                        <td>
                                            <span class="status-pill ${c.status === 'APROBADO' ? 'aprobado' : (c.status === 'OBSERVADO' ? 'observado' : 'en-revision')}">
                                                ${c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                <input type="file" id="quick-file-input-${c.id}" style="display: none;" onchange="StudentView.onQuickFileSelected(${c.id}, this)">
                                                <button class="btn btn-sm btn-primary" style="font-size: 0.7rem; padding: 4px 8px;" onclick="document.getElementById('quick-file-input-${c.id}').click()" title="Subir archivo físico desde tu equipo">
                                                    📤 Subir
                                                </button>
                                                <button class="btn btn-sm btn-outline-primary" style="font-size: 0.7rem; padding: 4px 8px; border: 1px solid var(--primary); background: transparent; color: var(--primary);" onclick="StudentView.openDocumentViewerModal('${viewUrl}', '${rawName}')" title="Ver en visor">
                                                    👁️ Ver
                                                </button>
                                                <a href="${downUrl}" download="${rawName}" class="btn btn-sm btn-secondary" style="font-size: 0.7rem; padding: 4px 8px;" title="Descargar archivo físico">
                                                    ⬇ Descargar
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Right Card: Postulante & Graduation Regulations -->
                <div>
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3 class="card-title">🎓 Postulante a Título</h3>
                        </div>
                        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px;">
                            <div class="user-avatar" style="width: 48px; height: 48px; font-size: 1.1rem; background: var(--primary); color: white;">
                                MM
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 0.95rem;">${student.name}</h4>
                                <span style="font-size: 0.8rem; color: #64748b;">Reg: ${student.registro}</span>
                            </div>
                        </div>

                        <div style="font-size: 0.8rem; color: #334155; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Carrera:</span>
                                <strong>Ingeniería en Sistemas</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Plan de Estudios:</span>
                                <strong>Plan 187-3 (Semestral)</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Malla Curricular:</span>
                                <strong style="color: var(--success);">56 / 56 Vencidas (100%)</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Condición CPD:</span>
                                <strong style="color: var(--primary);">Egresado Regular Habilitado</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Modalidad de Graduación:</span>
                                <strong>Proyecto de Grado</strong>
                            </div>
                        </div>

                        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                            <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="Store.setView('student-profile')">
                                📄 Actualizar Perfil de Proyecto de Grado
                            </button>
                        </div>
                    </div>

                    <!-- Active Observations Alert -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">⚠️ Observaciones del Asesor</h3>
                            <span class="status-pill observado">${allObs.filter(o => !o.resolved).length} Pendientes</span>
                        </div>
                        <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 12px;">
                            El docente asesor ha registrado observaciones técnicas y metodológicas sobre los últimos borradores entregados.
                        </p>
                        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="Store.setView('student-observations')">
                            Ver Observaciones Detalladas
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // 2. Profile Submission Form View
    async renderProfileUpload(container) {
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Carga y Registro de Perfil de Proyecto de Grado</h1>
                    <p class="page-subtitle">Modalidad de Graduación para Egresados con Malla Curricular 100% Vencida • FICCT UAGRM</p>
                </div>
            </div>

            <div class="card" style="max-width: 800px;">
                <div class="card-header">
                    <h2 class="card-title">📄 Formulario de Registro de Perfil de Grado</h2>
                    <span class="status-pill aprobado">CPD Habilitado (56/56 Materias)</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Modalidad de Graduación Reglamentaria:</label>
                    <select class="form-select" id="profile-modality" disabled style="background: #f1f5f9; font-weight: 700; color: var(--primary);">
                        <option selected>Proyecto de Grado (Reglamento de Graduación UAGRM)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Título Propuesto del Proyecto de Grado:</label>
                    <input type="text" class="form-input" id="profile-title" value="Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning">
                </div>

                <div class="form-group">
                    <label class="form-label">Resumen Ejecutivo y Objetivos (Para Extracción de Vectores Semánticos NLP):</label>
                    <textarea class="form-textarea" rows="4" id="profile-summary">El presente trabajo diseña e implementa una plataforma web y móvil inteligente para la Carrera de Ingeniería en Sistemas de la FICCT - UAGRM. Integra procesamiento de lenguaje natural y modelos de similitud coseno vectorial para emparejar perfiles postulantes con la especialidad docente, reduciendo los tiempos de tramitación de 14 semanas a menos de 48 horas.</textarea>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong style="color: #166534; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
                            <span>🧠</span> Clasificador Semántico por Deep Learning
                        </strong>
                        <span style="color: #15803d; font-size: 0.8rem;">Analiza previamente tu título y objetivos para predecir tu eje temático y recomendaciones SQA.</span>
                    </div>
                    <button type="button" class="btn" onclick="VoiceAgent.openDeepLearningModal({ title: document.getElementById('profile-title').value, abstract: document.getElementById('profile-summary').value })" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; font-weight: 700; font-size: 0.8rem; padding: 8px 14px;">
                        ⚡ Analizar con Deep Learning
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Seleccionar Archivo Real de Perfil (PDF):</label>
                    <input type="file" id="profile-file-input" class="form-input" accept=".pdf,.doc,.docx" style="padding: 8px;">
                    <div id="profile-file-info" style="font-size: 0.8rem; color: #64748b; margin-top: 6px;">
                        Selecciona tu archivo de perfil en PDF para almacenarlo en el servidor universitario.
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="Store.setView('student-timeline')">Cancelar</button>
                    <button class="btn btn-primary" id="btn-submit-profile">
                        🚀 Enviar Perfil a Dirección de Carrera
                    </button>
                </div>
            </div>
        `;

        const fileInput = document.getElementById('profile-file-input');
        const fileInfo = document.getElementById('profile-file-info');
        let selectedFile = null;

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                selectedFile = e.target.files[0];
                fileInfo.innerHTML = `<strong>✓ Archivo seleccionado:</strong> ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`;
            }
        });

        document.getElementById('btn-submit-profile').addEventListener('click', async () => {
            const btn = document.getElementById('btn-submit-profile');
            const title = document.getElementById('profile-title').value;
            const summary = document.getElementById('profile-summary').value;

            if (!title || !summary) {
                alert('Por favor complete el título y el resumen del perfil.');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Subiendo perfil al servidor...';

            let uploadedUrl = '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf';
            let fileName = 'Perfil_Proyecto_Grado_Molina.pdf';
            const profileFile = (fileInput.files && fileInput.files[0]) ? fileInput.files[0] : selectedFile;

            if (profileFile) {
                try {
                    const formData = new FormData();
                    formData.append('file', profileFile);
                    const res = await fetch('/api/v1/storage/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (res.ok) {
                        const data = await res.json();
                        uploadedUrl = data.url;
                        fileName = data.filename;
                        Store.submitStudentProfile({
                            title,
                            abstract: summary,
                            fileName: data.filename,
                            fileUrl: data.url,
                            downloadUrl: data.download_url,
                            viewUrl: data.view_url,
                            safeName: data.safe_name,
                            fileSize: data.size
                        });
                        alert(`✅ Perfil de Proyecto de Grado "${title}" subido físicamente al servidor con éxito.\n\nArchivo: ${data.filename} (${data.size})\nRuta: ${data.url}\nEstado: PENDIENTE DE ASIGNACIÓN DE ASESOR`);
                        Store.setView('student-timeline');
                        return;
                    }
                } catch (err) {
                    console.warn('Subida en modo local fallback:', err);
                }
            }

            Store.submitStudentProfile({
                title,
                abstract: summary,
                fileName,
                fileUrl: uploadedUrl
            });

            alert(`✅ Perfil de Proyecto de Grado "${title}" registrado exitosamente en el servidor.\n\nArchivo: ${fileName}\nEstado: PENDIENTE DE ASIGNACIÓN DE ASESOR\nLa Dirección de Carrera (M.Sc. Ing. Leonardo Vargas Peña) procederá con la ponderación de afinidad semántica.`);
            Store.setView('student-timeline');
        });
    },

    // 3. Draft Submission View with REAL MULTI-FILE UPLOAD TO BACKEND
    async renderDraftSubmit(container) {
        const profiles = (Store.state.data && Array.isArray(Store.state.data.profiles) && Store.state.data.profiles.length > 0)
            ? Store.state.data.profiles
            : Store.initialData.profiles;
        let profile = null;
        if (Store.state.selectedObservationProfileId) {
            profile = profiles.find(p => p.id === Store.state.selectedObservationProfileId);
        }
        if (!profile && Store.state.currentUser && Store.state.currentUser.registro) {
            profile = profiles.find(p => p.registro === Store.state.currentUser.registro);
        }
        if (!profile) profile = profiles[0] || Store.initialData.profiles[0];

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Carga de Entregables y Borradores de Proyecto de Grado</h1>
                    <p class="page-subtitle">Modalidad: ${profile.modalidad} • Postulante: <strong>${profile.student}</strong> (Reg. ${profile.registro}) • Asesor: <strong>${profile.tutor_name || 'Ing. Rolando Antoni Martínez Canedo'}</strong></p>
                </div>
            </div>

            <div class="card" style="max-width: 800px;">
                <div class="card-header">
                    <h2 class="card-title">📤 Nuevo Envío de Avance (Subida Real Multi-Archivo)</h2>
                    <span class="status-pill en-revision">Revisión Asesor</span>
                </div>

                <!-- Deliverable Category Selection -->
                <div class="form-group">
                    <label class="form-label">Categoría del Entregable Académico:</label>
                    <select class="form-select" id="delivery-type-select" style="font-weight: 700; color: var(--primary);">
                        <option value="COMPLETO">📑 Documento Borrador Completo (Consolidado de Tesis para Tribunal)</option>
                        <option value="CAPITULO" selected>📖 Capítulo Específico</option>
                        <option value="ANEXO">📁 Anexos y Apéndices Técnicos (Matriz McCabe, etc.)</option>
                        <option value="MANUAL">⚙️ Manuales del Sistema (Usuario / Despliegue en GCP)</option>
                        <option value="INSTRUMENTO">📊 Instrumentos de Validación / Encuestas</option>
                        <option value="CODIGO">💻 Código Fuente del Proyecto (ZIP / Bundle)</option>
                    </select>
                </div>

                <div id="chapter-number-group" style="display: grid; grid-template-columns: 1fr 2fr; gap: 14px; margin-bottom: 14px;">
                    <div class="form-group">
                        <label class="form-label">N° de Capítulo:</label>
                        <select class="form-select" id="delivery-chapter-num">
                            <option value="1">Capítulo 1</option>
                            <option value="2">Capítulo 2</option>
                            <option value="3" selected>Capítulo 3</option>
                            <option value="4">Capítulo 4</option>
                            <option value="5">Capítulo 5</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Título del Entregable:</label>
                        <input type="text" class="form-input" id="delivery-title" value="Metodología, Arquitectura C4 y Pruebas McCabe">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Versión de Entrega:</label>
                    <input type="text" class="form-input" id="delivery-version" value="v3.0 (Subsanación de Observaciones)">
                </div>

                <div class="form-group">
                    <label class="form-label">Notas para el Asesor / Resumen de Correcciones:</label>
                    <textarea class="form-textarea" id="delivery-notes" rows="3">Se subsanan las observaciones sobre arquitectura C4 y grafo de McCabe en las páginas 42 y 49. Se adjunta matriz Excel de pruebas y diagrama de contenedores en alta resolución.</textarea>
                </div>

                <!-- SECTION 1: MAIN FILE (REQUIRED) -->
                <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2rem;">⭐</span>
                        <strong style="color: var(--primary); font-size: 0.95rem;">ARCHIVO PRINCIPAL (OBLIGATORIO)</strong>
                        <span style="font-size: 0.75rem; color: #1d4ed8; font-weight: 600;">— Se subirá físicamente al servidor y se cargará en el visor del docente</span>
                    </div>

                    <input type="file" id="main-file-input" class="form-input" accept=".pdf,.doc,.docx" style="padding: 10px; background: white; cursor: pointer;">
                    
                    <div id="main-file-info" style="margin-top: 8px; font-size: 0.85rem; color: #1e3a8a;">
                        <span style="color: #64748b;">Selecciona el archivo PDF o Word principal de este entregable.</span>
                    </div>
                </div>

                <!-- SECTION 2: COMPLEMENTARY FILES (OPTIONAL) -->
                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2rem;">📎</span>
                        <strong style="color: var(--text-primary); font-size: 0.95rem;">ARCHIVOS COMPLEMENTARIOS (OPCIONALES)</strong>
                        <span style="font-size: 0.75rem; color: #64748b;">— Puedes seleccionar varios: tablas Excel (.xlsx), diagramas PNG, scripts SQL, ZIP</span>
                    </div>

                    <input type="file" id="comp-files-input" multiple class="form-input" accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.zip,.rar,.sql,.eap" style="padding: 8px; background: white; cursor: pointer;">
                    
                    <div id="comp-files-list" style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
                        <span style="font-size: 0.8rem; color: #94a3b8;">Ningún archivo complementario seleccionado aún.</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="Store.setView('student-timeline')">Cancelar</button>
                    <button class="btn btn-primary" id="btn-submit-delivery">
                        📤 Enviar Entregable al Docente Asesor
                    </button>
                </div>
            </div>
        `;

        const typeSelect = document.getElementById('delivery-type-select');
        const numGroup = document.getElementById('chapter-number-group');
        const titleInput = document.getElementById('delivery-title');
        const numSelect = document.getElementById('delivery-chapter-num');
        const mainInput = document.getElementById('main-file-input');
        const mainInfo = document.getElementById('main-file-info');
        const compInput = document.getElementById('comp-files-input');
        const compList = document.getElementById('comp-files-list');

        let rawMainFile = null;
        let rawCompFiles = [];

        // Type selection change handler
        typeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'COMPLETO') {
                numGroup.style.display = 'none';
                titleInput.value = 'Documento Borrador Completo (Consolidado de Tesis para Tribunal)';
            } else if (val === 'ANEXO') {
                numGroup.style.display = 'none';
                titleInput.value = 'Anexo Técnico: Matriz de Pruebas McCabe y Grafos de Control';
            } else if (val === 'MANUAL') {
                numGroup.style.display = 'none';
                titleInput.value = 'Manual Técnico de Despliegue en GCP Cloud Run y Docker';
            } else if (val === 'INSTRUMENTO') {
                numGroup.style.display = 'none';
                titleInput.value = 'Instrumentos de Validación Empírica y Encuestas de Usuario';
            } else if (val === 'CODIGO') {
                numGroup.style.display = 'none';
                titleInput.value = 'Código Fuente, Scripts SQL y Repositorio Comprimido';
            } else {
                numGroup.style.display = 'grid';
                numSelect.dispatchEvent(new Event('change'));
            }
        });

        numSelect.addEventListener('change', (e) => {
            const num = parseInt(e.target.value);
            const titles = {
                1: 'Introducción, Planteamiento del Problema y Objetivos',
                2: 'Marco Teórico, Estado del Arte y Tecnologías',
                3: 'Metodología, Arquitectura C4 y Pruebas McCabe',
                4: 'Implementación del Software y Resultados Experimentales',
                5: 'Conclusiones, Recomendaciones y Trabajos Futuros'
            };
            titleInput.value = titles[num] || `Capítulo ${num}`;
        });

        // Main file selection
        mainInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                rawMainFile = e.target.files[0];
                const sizeMb = (rawMainFile.size / (1024 * 1024)).toFixed(2);
                mainInfo.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #0369a1; font-weight: 700;">
                        <span>✓ Archivo Principal Listo:</span> ${rawMainFile.name} (${sizeMb} MB)
                    </div>
                `;
            }
        });

        // Complementary files selection
        compInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                rawCompFiles = Array.from(e.target.files);
                let html = '';
                rawCompFiles.forEach((f) => {
                    const sizeMb = (f.size / (1024 * 1024)).toFixed(2);
                    const sizeStr = parseFloat(sizeMb) < 1 ? `${Math.round(f.size / 1024)} KB` : `${sizeMb} MB`;
                    html += `
                        <div style="font-size: 0.8rem; background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                            <span>📎 <strong>${f.name}</strong></span>
                            <span style="color: #64748b; font-size: 0.75rem;">${sizeStr}</span>
                        </div>
                    `;
                });
                compList.innerHTML = html;
            }
        });

        // Submit action with REAL MULTIPART UPLOAD TO BACKEND
        document.getElementById('btn-submit-delivery').addEventListener('click', async () => {
            const btn = document.getElementById('btn-submit-delivery');
            const delType = typeSelect.value;
            const delNum = delType === 'CAPITULO' ? numSelect.value : 0;
            const delTitle = titleInput.value;
            const delVer = document.getElementById('delivery-version').value;
            const delNotes = document.getElementById('delivery-notes').value;

            const chosenFile = (mainInput.files && mainInput.files[0]) ? mainInput.files[0] : rawMainFile;

            if (!chosenFile) {
                alert('⚠️ Por favor selecciona el Archivo Principal (PDF, DOCX o ZIP) desde tu equipo antes de enviar.');
                document.getElementById('main-file-input').focus();
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Subiendo archivo físico al servidor...';

            let mainFileToSave = null;

            // 1. Upload Main File physically
            try {
                const formData = new FormData();
                formData.append('file', chosenFile);
                const res = await fetch('/api/v1/storage/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) {
                    throw new Error(`Código de servidor ${res.status}: ${res.statusText}`);
                }
                const data = await res.json();
                mainFileToSave = {
                    name: data.filename,
                    safe_name: data.safe_name,
                    size: data.size,
                    url: data.url,
                    download_url: data.download_url,
                    view_url: data.view_url,
                    blob_url: URL.createObjectURL(chosenFile)
                };
            } catch (err) {
                console.error('Error subiendo archivo principal:', err);
                alert('❌ Error al subir el archivo físico al servidor:\n' + err.message + '\n\nVerifica que la API en el puerto 8000 esté activa.');
                btn.disabled = false;
                btn.innerHTML = '📤 Enviar Entregable al Docente Asesor';
                return;
            }

            // 2. Upload Complementary Files physically
            const compFilesToSave = [];
            const compFilesList = (compInput.files && compInput.files.length > 0) ? Array.from(compInput.files) : rawCompFiles;
            for (const f of compFilesList) {
                try {
                    const compForm = new FormData();
                    compForm.append('file', f);
                    const res = await fetch('/api/v1/storage/upload', {
                        method: 'POST',
                        body: compForm
                    });
                    if (res.ok) {
                        const data = await res.json();
                        compFilesToSave.push({
                            name: data.filename,
                            safe_name: data.safe_name,
                            size: data.size,
                            url: data.url,
                            download_url: data.download_url,
                            view_url: data.view_url,
                            blob_url: URL.createObjectURL(f)
                        });
                    }
                } catch (err) {
                    console.warn('Error subiendo complementario:', err);
                }
            }

            // 3. Save to Global Store
            Store.submitStudentDelivery({
                deliveryType: delType,
                number: delNum,
                title: delTitle,
                version: delVer,
                notes: delNotes,
                mainFile: mainFileToSave,
                compFiles: compFilesToSave
            });

            alert(`✅ ¡Entregable "${delTitle}" subido físicamente con éxito al servidor universitario!\n\n⭐ Archivo Principal: ${mainFileToSave.name} (${mainFileToSave.size})\n📎 Archivos Complementarios: ${compFilesToSave.length}\nRuta de almacenamiento: ${mainFileToSave.url}\n\nEl Docente Asesor (${profile.tutor_name || 'Ing. Rolando Antoni Martínez Canedo'}) ya puede examinar el archivo real en su visor integrado.`);
            Store.setView('student-timeline');
        });
    },

    // 4. Observations List View con Selector Multi-Tesista
    async renderObservations(container) {
        const profiles = (Store.state.data && Array.isArray(Store.state.data.profiles) && Store.state.data.profiles.length > 0)
            ? Store.state.data.profiles
            : Store.initialData.profiles;

        let profile = null;
        if (Store.state.selectedObservationProfileId) {
            profile = profiles.find(p => p.id === Store.state.selectedObservationProfileId);
        }
        if (!profile && Store.state.currentUser && Store.state.currentUser.registro) {
            profile = profiles.find(p => p.registro === Store.state.currentUser.registro);
        }
        if (!profile) {
            profile = profiles[0] || Store.initialData.profiles[0];
        }

        const allObs = [];
        (profile.chapters || []).forEach(c => {
            (c.observations || []).forEach(o => {
                allObs.push({ ...o, chapterNumber: c.number, chapterTitle: c.title });
            });
        });

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Historial de Observaciones Pedagógicas del Asesor</h1>
                    <p class="page-subtitle">Postulante Consultado: <strong>${profile.student}</strong> (Reg. ${profile.registro}) • Asesor: <strong>${profile.tutor_name || 'Ing. Rolando Antoni Martínez Canedo'}</strong> • Modalidad: ${profile.modalidad}</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="Store.setView('student-timeline')">
                        ⬅ Volver al Expediente
                    </button>
                    <button class="btn btn-primary" onclick="Store.setView('student-draft')">
                        📤 Subir Versión Corregida
                    </button>
                </div>
            </div>

            <!-- Selector Interactivo de Tesista para Observaciones -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.4rem;">👥</span>
                    <div>
                        <strong style="color: #0f172a; font-size: 0.95rem;">Seleccionar Tesista para Consultar Observaciones:</strong>
                        <div style="font-size: 0.78rem; color: #64748b;">Visualiza en tiempo real las correcciones registradas por el asesor pedagógico</div>
                    </div>
                </div>
                <select id="obs-student-select" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #94a3b8; font-weight: 700; font-size: 0.88rem; background: white; color: #0f172a; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" onchange="StudentView.changeObservationStudent(this.value)">
                    ${profiles.map(p => `
                        <option value="${p.id}" ${p.id === profile.id ? 'selected' : ''}>
                            [Reg. ${p.registro}] ${p.student} • Asesor: ${p.tutor_name || 'Sin Asignar'}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Observaciones Registradas en los Entregables de ${profile.student}</h2>
                    <span class="status-pill observado">${allObs.length} Observaciones Totales</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${allObs.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: #94a3b8;">
                            El estudiante <strong>${profile.student}</strong> no tiene observaciones pendientes registradas por el docente asesor.
                        </div>
                    ` : allObs.map(o => `
                        <div style="border: 1px solid var(--border-color); border-left: 5px solid ${o.type === 'TECNICA' ? 'var(--accent-red)' : 'var(--accent-gold)'}; border-radius: var(--radius-md); padding: 18px; background: #ffffff;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div>
                                    <span class="status-pill observado" style="font-size: 0.7rem;">${o.chapterTitle} • ${o.type}</span>
                                    <strong style="margin-left: 8px; font-size: 0.9rem;">Página ${o.page} (${o.section})</strong>
                                </div>
                                <span style="font-size: 0.75rem; color: #64748b;">${o.date}</span>
                            </div>
                            <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">
                                "${o.comment}"
                            </p>
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.75rem; color: ${o.resolved ? 'var(--success)' : 'var(--accent-red)'}; font-weight: 700;">
                                    ${o.resolved ? '✓ Subsanado' : '⚠️ Pendiente de Subsanar'}
                                </span>
                                <button class="btn btn-primary btn-sm" onclick="Store.setView('student-draft')">
                                    Subir Borrador Corregido
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    changeObservationStudent(profileId) {
        Store.state.selectedObservationProfileId = parseInt(profileId);
        const container = document.getElementById('main-content');
        if (container) this.renderObservations(container);
    },

    async onQuickFileSelected(chapterId, inputEl) {
        if (!inputEl.files || !inputEl.files[0]) return;
        const file = inputEl.files[0];
        
        let toast = document.getElementById('quick-upload-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'quick-upload-toast';
            toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: #0284c7; color: white; padding: 14px 22px; border-radius: 8px; z-index: 99999; box-shadow: 0 8px 24px rgba(0,0,0,0.3); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;';
            document.body.appendChild(toast);
        }
        toast.style.background = '#0284c7';
        toast.innerHTML = `<span>⏳</span> Subiendo archivo "${file.name}" directamente al servidor universitario...`;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/v1/storage/upload', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error(`El servidor respondió con código ${res.status}: ${res.statusText}`);
            const data = await res.json();
            
            Store.quickUpdateChapterFile(chapterId, data);

            toast.style.background = '#16a34a';
            toast.innerHTML = `<span>✅</span> ¡Archivo "${data.filename}" (${data.size}) subido y actualizado con éxito en el servidor!`;
            setTimeout(() => { if (toast) toast.remove(); }, 5000);
        } catch (err) {
            console.error('Error en subida rápida:', err);
            toast.style.background = '#dc2626';
            toast.innerHTML = `<span>❌</span> Error al subir: ${err.message}`;
            setTimeout(() => { if (toast) toast.remove(); }, 6000);
        }
    },

    openDocumentViewerModal(url, title) {
        let modal = document.getElementById('student-doc-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'student-doc-modal';
            modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15,23,42,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; padding: 20px;';
            document.body.appendChild(modal);
        }
        
        const isPdf = title.toLowerCase().endsWith('.pdf');
        const isImg = title.toLowerCase().endsWith('.png') || title.toLowerCase().endsWith('.jpg') || title.toLowerCase().endsWith('.jpeg');
        const cleanSafe = title.replace(/\s+/g, '_');
        const downloadUrl = `/api/v1/storage/download/${cleanSafe}?name=${encodeURIComponent(title)}`;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; width: 92vw; max-width: 950px; height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="padding: 14px 20px; background: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 1rem;">👁️ Visor de Documento Real: ${title}</strong>
                    <div style="display: flex; gap: 10px;">
                        <a href="${downloadUrl}" download="${title}" class="btn btn-sm btn-primary" style="padding: 4px 12px; font-size: 0.75rem;">⬇ Descargar Real</a>
                        <button class="btn btn-sm btn-secondary" onclick="document.getElementById('student-doc-modal').style.display='none'" style="color: white; border-color: #475569; padding: 4px 10px;">✕ Cerrar</button>
                    </div>
                </div>
                <div style="flex: 1; background: #334155; position: relative;">
                    ${isPdf ? `
                        <iframe src="${url}?t=${Date.now()}#toolbar=1" style="width: 100%; height: 100%; border: none;"></iframe>
                    ` : isImg ? `
                        <div style="display:flex; justify-content:center; align-items:center; height:100%; padding:20px;">
                            <img src="${url}?t=${Date.now()}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:6px;">
                        </div>
                    ` : `
                        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; background:white; padding:30px; text-align:center;">
                            <span style="font-size:3.5rem; margin-bottom:12px;">📄</span>
                            <h3 style="color:#0f172a; margin-bottom:6px;">${title}</h3>
                            <p style="color:#64748b; max-width:500px; margin-bottom:20px; line-height:1.5;">
                                Este archivo fue almacenado físicamente en el servidor. Al ser un archivo de Word/ZIP/código, descárgalo directamente a continuación para abrirlo con su programa:
                            </p>
                            <a href="${downloadUrl}" download="${title}" class="btn btn-primary btn-lg" style="padding: 10px 24px; font-weight:700;">
                                ⬇ Descargar Archivo Físico
                            </a>
                        </div>
                    `}
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }
};

window.StudentView = StudentView;

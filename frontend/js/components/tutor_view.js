/**
 * SIS-GradMatch: Tutor Reviewer View with Embedded Viewer & Multi-File Support
 * Modalidad de Graduación: Proyecto de Grado (Malla Curricular 100% Vencida)
 * Docente Asesor: Ing. Rolando Antoni Martínez Canedo
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const TutorView = {
    selectedProfileId: 1,
    selectedDeliverableId: 3,
    activeViewerTab: 'pdf',

    async render(viewName, container) {
        if (viewName === 'tutor-inbox') {
            await this.renderInbox(container);
        } else if (viewName === 'tutor-reviewer') {
            await this.renderReviewer(container);
        } else if (viewName === 'tutor-dictamen') {
            await this.renderDictamen(container);
        }
    },

    // 1. Tutor Assigned Theses Inbox
    async renderInbox(container) {
        const tutor = Store.state.currentUser;
        const allProfiles = Store.state.data.profiles;
        const myTheses = allProfiles.filter(p => p.tutor_username === tutor.username || p.id === 1);

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Bandeja de Proyectos de Grado Asignados</h1>
                    <p class="page-subtitle">Docente Asesor: <strong>${tutor.name}</strong> (${tutor.department}) • Plazas: 3 / ${tutor.quota_max || 5}</p>
                </div>
            </div>

            <!-- Tutor Metric Cards -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <span class="metric-label">Proyectos Asignados</span>
                    <span class="metric-value">${myTheses.length}</span>
                    <span class="metric-trend up">Modalidad de Graduación Activa</span>
                </div>
                <div class="metric-card">
                    <span class="metric-label">Borradores por Revisar</span>
                    <span class="metric-value" style="color: var(--accent-red);">
                        ${myTheses.reduce((acc, t) => acc + t.chapters.filter(c => c.status === 'EN_REVISION' || c.status === 'OBSERVADO').length, 0)}
                    </span>
                    <span class="metric-trend down">Pendientes de evaluación</span>
                </div>
                <div class="metric-card">
                    <span class="metric-label">Vistos Buenos Otorgados</span>
                    <span class="metric-value" style="color: var(--success);">
                        ${myTheses.reduce((acc, t) => acc + t.chapters.filter(c => c.status === 'APROBADO').length, 0)}
                    </span>
                    <span class="metric-trend up">Listos para Tribunal</span>
                </div>
            </div>

            <!-- Theses List Table -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Expedientes de Proyecto de Grado Asignados por Resolución</h2>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Postulante</th>
                                <th>Título de Proyecto de Grado</th>
                                <th>Resolución (RA)</th>
                                <th>Último Entregable</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myTheses.map(thesis => {
                                const lastCh = thesis.chapters[0] || { title: 'Sin entregas', version: '-', status: '-' };
                                return `
                                <tr>
                                    <td>
                                        <strong>${thesis.student}</strong>
                                        <div style="font-size: 0.75rem; color: #64748b;">Reg: ${thesis.registro} • Egresado</div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary); max-width: 380px;">${thesis.title}</div>
                                        <div style="font-size: 0.75rem; color: #64748b;">${thesis.areas ? thesis.areas.join(' • ') : 'Ingeniería de Software'}</div>
                                    </td>
                                    <td>
                                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-red);">${thesis.resolution || 'En trámite'}</span>
                                    </td>
                                    <td>
                                        <div style="font-size: 0.85rem; font-weight: 600;">${lastCh.title}</div>
                                        <div style="font-size: 0.75rem; color: #64748b;">Versión ${lastCh.version} • ${lastCh.uploaded_at || '18/11/2026'}</div>
                                    </td>
                                    <td>
                                        <span class="status-pill ${lastCh.status === 'APROBADO' ? 'aprobado' : (lastCh.status === 'OBSERVADO' ? 'observado' : 'en-revision')}">
                                            ${lastCh.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="TutorView.openReviewer(${thesis.id}, ${lastCh.id})">
                                            🔍 Examinar en Visor
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openReviewer(profileId, deliverableId) {
        this.selectedProfileId = profileId;
        this.selectedDeliverableId = deliverableId;
        Store.setView('tutor-reviewer');
    },

    // 2. Embedded Document Reviewer View
    async renderReviewer(container) {
        const profile = Store.state.data.profiles.find(p => p.id === this.selectedProfileId) || Store.state.data.profiles[0];
        const deliverable = profile.chapters.find(c => c.id === this.selectedDeliverableId) || profile.chapters[0];

        const getTypeLabel = (t) => {
            switch(t) {
                case 'COMPLETO': return '📑 DOCUMENTO BORRADOR COMPLETO';
                case 'ANEXO': return '📁 ANEXO TÉCNICO';
                case 'MANUAL': return '⚙️ MANUAL DEL SISTEMA';
                case 'INSTRUMENTO': return '📊 INSTRUMENTO DE VALIDACIÓN';
                case 'CODIGO': return '💻 CÓDIGO FUENTE Y SCRIPTS';
                default: return '📖 CAPÍTULO ESPECÍFICO';
            }
        };

        const safeFile = deliverable.safe_name || (deliverable.file_name ? deliverable.file_name.replace(/\s+/g, '_') : 'documento.pdf');
        const rawName = deliverable.file_name || safeFile;
        const downloadUrl = deliverable.download_url || `/api/v1/storage/download/${safeFile}?name=${encodeURIComponent(rawName)}`;
        const viewUrl = deliverable.view_url || `/api/v1/storage/view/${safeFile}`;
        const fileUrl = deliverable.file_url || `/storage/drafts/${safeFile}`;
        const fileNameLower = (deliverable.file_name || '').toLowerCase();
        const isPdf = fileNameLower.endsWith('.pdf');
        const isImage = fileNameLower.endsWith('.png') || fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg');

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Visor Interactivo y Revisión Pedagógica</h1>
                    <p class="page-subtitle">Modalidad: <strong>Proyecto de Grado</strong> • Postulante: <strong>${profile.student}</strong> (Reg. ${profile.registro}) • Asesor: <strong>${Store.state.currentUser.name}</strong></p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="Store.setView('tutor-inbox')">
                        ⬅ Volver a Bandeja
                    </button>
                    <button class="btn btn-success" onclick="Store.setView('tutor-dictamen')">
                        ✅ Emitir Dictamen Oficial (F-08)
                    </button>
                </div>
            </div>

            <!-- Deliverable Selector & Category Bar -->
            <div class="card" style="padding: 14px 20px; margin-bottom: 18px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">Entregable a Examinar:</span>
                        <select class="form-select" id="select-active-deliverable" style="width: auto; min-width: 360px; font-weight: 600;">
                            ${profile.chapters.map(c => `
                                <option value="${c.id}" ${c.id === deliverable.id ? 'selected' : ''}>
                                    ${getTypeLabel(c.type)}: ${c.title} (${c.version} - ${c.status})
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 0.8rem; color: #64748b;">Estado:</span>
                        <span class="status-pill ${deliverable.status === 'APROBADO' ? 'aprobado' : (deliverable.status === 'OBSERVADO' ? 'observado' : 'en-revision')}">
                            ${deliverable.status}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Files Header & Complementary Files Info Card -->
            <div class="card" style="padding: 16px; margin-bottom: 18px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                    <!-- Main File -->
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #e0f2fe; padding: 10px; border-radius: 8px; color: #0284c7; font-size: 1.5rem;">
                            ⭐
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong style="font-size: 0.95rem; color: var(--primary);">${deliverable.file_name}</strong>
                                <span style="font-size: 0.7rem; background: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 4px; font-weight: 800;">ARCHIVO PRINCIPAL</span>
                            </div>
                            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                                Tamaño: ${deliverable.file_size} • Subido al Servidor: ${deliverable.uploaded_at} • Versión: ${deliverable.version}
                            </div>
                        </div>
                    </div>

                    <!-- Direct Real Download Action -->
                    <div style="display: flex; gap: 10px;">
                        <a href="${downloadUrl}" download="${rawName}" class="btn btn-primary btn-sm">
                            ⬇ Descargar Archivo Real (${deliverable.file_size})
                        </a>
                        <a href="${viewUrl}" target="_blank" class="btn btn-secondary btn-sm">
                            🔍 Abrir en Pestaña Nueva
                        </a>
                    </div>
                </div>

                <!-- Complementary Files Section -->
                ${deliverable.complementary_files && deliverable.complementary_files.length > 0 ? `
                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 8px;">
                            📎 ARCHIVOS COMPLEMENTARIOS ADJUNTOS (${deliverable.complementary_files.length}):
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${deliverable.complementary_files.map(comp => {
                                const compSafe = comp.safe_name || (comp.name ? comp.name.replace(/\s+/g, '_') : 'anexo');
                                const compDown = comp.download_url || `/api/v1/storage/download/${compSafe}?name=${encodeURIComponent(comp.name)}`;
                                return `
                                <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem;">
                                    <span>📎</span>
                                    <div>
                                        <strong>${comp.name}</strong> <span style="color: #64748b;">(${comp.size})</span>
                                    </div>
                                    <a href="${compDown}" download="${comp.name}" style="color: var(--primary); margin-left: 6px; font-weight: 700; text-decoration: underline;">
                                        ⬇ Descargar
                                    </a>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                ${deliverable.notes ? `
                    <div style="margin-top: 12px; padding: 10px 14px; background: #f8fafc; border-radius: 6px; font-size: 0.8rem; color: #334155;">
                        <strong>Notas del Estudiante:</strong> "${deliverable.notes}"
                    </div>
                ` : ''}
            </div>

            <!-- Two-Pane Layout: Integrated Document Viewer on the Left, Observations on the Right -->
            <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; align-items: start;">
                
                <!-- LEFT PANE: INTEGRATED IN-PAGE DOCUMENT VIEWER -->
                <div class="card" style="padding: 0; overflow: hidden; background: #ffffff;">
                    <!-- Viewer Tab Controls -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 18px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm ${this.activeViewerTab === 'pdf' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-pdf">
                                👁️ Visor de Documento Integrado
                            </button>
                            <button class="btn btn-sm ${this.activeViewerTab === 'text' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-text">
                                📖 Resumen & Estructura C4
                            </button>
                        </div>
                        <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
                            Páginas y Formato Original
                        </span>
                    </div>

                    <!-- PDF / Media Integrated Embed View -->
                    <div id="viewer-pane-pdf" style="display: ${this.activeViewerTab === 'pdf' ? 'block' : 'none'}; height: 600px; position: relative; background: #525659;">
                        ${isPdf ? `
                            <iframe 
                                src="${viewUrl}?t=${Date.now()}#toolbar=1&navpanes=1&scrollbar=1" 
                                style="width: 100%; height: 100%; border: none;" 
                                title="Visor Integrado de Proyecto de Grado">
                            </iframe>
                        ` : isImage ? `
                            <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #0f172a; padding: 20px;">
                                <img src="${viewUrl}?t=${Date.now()}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" alt="${deliverable.file_name}">
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; background: #f8fafc; padding: 30px; text-align: center;">
                                <span style="font-size: 3rem; margin-bottom: 12px;">📄</span>
                                <h3 style="color: var(--primary); font-size: 1.15rem; margin-bottom: 6px;">Archivo en Formato Externo: ${rawName}</h3>
                                <p style="font-size: 0.85rem; color: #64748b; max-width: 460px; margin-bottom: 18px;">
                                    Este documento (${deliverable.file_size}) fue cargado físicamente por el postulante en el servidor universitario. Para examinarlo o editarlo con su aplicación correspondiente (Word, Excel o Enterprise Architect), descárgalo directamente a continuación.
                                </p>
                                <a href="${downloadUrl}" download="${rawName}" class="btn btn-primary">
                                    ⬇ Descargar Archivo Real (${deliverable.file_size})
                                </a>
                            </div>
                        `}
                    </div>

                    <!-- Structured Content View Tab -->
                    <div id="viewer-pane-text" style="display: ${this.activeViewerTab === 'text' ? 'block' : 'none'}; padding: 24px; font-family: 'Times New Roman', serif; font-size: 0.95rem; line-height: 1.6; color: #1e293b; max-height: 600px; overflow-y: auto;">
                        <div style="text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px;">
                            <h3 style="font-family: var(--font-sans); color: var(--primary); font-size: 1.15rem; margin: 0;">
                                ${deliverable.title}
                            </h3>
                            <span style="font-size: 0.8rem; color: #64748b;">Postulante: ${profile.student} • Versión: ${deliverable.version} • Modalidad: Proyecto de Grado</span>
                        </div>

                        <h4 style="font-family: var(--font-sans); color: var(--primary); font-size: 1.05rem; margin-bottom: 8px;">
                            1. Fundamentación Arquitectónica C4 y Diseño Clean Architecture
                        </h4>
                        <p style="margin-bottom: 14px;">
                            La arquitectura del sistema SIS-GradMatch se fundamenta en los principios de desacoplamiento del modelo C4. El contenedor backend REST FastAPI coordina la inferencia vectorial mediante representaciones densas de 768 dimensiones normalizadas, indexadas en PostgreSQL 16 con pgvector para búsquedas eficientes por similitud coseno.
                        </p>

                        <div style="border: 2px dashed #94a3b8; border-radius: var(--radius-md); padding: 18px; text-align: center; background: #f8fafc; margin: 16px 0;">
                            <span style="font-size: 1.6rem;">🗺️</span>
                            <div style="font-family: var(--font-sans); font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-top: 4px;">
                                [Diagrama C4 Nivel Contenedores e Infraestructura Cloud en Google Cloud Platform]
                            </div>
                            <div style="font-family: var(--font-sans); font-size: 0.75rem; color: #64748b;">
                                Cloud Run • Cloud SQL PostgreSQL 16 pgvector • Cloud Storage • Secret Manager
                            </div>
                        </div>

                        <h4 style="font-family: var(--font-sans); color: var(--primary); font-size: 1.05rem; margin-top: 18px; margin-bottom: 8px;">
                            2. Aseguramiento de Calidad con Pruebas de Caja Blanca McCabe
                        </h4>
                        <p>
                            Se formalizó la matriz de caminos independientes sobre los grafos de flujo de control para HU-01 (Matchmaking, V(G)=4), HU-02 (Habilitación CPD, V(G)=4) y HU-03 (Parseador de Perfil, V(G)=5), logrando el 100% de ejecución satisfactoria en la suite de PyTest.
                        </p>
                    </div>
                </div>

                <!-- RIGHT PANE: OBSERVATIONS AND PEDAGOGICAL NOTES -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💬 Observaciones Pedagógicas</h3>
                        <span class="status-pill observado" id="obs-count-badge">${deliverable.observations.length} Observaciones</span>
                    </div>

                    <div id="observations-list" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; max-height: 320px; overflow-y: auto;">
                        ${deliverable.observations.length === 0 ? `
                            <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 0.85rem;">
                                No hay observaciones registradas aún para este entregable. Puedes registrar una a continuación.
                            </div>
                        ` : deliverable.observations.map(o => `
                            <div style="border-left: 4px solid ${o.type === 'TECNICA' ? 'var(--accent-red)' : 'var(--accent-gold)'}; background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">
                                    <span style="color: ${o.type === 'TECNICA' ? 'var(--accent-red)' : '#b45309'};">${o.type} • Pág. ${o.page} (${o.section})</span>
                                    <span style="color: #64748b;">${o.date}</span>
                                </div>
                                <p style="font-size: 0.85rem; color: #1e293b; margin-top: 6px; line-height: 1.4;">"${o.comment}"</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- New Observation Form -->
                    <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 12px;">➕ Registrar Observación en este Entregable</h4>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label class="form-label">Tipo de Observación:</label>
                                <select class="form-select" id="obs-tipo">
                                    <option value="TECNICA">Técnica (Arquitectura, Código)</option>
                                    <option value="METODOLOGICA">Metodológica (Pruebas, Objetivos)</option>
                                    <option value="FORMATO">Formato / Estilo</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Página / Sección:</label>
                                <input type="text" class="form-input" id="obs-page" placeholder="Ej: Pág. 42 - Secc. 3.4">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Comentario Pedagógico del Asesor:</label>
                            <textarea class="form-textarea" id="obs-comment" rows="3" placeholder="Escriba las correcciones requeridas al postulante..."></textarea>
                        </div>

                        <button class="btn btn-primary btn-sm" id="btn-add-obs" style="width: 100%;">
                            💾 Guardar Observación en este Entregable
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Deliverable switcher
        document.getElementById('select-active-deliverable').addEventListener('change', (e) => {
            this.selectedDeliverableId = parseInt(e.target.value);
            this.renderReviewer(container);
        });

        // Tab switches
        document.getElementById('tab-btn-pdf').addEventListener('click', () => {
            this.activeViewerTab = 'pdf';
            document.getElementById('viewer-pane-pdf').style.display = 'block';
            document.getElementById('viewer-pane-text').style.display = 'none';
            document.getElementById('tab-btn-pdf').className = 'btn btn-sm btn-primary';
            document.getElementById('tab-btn-text').className = 'btn btn-sm btn-secondary';
        });

        document.getElementById('tab-btn-text').addEventListener('click', () => {
            this.activeViewerTab = 'text';
            document.getElementById('viewer-pane-pdf').style.display = 'none';
            document.getElementById('viewer-pane-text').style.display = 'block';
            document.getElementById('tab-btn-pdf').className = 'btn btn-sm btn-secondary';
            document.getElementById('tab-btn-text').className = 'btn btn-sm btn-primary';
        });

        // Add observation
        document.getElementById('btn-add-obs').addEventListener('click', () => {
            const tipo = document.getElementById('obs-tipo').value;
            const page = document.getElementById('obs-page').value || '1';
            const comment = document.getElementById('obs-comment').value;

            if (!comment) {
                alert('Por favor ingrese el comentario de la observación.');
                return;
            }

            Store.addObservation({
                profileId: profile.id,
                deliverableId: deliverable.id,
                type: tipo,
                page: page,
                section: 'Sección del Documento',
                comment: comment
            });

            alert(`✅ Observación registrada con éxito en "${deliverable.title}". Estado actualizado a OBSERVADO.`);
            this.renderReviewer(container);
        });
    },

    // 3. Official Dictum View (Visto Bueno Oficial F-FICCT-08)
    async renderDictamen(container) {
        const profile = Store.state.data.profiles.find(p => p.id === this.selectedProfileId) || Store.state.data.profiles[0];
        const deliverable = profile.chapters.find(c => c.id === this.selectedDeliverableId) || profile.chapters[0];

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Emisión de Dictamen Oficial de Visto Bueno (F-FICCT-08)</h1>
                    <p class="page-subtitle">Modalidad: Proyecto de Grado • Postulante: <strong>${profile.student}</strong> (Reg. ${profile.registro}) • Proyecto: ${profile.title}</p>
                </div>
            </div>

            <div class="card" style="max-width: 800px;">
                <div class="card-header">
                    <h2 class="card-title">📜 Formulario Oficial de Visto Bueno Académico</h2>
                    <span class="status-pill aprobado">Visto Bueno para Tribunal</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Entregable Sujeto a Dictamen:</label>
                    <input type="text" class="form-input" value="${deliverable.title} (${deliverable.version})" readonly style="background: #f8fafc; font-weight: 700;">
                </div>

                <div class="form-group">
                    <label class="form-label">Resultado del Dictamen Académico del Asesor:</label>
                    <div style="display: flex; gap: 24px; margin-top: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--success); cursor: pointer;">
                            <input type="radio" name="dictamen_result" value="APROBADO" checked>
                            ✅ APROBADO (Visto Bueno Otorgado para Trámite de Tribunal)
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent-red); cursor: pointer;">
                            <input type="radio" name="dictamen_result" value="OBSERVADO">
                            ⚠️ OBSERVADO (Requiere Subsanar Correcciones)
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Consideraciones y Conclusiones del Asesor:</label>
                    <textarea class="form-textarea" id="dictamen-notes" rows="4">Habiendo examinado rigurosamente el documento presentado en el visor integrado del sistema, se certifica que el postulante ha cumplido a cabalidad con los requerimientos metodológicos, arquitectónicos y de calidad de software exigidos para "${deliverable.title}". Se otorga el Visto Bueno oficial para avanzar hacia la conformación del Tribunal Evaluador de Grado.</textarea>
                </div>

                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin: 20px 0;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); margin-bottom: 4px;">FIRMA DIGITAL REGISTRADA DEL DOCENTE ASESOR</div>
                    <div style="font-size: 0.85rem; color: #475569;">
                        Docente Asesor: <strong>${Store.state.currentUser.name}</strong><br>
                        Carrera: <strong>Ingeniería en Sistemas - FICCT UAGRM</strong><br>
                        Código Docente: <code>DOC-FICCT-4821</code> | Sello Criptográfico: <code>SHA256-4b8a1c93f02e</code>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" onclick="Store.setView('tutor-reviewer')">Cancelar</button>
                    <button class="btn btn-success" id="btn-save-dictum">
                        📜 Guardar Dictamen y Notificar a Dirección
                    </button>
                </div>
            </div>
        `;

        document.getElementById('btn-save-dictum').addEventListener('click', () => {
            const radios = document.getElementsByName('dictamen_result');
            let selectedResult = 'APROBADO';
            for (const r of radios) {
                if (r.checked) selectedResult = r.value;
            }
            const notes = document.getElementById('dictamen-notes').value;

            Store.emitDictamen({
                profileId: profile.id,
                chapterIdOrNumber: deliverable.id,
                dictumResult: selectedResult,
                conclusions: notes
            });

            alert(`✅ Dictamen oficial F-FICCT-08 registrado con éxito. "${deliverable.title}" ha sido calificado como ${selectedResult} y registrado en el expediente del postulante.`);
            Store.setView('tutor-inbox');
        });
    }
};

window.TutorView = TutorView;

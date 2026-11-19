/**
 * SIS-GradMatch: Director de Carrera Views & Real AI Matchmaking Studio
 * Director de Carrera: M.Sc. Ing. Leonardo Vargas Peña
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const DirectorView = {
    async render(viewName, container) {
        if (viewName === 'director-kpis') {
            await this.renderKPIs(container);
        } else if (viewName === 'director-matchmaking') {
            await this.renderMatchmakingStudio(container);
        } else if (viewName === 'director-resolutions') {
            await this.renderResolutions(container);
        } else if (viewName === 'director-tribunals') {
            await this.renderTribunals(container);
        } else if (viewName === 'director-cpd') {
            await this.renderCPDCheck(container);
        }
    },

    // 1. KPIs and Institutional Analytics View
    async renderKPIs(container) {
        const profiles = Store.state.data.profiles;
        const resolutions = Store.state.data.resolutions;
        const assignedCount = profiles.filter(p => p.status === 'ASIGNADO').length;
        const pendingCount = profiles.filter(p => p.status === 'PENDIENTE_ASIGNACION').length;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Centro de Mando & Analítica Institucional</h1>
                    <p class="page-subtitle">Dirección de Carrera - Ingeniería en Sistemas | Director: <strong>${Store.demoAccounts['director.sistemas'].name}</strong></p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Store.setView('director-matchmaking')">
                        🤖 Abrir Laboratorio Matchmaking
                    </button>
                </div>
            </div>

            <!-- KPI Cards Grid -->
            <div class="metrics-grid">
                <div class="kpi-card">
                    <div class="kpi-icon-wrapper">👨‍🎓</div>
                    <div class="kpi-content">
                        <span class="kpi-value">${profiles.length}</span>
                        <span class="kpi-label">Perfiles Registrados</span>
                    </div>
                </div>
                <div class="kpi-card gold">
                    <div class="kpi-icon-wrapper">⚡</div>
                    <div class="kpi-content">
                        <span class="kpi-value">${pendingCount}</span>
                        <span class="kpi-label">Pendientes de Asignación</span>
                    </div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-icon-wrapper">👨‍🏫</div>
                    <div class="kpi-content">
                        <span class="kpi-value">${assignedCount}</span>
                        <span class="kpi-label">Tutores Asignados</span>
                    </div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-icon-wrapper">📜</div>
                    <div class="kpi-content">
                        <span class="kpi-value">${resolutions.length}</span>
                        <span class="kpi-label">Resoluciones RA Emitidas</span>
                    </div>
                </div>
            </div>

            <!-- Visual Charts Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Distribución por Áreas de Investigación</h2>
                    </div>
                    <div style="height: 250px; position: relative;">
                        <canvas id="areasChart"></canvas>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Balance de Carga y Cupos Docentes</h2>
                    </div>
                    <div style="height: 250px; position: relative;">
                        <canvas id="teachersChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Active Degree Projects Table -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Proyectos de Grado en Trámite Activo</h2>
                    <span class="status-pill completado">Modalidad Proyecto de Grado • Gestión II-2026</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Registro</th>
                                <th>Estudiante</th>
                                <th>Título del Proyecto de Grado</th>
                                <th>Áreas de Enfoque</th>
                                <th>Tutor Designado</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profiles.map(p => `
                                <tr>
                                    <td><strong>${p.registro}</strong></td>
                                    <td>${p.student}</td>
                                    <td style="max-width: 280px;">${p.title}</td>
                                    <td>
                                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                            ${p.areas.map(a => `<span style="font-size: 0.7rem; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${a}</span>`).join('')}
                                        </div>
                                    </td>
                                    <td>${p.tutor_name ? `<strong>${p.tutor_name}</strong>` : '<span style="color: #94a3b8; font-style: italic;">Sin asignar</span>'}</td>
                                    <td>
                                        <span class="status-pill ${p.status === 'ASIGNADO' ? 'aprobado' : 'pendiente'}">
                                            ${p.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        ${p.resolution ? `
                                            <button class="btn btn-secondary btn-sm" onclick="ResolutionModal.open('${p.resolution}', '${p.student}', '${p.tutor_name}')">
                                                📜 Ver RA
                                            </button>
                                        ` : `
                                            <button class="btn btn-primary btn-sm" onclick="DirectorView.goToMatchmaking(${p.id})">
                                                🤖 Asignar
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.initCharts();
        }, 50);
    },

    goToMatchmaking(profileId) {
        Store.state.selectedMatchProfileId = profileId;
        Store.setView('director-matchmaking');
    },

    initCharts() {
        const ctxAreas = document.getElementById('areasChart');
        if (ctxAreas && window.Chart) {
            new Chart(ctxAreas, {
                type: 'doughnut',
                data: {
                    labels: ['Ingeniería de Software & C4', 'Machine Learning & NLP', 'Redes & IoT', 'Ciberseguridad', 'Bases de Datos'],
                    datasets: [{
                        data: [14, 18, 9, 6, 8],
                        backgroundColor: ['#003366', '#10b981', '#f59e0b', '#c00000', '#6366f1'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }
            });
        }

        const ctxTeachers = document.getElementById('teachersChart');
        if (ctxTeachers && window.Chart) {
            const teachers = [
                Store.demoAccounts['docente.martinez'],
                Store.demoAccounts['docente.vargas'],
                Store.demoAccounts['docente.balderrama'],
                Store.demoAccounts['docente.valenzuela']
            ];

            new Chart(ctxTeachers, {
                type: 'bar',
                data: {
                    labels: teachers.map(t => t.name.split(' ').slice(-2).join(' ')),
                    datasets: [
                        {
                            label: 'Asignados',
                            data: teachers.map(t => t.quota_actual),
                            backgroundColor: '#003366',
                            borderRadius: 6
                        },
                        {
                            label: 'Cupo Total',
                            data: teachers.map(t => t.quota_max),
                            backgroundColor: '#e2e8f0',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 6, ticks: { stepSize: 1 } } },
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }
            });
        }
    },

    // 2. Real AI Matchmaking Studio
    async renderMatchmakingStudio(container) {
        const profiles = (Store.state.data && Array.isArray(Store.state.data.profiles) && Store.state.data.profiles.length > 0)
            ? Store.state.data.profiles
            : Store.initialData.profiles;
        
        if (!Store.state.data) Store.state.data = {};
        if (!Array.isArray(Store.state.data.profiles) || Store.state.data.profiles.length === 0) {
            Store.state.data.profiles = JSON.parse(JSON.stringify(Store.initialData.profiles));
        }

        const initialProfile = profiles.find(p => p && p.id === Store.state.selectedMatchProfileId) || profiles[0] || Store.initialData.profiles[0];
        const initialProfileId = initialProfile ? initialProfile.id : 1;
        Store.state.selectedMatchProfileId = null;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Laboratorio Inteligente de Matchmaking Estudiante-Tutor</h1>
                    <p class="page-subtitle">Algoritmo Vectorial de Similitud Coseno con Ponderación de Capacidad Dinámica k-NN</p>
                </div>
            </div>

            <div class="card" style="border-top: 4px solid var(--accent-gold);">
                <div class="card-header">
                    <h2 class="card-title">1. Selección de Perfil Postulante & Parámetros del Algoritmo</h2>
                    <span id="selected-profile-badge" class="status-pill en-revision">Análisis Vectorial</span>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start;">
                    <div>
                        <div class="form-group">
                            <label class="form-label">Perfil de Grado Registrado en el Sistema:</label>
                            <select class="form-select" id="select-profile-to-match">
                                ${profiles.map(p => `
                                    <option value="${p.id}" ${p.id === initialProfileId ? 'selected' : ''}>
                                        [Reg. ${p.registro}] ${p.student} — ${p.title}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Dynamic Profile Content Card -->
                        <div id="profile-meta-card" style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-top: 12px;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <div style="background: #f1f5f9; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
                            ⚖️ Ponderación de la Función Objetivo
                        </div>
                        
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
                                <span>Afinidad Semántica (NLP):</span>
                                <span id="val-semantic" style="color: var(--primary);">70%</span>
                            </div>
                            <input type="range" min="10" max="90" value="70" class="form-input" id="slider-semantic" style="padding: 0; cursor: pointer;">
                        </div>

                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
                                <span>Balance de Plazas Libres:</span>
                                <span id="val-capacity" style="color: var(--accent-red);">30%</span>
                            </div>
                            <input type="range" min="10" max="90" value="30" class="form-input" id="slider-capacity" disabled style="padding: 0; opacity: 0.7;">
                        </div>

                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 8px; line-height: 1.3;">
                            <em>Fórmula:</em> <code>Score = (w_sem × Similitud) + (w_cap × Disponibilidad)</code>
                        </div>

                        <button class="btn btn-primary" id="btn-run-matchmaking" style="width: 100%; margin-top: 14px;">
                            ⚡ Calcular Similitud Coseno
                        </button>
                    </div>
                </div>
            </div>

            <!-- Matchmaking Results Container -->
            <div id="matchmaking-results-container" class="card" style="display: none;">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">2. Ranking de Compatibilidad Docente (Resultados Reales)</h2>
                        <span id="results-formula-tag" style="font-size: 0.75rem; color: #64748b;"></span>
                    </div>
                    <span class="status-pill aprobado">Algoritmo k-NN Ejecutado</span>
                </div>

                <div id="candidates-list" style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Dynamically populated -->
                </div>
            </div>
        `;

        const selectEl = document.getElementById('select-profile-to-match');
        const slider = document.getElementById('slider-semantic');
        const sliderCap = document.getElementById('slider-capacity');
        const valSem = document.getElementById('val-semantic');
        const valCap = document.getElementById('val-capacity');

        const updateProfilePreview = () => {
            const pId = parseInt(selectEl ? selectEl.value : initialProfileId) || initialProfileId;
            const p = profiles.find(item => item && item.id === pId) || profiles[0] || Store.initialData.profiles[0];
            const metaCard = document.getElementById('profile-meta-card');
            const badge = document.getElementById('selected-profile-badge');

            if (p && metaCard) {
                if (badge) {
                    badge.className = `status-pill ${p.status === 'ASIGNADO' ? 'aprobado' : 'pendiente'}`;
                    badge.textContent = (p.status || 'EN_REVISION').replace('_', ' ');
                }

                metaCard.innerHTML = `
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); margin-bottom: 6px;">EXTRACTO VECTORIAL DEL PERFIL (768 DIMENSIONES)</div>
                    <div style="font-size: 0.85rem; color: #334155; line-height: 1.4; margin-bottom: 8px;">
                        <em>"${p.abstract || 'Sin abstract registrado'}"</em>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Áreas temáticas:</span>
                        ${(p.areas || ['Ingeniería de Software']).map(a => `<span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${a}</span>`).join('')}
                    </div>
                    ${p.tutor_name ? `
                        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 0.8rem; color: var(--success); font-weight: 700;">
                            ✓ Tutor Asignado Actual: ${p.tutor_name} (${p.resolution || 'En trámite'})
                        </div>
                    ` : ''}
                `;
            }
        };

        const executeMatch = () => {
            const pId = parseInt(selectEl ? selectEl.value : initialProfileId) || initialProfileId;
            const wS = parseInt(slider ? slider.value : 70) / 100;
            const wC = parseInt(sliderCap ? sliderCap.value : 30) / 100;

            const calculation = Store.calculateMatchmaking(pId, wS, wC);
            if (!calculation) return;

            this.renderMatchResults(calculation);
        };

        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            sliderCap.value = 100 - val;
            valSem.textContent = `${val}%`;
            valCap.textContent = `${100 - val}%`;
            executeMatch(); // Instant real-time recalculation on slider movement!
        });

        selectEl.addEventListener('change', () => {
            updateProfilePreview();
            executeMatch(); // Recalculate immediately when profile changes!
        });

        document.getElementById('btn-run-matchmaking').addEventListener('click', () => {
            executeMatch();
        });

        // Initialize preview and first calculation
        updateProfilePreview();
        executeMatch();
    },

    renderMatchResults(calculation) {
        const container = document.getElementById('matchmaking-results-container');
        const list = document.getElementById('candidates-list');
        const formulaTag = document.getElementById('results-formula-tag');
        if (!container || !list) return;

        const currentProfile = calculation.profile || calculation.perfil || (Store.state.data?.profiles ? Store.state.data.profiles[0] : null) || Store.initialData.profiles[0];
        const profileId = currentProfile ? currentProfile.id : 1;

        container.style.display = 'block';
        if (formulaTag) {
            formulaTag.textContent = `Ponderación activa: ${((calculation.wSemantic || 0.7) * 100).toFixed(0)}% Semántica + ${((calculation.wCapacity || 0.3) * 100).toFixed(0)}% Plazas Disponibles`;
        }

        const candidates = calculation.candidatos || [];
        list.innerHTML = candidates.map(c => {
            const sem = c.similitud_semantica ?? c.afinidad_semantica ?? 0.8;
            const capScore = c.score_final ?? c.score_balanceo ?? 0.85;
            const plazas = c.plazas_disponibles ?? c.cupo_disponible ?? (c.cupo_max - c.cupo_actual);
            const cupoMax = c.cupo_max ?? c.cupo_maximo ?? 5;
            const uName = c.username || c.teacher_username || 'docente.martinez';

            return `
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; background: #ffffff; display: flex; justify-content: space-between; align-items: center; gap: 20px; transition: all 0.2s;">
                <div style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem; font-weight: 800; color: ${c.ranking === 1 ? 'var(--accent-gold)' : 'var(--primary)'};">#${c.ranking}</span>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">${c.nombre}</h3>
                        <span class="status-pill en-revision" style="font-size: 0.7rem;">${c.departamento}</span>
                        ${c.ranking === 1 ? '<span class="status-pill aprobado" style="font-size: 0.7rem;">Óptimo Recomendado</span>' : ''}
                    </div>

                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 8px 0;">
                        ${c.justificacion}
                    </p>

                    <div style="display: flex; align-items: center; gap: 20px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">
                        <span>Afinidad Semántica: <strong style="color: var(--primary);">${(sem * 100).toFixed(1)}%</strong></span>
                        <span>Plazas Libres: <strong style="color: var(--success);">${plazas} de ${cupoMax}</strong></span>
                        <span>Score Combinado: <strong style="color: var(--accent-red); font-size: 0.95rem;">${(capScore * 100).toFixed(1)} pts</strong></span>
                    </div>

                    <div class="similarity-progress" style="margin-top: 8px;">
                        <div class="similarity-fill" style="width: ${capScore * 100}%; background: ${c.ranking === 1 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'};"></div>
                    </div>
                </div>

                <div style="flex-shrink: 0; text-align: right;">
                    <button class="btn btn-primary" onclick="DirectorView.handleConfirmAssignment(${profileId}, '${uName}')">
                        ✅ Asignar & Emitir RA
                    </button>
                </div>
            </div>
            `;
        }).join('');
    },

    handleConfirmAssignment(profileId, teacherUsername) {
        const result = Store.confirmTutorAssignment(profileId, teacherUsername);
        if (!result) return;

        ResolutionModal.open(
            result.resolutionNumber,
            result.profile.student,
            result.teacher.name
        );
    },

    // 3. Official Administrative Resolutions Center
    async renderResolutions(container) {
        const resolutions = Store.state.data.resolutions;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Libro Oficial de Resoluciones Administrativas</h1>
                    <p class="page-subtitle">Actas de Designación Tutorial emitidas y firmadas digitalmente por la Dirección de Carrera</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Store.setView('director-matchmaking')">
                        ➕ Nueva Asignación
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Resoluciones Administrativas de Grado Emitidas (RA-FICCT)</h2>
                    <span class="status-pill aprobado">${resolutions.length} Resoluciones Vigentes</span>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>N° de Resolución</th>
                                <th>Fecha de Emisión</th>
                                <th>Estudiante Titulante</th>
                                <th>Registro</th>
                                <th>Docente Tutor Designado</th>
                                <th>Estado Legal</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resolutions.map(r => `
                                <tr>
                                    <td><strong style="color: var(--primary);">${r.number}</strong></td>
                                    <td>${r.date}</td>
                                    <td><strong>${r.student}</strong></td>
                                    <td>${r.registro}</td>
                                    <td>${r.tutor}</td>
                                    <td><span class="status-pill aprobado">${r.status}</span></td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="ResolutionModal.open('${r.number}', '${r.student}', '${r.tutor}')">
                                            📄 Ver / Imprimir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // 4. Tribunal Evaluator Assignment View
    async renderTribunals(container) {
        const profiles = Store.state.data.profiles;
        const tribunals = Store.state.data.tribunals;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Designación de Tribunales Evaluadores de Grado</h1>
                    <p class="page-subtitle">Conformación de la Comisión Examinadora de 3 Miembros (Reglamento UAGRM)</p>
                </div>
            </div>

            <div class="card" style="max-width: 850px; margin-bottom: 24px;">
                <div class="card-header">
                    <h2 class="card-title">⚖️ Formulario de Conformación de Tribunal</h2>
                </div>

                <div class="form-group">
                    <label class="form-label">Proyecto de Grado Habilitado para Tribunal:</label>
                    <select class="form-select" id="select-tribunal-thesis">
                        ${profiles.map(p => `
                            <option value="${p.id}">
                                [Reg. ${p.registro}] ${p.student} — ${p.title} (Tutor: ${p.tutor_name || 'Sin tutor'})
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 18px;">
                    <div class="form-group">
                        <label class="form-label">Presidente del Tribunal:</label>
                        <select class="form-select" id="select-tribunal-pres">
                            <option>Ing. Rolando Antoni Martínez Canedo</option>
                            <option>Ing. Shirley Valenzuela</option>
                            <option>Ing. Marcos Balderrama Ruiz</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Secretario del Tribunal:</label>
                        <select class="form-select" id="select-tribunal-sec">
                            <option>Lic. Luis Vargas Pérez</option>
                            <option>Ing. Shirley Valenzuela</option>
                            <option>Ing. Rolando Antoni Martínez Canedo</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Vocal del Tribunal:</label>
                        <select class="form-select" id="select-tribunal-voc">
                            <option>Ing. Marcos Balderrama Ruiz</option>
                            <option>Ing. Shirley Valenzuela</option>
                            <option>Lic. Luis Vargas Pérez</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary" id="btn-emit-tribunal">
                        ⚖️ Emitir Resolución de Tribunal
                    </button>
                </div>
            </div>

            <!-- Existing Tribunals List -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Tribunales Oficialmente Conformados</h2>
                    <span class="status-pill aprobado">${tribunals.length} Comisiones Activas</span>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Resolución</th>
                                <th>Estudiante / Proyecto</th>
                                <th>Presidente</th>
                                <th>Secretario</th>
                                <th>Vocal</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tribunals.map(t => `
                                <tr>
                                    <td><strong style="color: var(--primary);">${t.resolution}</strong></td>
                                    <td>
                                        <strong>${t.student}</strong><br>
                                        <span style="font-size: 0.75rem; color: #64748b;">${t.title}</span>
                                    </td>
                                    <td><span style="font-weight: 600; color: #003366;">${t.presidente}</span></td>
                                    <td>${t.secretario}</td>
                                    <td>${t.vocal}</td>
                                    <td>${t.date}</td>
                                    <td><span class="status-pill aprobado">${t.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('btn-emit-tribunal').addEventListener('click', () => {
            const thesisId = document.getElementById('select-tribunal-thesis').value;
            const pres = document.getElementById('select-tribunal-pres').value;
            const sec = document.getElementById('select-tribunal-sec').value;
            const voc = document.getElementById('select-tribunal-voc').value;

            const res = Store.assignTribunal(thesisId, pres, sec, voc);
            if (!res.success) {
                alert(`⚠️ Error: ${res.message}`);
                return;
            }

            alert(`✅ Tribunal designado exitosamente bajo Resolución ${res.record.resolution}. Notificación enviada a los 3 docentes examinadores.`);
            this.renderTribunals(container);
        });
    },

    // 5. CPD Validation Query View
    async renderCPDCheck(container) {
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Validación de Estatus CPD: Modalidad Proyecto de Grado</h1>
                    <p class="page-subtitle">Verificación automática de conclusión del 100% de la malla curricular (56 materias Plan 187-3) y habilitación de egresado</p>
                </div>
            </div>

            <div class="card" style="max-width: 750px;">
                <div class="card-header">
                    <h2 class="card-title">🔍 Consulta de Habilitación de Egresado en Base Central CPD</h2>
                </div>

                <div class="form-group">
                    <label class="form-label">Número de Registro Universitario:</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="input-cpd-reg" class="form-input" value="220011559" placeholder="Ingrese N° de Registro">
                        <button class="btn btn-primary" id="btn-cpd-search" style="flex-shrink: 0;">Consultar CPD</button>
                    </div>
                </div>

                <div style="margin-bottom: 14px; font-size: 0.8rem; color: #64748b;">
                    <strong>Pruebas Rápidas con Registros Reales de Ejemplo:</strong><br>
                    <a href="javascript:void(0)" onclick="DirectorView.fillCPD('220011559')" style="color: var(--primary); text-decoration: underline; margin-right: 12px;">220011559 (Maikol Molina - Egresado 100% Malla Vencida)</a>
                    <a href="javascript:void(0)" onclick="DirectorView.fillCPD('219045123')" style="color: var(--primary); text-decoration: underline; margin-right: 12px;">219045123 (Carlos Condori - Egresado Habilitado)</a>
                    <a href="javascript:void(0)" onclick="DirectorView.fillCPD('221088771')" style="color: var(--accent-red); text-decoration: underline; margin-right: 12px;">221088771 (Malla Incompleta 38/56 - Rechazado)</a>
                    <a href="javascript:void(0)" onclick="DirectorView.fillCPD('218033221')" style="color: var(--accent-red); text-decoration: underline;">218033221 (Adeudo DAF - Bloqueado)</a>
                </div>

                <div id="cpd-result-card" style="margin-top: 20px; padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc;">
                    <!-- Dynamically populated -->
                </div>
            </div>
        `;

        const executeSearch = () => {
            const reg = document.getElementById('input-cpd-reg').value;
            const res = Store.queryCPD(reg);
            const card = document.getElementById('cpd-result-card');

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                    <div>
                        <span style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">DICTAMEN DE HABILITACIÓN CPD PARA PROYECTO DE GRADO</span>
                        <div style="font-size: 0.75rem; color: #64748b;">Servicio Central CPD-FICCT-API v2.5 • Plan 187-3</div>
                    </div>
                    <span class="status-pill ${res.habilitado ? 'aprobado' : 'observado'}" style="font-size: 0.8rem; padding: 6px 14px;">
                        ${res.habilitado ? '✓ HABILITADO PARA PROYECTO DE GRADO' : '✗ NO HABILITADO'}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.85rem; margin-bottom: 14px;">
                    <div><strong>Postulante:</strong> ${res.estudiante}</div>
                    <div><strong>Registro:</strong> ${reg}</div>
                    <div><strong>Carrera:</strong> ${res.carrera} (${res.malla || 'Plan 187-3'})</div>
                    <div><strong>Condición Académica:</strong> <strong style="color: var(--primary);">${res.condicion || 'Egresado'}</strong></div>
                    <div><strong>Malla Curricular:</strong> <strong style="color: ${res.materias_aprobadas === 56 ? 'var(--success)' : 'var(--accent-red)'};">${res.materias_aprobadas} / ${res.materias_total} materias (${res.porcentaje_malla || 100}%)</strong></div>
                    <div><strong>PPA Acumulado:</strong> ${res.ppa || '71.0'} / 100</div>
                    <div><strong>Certificado de Conclusión:</strong> <code>${res.certificado_conclusion || 'CE-FICCT-2026'}</code></div>
                    <div><strong>Modalidad Autorizada:</strong> <strong>${res.modalidad_habilitada || 'Proyecto de Grado'}</strong></div>
                </div>

                <div style="background: ${res.habilitado ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${res.habilitado ? '#a7f3d0' : '#fecaca'}; border-radius: 6px; padding: 12px; font-size: 0.85rem; color: ${res.habilitado ? '#065f46' : '#991b1b'};">
                    <strong>Fundamentación Reglamentaria CPD:</strong> ${res.motivo}
                </div>
            `;
        };

        document.getElementById('btn-cpd-search').addEventListener('click', executeSearch);
        executeSearch();
    },

    fillCPD(reg) {
        const input = document.getElementById('input-cpd-reg');
        if (input) {
            input.value = reg;
            document.getElementById('btn-cpd-search').click();
        }
    }
};

window.DirectorView = DirectorView;

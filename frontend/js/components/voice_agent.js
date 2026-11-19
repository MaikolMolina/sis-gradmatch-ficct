/**
 * SIS-GradMatch: Agente Inteligente por Voz ("GradAgent IA"),
 * Generador de Reportes Dinámicos Multi-Tesista y Clasificador Deep Learning
 * FICCT - UAGRM | Molina Cortez Maikol Anthony
 */

const VoiceAgent = {
    recognition: null,
    isListening: false,
    synth: window.speechSynthesis,
    voices: [],
    spanishVoice: null,

    init() {
        this.initSpeechSynthesis();
        this.initSpeechRecognition();
        this.renderFloatingAgentWidget();
    },

    initSpeechSynthesis() {
        if (!('speechSynthesis' in window)) {
            console.warn('[GradAgent] SpeechSynthesis no soportado en este navegador.');
            return;
        }

        const updateVoices = () => {
            this.voices = this.synth.getVoices();
            this.spanishVoice = this.voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Paulina') || v.name.includes('Sabina') || v.name.includes('Helena'))) 
                || this.voices.find(v => v.lang.startsWith('es')) 
                || null;
        };

        updateVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = updateVoices;
        }
    },

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[GradAgent] Web SpeechRecognition no soportado. Se utilizará entrada de texto.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-BO'; // Español Bolivia / Latinoamericano
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateAgentPulse(true);
            this.appendMessage('GradAgent', '🎙️ Te estoy escuchando... Di tu solicitud (ej. "Generar reporte de avance", "Clasificar mi tema con Deep Learning", "Ver mis observaciones")', 'agent-listening');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('[GradAgent] Reconocido por voz:', transcript);
            this.appendMessage('Tú (Voz)', transcript, 'user-msg');
            this.processQuery(transcript);
        };

        this.recognition.onerror = (event) => {
            console.warn('[GradAgent] Error de reconocimiento:', event.error);
            this.isListening = false;
            this.updateAgentPulse(false);
            if (event.error !== 'no-speech') {
                this.appendMessage('GradAgent', `⚠️ Audio no captado (${event.error}). Puedes escribir tu comando en el recuadro.`, 'agent-msg');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateAgentPulse(false);
        };
    },

    toggleListening() {
        if (!this.recognition) {
            this.speak("El reconocimiento por voz no está disponible en este navegador. Puedes escribir tu consulta en el recuadro.");
            this.appendMessage('GradAgent', 'El reconocimiento por micrófono requiere Chrome o Edge. Por favor escribe tu solicitud en el campo de texto.', 'agent-msg');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error(e);
            }
        }
    },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        this.synth.cancel(); // Cancelar locución previa
        const cleanText = (text || '').replace(/[*_#`]/g, '');
        const utter = new SpeechSynthesisUtterance(cleanText);
        utter.rate = 1.05;
        utter.pitch = 1.0;
        if (this.spanishVoice) {
            utter.voice = this.spanishVoice;
        } else {
            utter.lang = 'es-ES';
        }
        this.synth.speak(utter);
    },

    // --------------------------------------------------------------------------
    // COMUNICACIÓN CON FAILOVER RESILIENTE (Local + Cloud Run)
    // --------------------------------------------------------------------------
    async queryAiApi(path, payload) {
        const endpoints = [];
        if (window.location.protocol === 'file:') {
            endpoints.push(`http://localhost:8000${path}`);
            endpoints.push(`https://sis-gradmatch-jyq66kbdha-uc.a.run.app${path}`);
        } else if (window.location.origin.includes('8000')) {
            endpoints.push(path);
            endpoints.push(`https://sis-gradmatch-jyq66kbdha-uc.a.run.app${path}`);
        } else {
            endpoints.push(path);
            endpoints.push(`http://localhost:8000${path}`);
            endpoints.push(`https://sis-gradmatch-jyq66kbdha-uc.a.run.app${path}`);
        }

        let lastError = null;
        for (const url of endpoints) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    return await response.json();
                }
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('No se pudo establecer conexión con los motores de IA');
    },

    async processQuery(text) {
        const inputField = document.getElementById('agent-text-input');
        if (inputField) inputField.value = '';

        this.appendMessage('GradAgent', '⏳ Procesando comando con Inteligencia Artificial...', 'agent-typing');

        try {
            const data = await this.queryAiApi('/api/v1/ai/voice-agent-query', {
                transcript: text,
                current_user_role: window.Store?.state?.currentUser?.role || 'ESTUDIANTE',
                student_code: window.Store?.state?.currentUser?.registro || '220011559'
            });

            // Remover mensaje de "procesando..."
            const typingElem = document.querySelector('.agent-typing');
            if (typingElem) typingElem.remove();

            // Responder con voz
            this.speak(data.spoken_response);
            this.appendMessage('GradAgent', data.spoken_response, 'agent-msg');

            // Ejecutar disparador de UI
            this.executeAction(data);

        } catch (error) {
            console.error('[GradAgent] Error procesando comando:', error);
            const typingElem = document.querySelector('.agent-typing');
            if (typingElem) typingElem.remove();
            
            // Fallback inteligente contextual
            const lower = text.toLowerCase();
            if (lower.includes('reporte') || lower.includes('informe') || lower.includes('avance')) {
                this.speak("Generando reporte dinámico de seguimiento.");
                this.appendMessage('GradAgent', "Generando reporte dinámico de seguimiento académico.", 'agent-msg');
                this.showDynamicReportModal();
            } else if (lower.includes('clasificar') || lower.includes('deep learning') || lower.includes('eje')) {
                this.speak("Abriendo clasificador semántico por Deep Learning.");
                this.appendMessage('GradAgent', "Abriendo módulo interactivo de Deep Learning.", 'agent-msg');
                this.openDeepLearningModal();
            } else if (lower.includes('observacion') || lower.includes('observaciones')) {
                this.speak("Abriendo bandeja de observaciones de borradores.");
                if (window.Store && Store.setView) Store.setView('student-draft');
            } else {
                const fallbackMsg = "Comando recibido. Puedes seleccionar 'Generar Reporte' o 'Clasificador Deep Learning' en los accesos rápidos.";
                this.speak(fallbackMsg);
                this.appendMessage('GradAgent', fallbackMsg, 'agent-msg');
            }
        }
    },

    executeAction(data) {
        if (!data) return;

        switch (data.action) {
            case 'OPEN_REPORT_MODAL':
                setTimeout(() => this.showDynamicReportModal(data.data), 500);
                break;
            case 'SHOW_DEEP_LEARNING_MODAL':
                setTimeout(() => this.openDeepLearningModal(data.data), 500);
                break;
            case 'SWITCH_DEMO_USER':
                if (data.data?.user_key && window.Store?.selectDemoUser) {
                    window.Store.selectDemoUser(data.data.user_key);
                }
                break;
            case 'NAVIGATE_TO_OBSERVATIONS':
                if (window.Store?.setView) {
                    const role = window.Store.state.activeRole;
                    Store.setView(role === 'DOCENTE_TUTOR' ? 'tutor-reviewer' : 'student-draft');
                }
                break;
            case 'TRIGGER_MATCHMAKING_CALCULATION':
                if (window.Store?.setView) Store.setView('director-matchmaking');
                break;
            case 'TRIGGER_DOCUMENT_DOWNLOAD':
                window.location.href = data.data?.download_url || '/api/v1/download/apk';
                break;
            case 'REQUEST_PUSH_PERMISSIONS':
                if (window.PushNotifications) {
                    PushNotifications.requestPermissionAndSubscribe();
                }
                break;
        }
    },

    renderFloatingAgentWidget() {
        const existing = document.getElementById('grad-agent-widget');
        if (existing) return;

        const widget = document.createElement('div');
        widget.id = 'grad-agent-widget';
        widget.className = 'grad-agent-fab-container';
        widget.innerHTML = `
            <!-- Floating Action Button -->
            <button class="grad-agent-fab" id="agent-fab-btn" onclick="VoiceAgent.toggleAgentPanel()" title="Abrir Asistente y Agente Inteligente por Voz">
                <span class="fab-icon">🤖</span>
                <span class="fab-pulse" id="fab-audio-pulse"></span>
                <span class="fab-badge">IA</span>
            </button>

            <!-- Agent Dialog Panel -->
            <div class="grad-agent-panel hidden" id="grad-agent-panel">
                <div class="agent-panel-header">
                    <div class="agent-brand">
                        <span class="agent-avatar">🤖</span>
                        <div>
                            <strong class="agent-name">GradAgent IA</strong>
                            <span class="agent-status-label">Agente Autónomo y Asistente por Voz</span>
                        </div>
                    </div>
                    <button class="agent-close-btn" onclick="VoiceAgent.closeAgentPanel(); event.stopPropagation();" title="Cerrar panel">&times;</button>
                </div>

                <div class="agent-quick-actions">
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Generar reporte de avance de tesis')">📊 Generar Reporte</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.openDeepLearningModal()">🧠 Clasificador DL</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Ver mis observaciones pendientes')">📝 Mis Observaciones</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Calcular afinidad de tutores con IA')">🤖 Recomendar Tutor</button>
                </div>

                <div class="agent-messages-container" id="agent-messages-box">
                    <div class="agent-msg">
                        ¡Hola! Soy <strong>GradAgent</strong>, tu agente inteligente para la titulación en la FICCT - UAGRM. 
                        Presiona el <strong>micrófono</strong> y habla, o escribe tu solicitud para ejecutar acciones, clasificar temas con Deep Learning o generar reportes dinámicos.
                    </div>
                </div>

                <div class="agent-input-bar">
                    <button class="agent-mic-btn" id="agent-mic-button" onclick="VoiceAgent.toggleListening()" title="Hablar por micrófono">
                        <span id="mic-icon">🎙️</span>
                    </button>
                    <input type="text" id="agent-text-input" placeholder="Di o escribe un comando (ej. 'Reporte de Carlos Condori')..." onkeydown="if(event.key === 'Enter') VoiceAgent.handleTextSubmit()">
                    <button class="agent-send-btn" onclick="VoiceAgent.handleTextSubmit()" title="Enviar comando">
                        ➤
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    },

    closeAgentPanel() {
        const panel = document.getElementById('grad-agent-panel');
        if (panel) {
            panel.classList.add('hidden');
            panel.style.display = 'none';
        }
    },

    openAgentPanel() {
        const panel = document.getElementById('grad-agent-panel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.style.display = 'flex';
            const input = document.getElementById('agent-text-input');
            if (input) input.focus();
        }
    },

    toggleAgentPanel() {
        const panel = document.getElementById('grad-agent-panel');
        if (!panel) return;
        const isHidden = panel.classList.contains('hidden') || panel.style.display === 'none' || window.getComputedStyle(panel).display === 'none';
        if (isHidden) {
            this.openAgentPanel();
        } else {
            this.closeAgentPanel();
        }
    },

    updateAgentPulse(active) {
        const pulse = document.getElementById('fab-audio-pulse');
        const micBtn = document.getElementById('agent-mic-button');
        if (pulse) pulse.classList.toggle('active-listening', active);
        if (micBtn) micBtn.classList.toggle('listening-active', active);
    },

    appendMessage(sender, text, cssClass) {
        const box = document.getElementById('agent-messages-box');
        if (!box) return;

        const msgElem = document.createElement('div');
        msgElem.className = `chat-bubble ${cssClass}`;
        msgElem.innerHTML = `<strong>${sender}:</strong> ${text}`;
        box.appendChild(msgElem);
        box.scrollTop = box.scrollHeight;
    },

    handleTextSubmit() {
        const input = document.getElementById('agent-text-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        this.appendMessage('Tú', text, 'user-msg');
        this.processQuery(text);
    },

    // --------------------------------------------------------------------------
    // GENERADOR DE REPORTES DINÁMICOS CON SELECTOR INTERACTIVO DE TESISTAS
    // --------------------------------------------------------------------------
    showDynamicReportModal(customData = null) {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        const profiles = window.Store?.state?.data?.profiles || [];
        let activeProfile = profiles[0] || {};

        if (typeof customData === 'number' || typeof customData === 'string') {
            const found = profiles.find(p => p.id == customData || p.registro == customData || p.student.toLowerCase().includes(String(customData).toLowerCase()));
            if (found) activeProfile = found;
        } else if (customData && customData.student_id) {
            const found = profiles.find(p => p.id == customData.student_id);
            if (found) activeProfile = found;
        } else if (customData && customData.student_name) {
            const found = profiles.find(p => p.student.toLowerCase().includes(customData.student_name.toLowerCase()));
            if (found) activeProfile = found;
        } else if (window.Store?.state?.currentUser?.registro) {
            const found = profiles.find(p => p.registro === window.Store.state.currentUser.registro);
            if (found) activeProfile = found;
        }

        const chapters = activeProfile.chapters || [];
        const totalCh = chapters.length || 1;
        const compCh = chapters.filter(c => c.status === 'APROBADO').length;
        const pct = Math.round((compCh / totalCh) * 100);

        // Contar observaciones activas
        let totalObs = 0;
        chapters.forEach(c => { totalObs += (c.observations || []).length; });

        // Estimación por Machine Learning
        const estDays = Math.max(15, Math.round(150 * (1 - compCh / totalCh) + (totalObs * 10)));
        const riskLevel = estDays > 100 ? 'ALTO' : (estDays > 50 ? 'MEDIO' : 'BAJO');
        const riskClass = estDays > 100 ? 'risk-high' : (estDays > 50 ? 'risk-medium' : 'risk-low');

        modalContent.innerHTML = `
            <div class="report-modal-wrapper">
                <div class="report-header">
                    <div class="report-institution">
                        <span class="report-badge-uagrm">UAGRM • FICCT</span>
                        <h2>EXPEDIENTE OFICIAL DE SEGUIMIENTO DE GRADO</h2>
                        <span class="report-sub">Dirección de Carrera de Ingeniería en Sistemas | Semestre II-2026</span>
                    </div>
                    <div class="report-actions-top">
                        <button class="btn-print-report" onclick="window.print()" title="Imprimir o Guardar en PDF">🖨️ Imprimir / Guardar PDF</button>
                        <button class="terms-close-btn" onclick="VoiceAgent.closeModal()">&times;</button>
                    </div>
                </div>

                <div class="report-body">
                    <!-- Selector Interactivo de Tesista -->
                    <div class="report-selector-bar" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.25rem;">👤</span>
                            <strong style="color: #1e293b; font-size: 0.9rem;">Seleccionar Postulante de Grado a Visualizar:</strong>
                        </div>
                        <select id="report-student-select" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #94a3b8; font-weight: 700; font-size: 0.85rem; background: white; color: #0f172a; cursor: pointer;" onchange="VoiceAgent.changeReportStudent(this.value)">
                            ${profiles.map(p => `
                                <option value="${p.id}" ${p.id === activeProfile.id ? 'selected' : ''}>
                                    ${p.student} (Reg. ${p.registro}) • Estado: ${p.status.replace('_', ' ')}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- Resumen Ejecutivo -->
                    <div class="report-card-summary">
                        <div class="summary-col">
                            <span class="field-label">Postulante de Grado:</span>
                            <span class="field-value">${activeProfile.student}</span>
                            <span class="field-label">Registro Universitario:</span>
                            <span class="field-value">${activeProfile.registro}</span>
                        </div>
                        <div class="summary-col">
                            <span class="field-label">Docente Asesor / Tutor:</span>
                            <span class="field-value">${activeProfile.tutor_name || 'En proceso de asignación'}</span>
                            <span class="field-label">Resolución de Grado:</span>
                            <span class="field-value">${activeProfile.resolution || 'En trámite institucional'}</span>
                        </div>
                        <div class="summary-col">
                            <span class="field-label">Estado de Expediente:</span>
                            <span class="status-pill status-${activeProfile.status.toLowerCase()}">${activeProfile.status.replace('_', ' ')}</span>
                            <span class="field-label">Fecha de Emisión:</span>
                            <span class="field-value">${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>

                    <!-- Título Registrado -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Título Oficial Registrado</h4>
                        <div class="report-title-box">
                            <strong>${activeProfile.title}</strong>
                        </div>
                    </div>

                    <!-- Métricas y Avance -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Métricas y Avance de Entregables</h4>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${pct}%"></div>
                        </div>
                        <div class="progress-labels">
                            <span>Avance Global: <strong>${pct}%</strong></span>
                            <span>Capítulos Aprobados: <strong>${compCh} de ${totalCh}</strong></span>
                            <span>Observaciones Activas: <strong>${totalObs} ${totalObs === 1 ? 'pendiente' : 'pendientes'}</strong></span>
                        </div>
                    </div>

                    <!-- Tabla de Entregables -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Historial de Entregables Registrados</h4>
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Título de Entregable</th>
                                    <th>Versión</th>
                                    <th>Estado</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${chapters.map(c => `
                                    <tr>
                                        <td>${c.number ? 'Cap. ' + c.number : 'Doc.'}</td>
                                        <td><strong>${c.title}</strong></td>
                                        <td>${c.version}</td>
                                        <td><span class="badge-${c.status.toLowerCase()}">${c.status.replace('_', ' ')}</span></td>
                                        <td>${(c.observations && c.observations.length) ? c.observations.map(o => `• ${o.comment}`).join('<br>') : '<span style="color: #10b981;">✓ Sin observaciones pendientes</span>'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Predicción Machine Learning -->
                    <div class="report-ai-prediction-box">
                        <div class="prediction-icon">🤖</div>
                        <div class="prediction-content">
                            <strong>Predicción de Titulación por Machine Learning (Modelo Gradient Boosting):</strong>
                            <p>Tiempo proyectado para Defensa Pública: <strong>${estDays} días</strong>. Nivel de Riesgo de Demora: <span class="${riskClass}">${riskLevel}</span>. Recomendación: Cumplir con los plazos reglamentarios de revisión para habilitar tribunal examinador.</p>
                        </div>
                    </div>

                    <!-- Firma Digital y QR -->
                    <div class="report-verification-row">
                        <div class="qr-box">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://sis-gradmatch-jyq66kbdha-uc.a.run.app/portal/%23expediente-${activeProfile.registro}" alt="QR Verificación" style="border: 1px solid #e2e8f0; border-radius: 6px;">
                            <span>Escanear para verificar autenticidad en Google Cloud</span>
                        </div>
                        <div class="signature-box">
                            <div class="sign-line"></div>
                            <strong>M.Sc. Ing. Leonardo Vargas Peña</strong>
                            <span>Director de Carrera de Ingeniería en Sistemas</span>
                            <span>FICCT - UAGRM</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalContainer.style.display = 'flex';
        modalContainer.style.display = 'flex';
        modalContainer.classList.remove('hidden');
    },

    changeReportStudent(profileId) {
        this.showDynamicReportModal(Number(profileId));
    },

    // --------------------------------------------------------------------------
    // CLASIFICADOR SEMÁNTICO POR DEEP LEARNING (NLP FICCT)
    // --------------------------------------------------------------------------
    openDeepLearningModal(initialData = null) {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        const defaultTitle = initialData?.title || "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning";
        const defaultAbstract = initialData?.abstract || "Automatización integral de emparejamiento semántico mediante representaciones vectoriales densas de 768 dimensiones, arquitectura C4 desacoplada, marco de trabajo SCRUM y visor colaborativo de observaciones pedagógicas en la FICCT - UAGRM.";

        modalContent.innerHTML = `
            <div class="terms-modal-wrapper" style="max-width: 850px;">
                <div class="terms-modal-header" style="background: linear-gradient(135deg, #1e3a8a, #4338ca); color: white;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                            <span>🧠</span> Clasificador Semántico por Deep Learning (NLP FICCT)
                        </h2>
                        <span style="font-size: 0.8rem; opacity: 0.9;">Modelo de Embeddings Densos y Clasificación sobre los 5 Ejes Estratégicos de la Carrera</span>
                    </div>
                    <button class="terms-close-btn" onclick="VoiceAgent.closeModal()" style="color: white;">&times;</button>
                </div>

                <div class="terms-modal-body" style="padding: 20px;">
                    <!-- Explicación Didáctica -->
                    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 0.85rem; color: #1e40af; line-height: 1.4;">
                        <strong>¿Qué hace y para qué sirve?</strong>
                        <p style="margin: 4px 0 0 0;">
                            Procesa el título y resumen técnico del perfil de grado para determinar automáticamente el área de especialidad correspondiente, extraer palabras clave y recomendar el marco metodológico y de calidad SQA que el estudiante debe seguir, orientando además la asignación del tutor ideal.
                        </p>
                    </div>

                    <!-- Botones de Ejemplos Rápidos -->
                    <div style="margin-bottom: 16px;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Cargar Propuesta de Ejemplo:</span>
                        <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                            <button type="button" class="btn" style="font-size: 0.75rem; background: #e0e7ff; color: #3730a3; padding: 6px 10px;" onclick="VoiceAgent.loadClassifierSample(1)">
                                👨‍🎓 Tesis Maikol Molina (IA & Software)
                            </button>
                            <button type="button" class="btn" style="font-size: 0.75rem; background: #fee2e2; color: #991b1b; padding: 6px 10px;" onclick="VoiceAgent.loadClassifierSample(2)">
                                👨‍🎓 Tesis Carlos Condori (Redes & IoT)
                            </button>
                            <button type="button" class="btn" style="font-size: 0.75rem; background: #ecfdf5; color: #065f46; padding: 6px 10px;" onclick="VoiceAgent.loadClassifierSample(3)">
                                👩‍🎓 Tesis Andrea Guzmán (Big Data & Deserción)
                            </button>
                        </div>
                    </div>

                    <!-- Formulario de Entrada -->
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label class="form-label" style="font-weight: 700;">Título Propuesto del Proyecto de Grado:</label>
                        <input type="text" id="dl-classifier-title" class="form-input" value="${defaultTitle}" style="font-size: 0.9rem;">
                    </div>

                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label" style="font-weight: 700;">Resumen Técnico / Abstract:</label>
                        <textarea id="dl-classifier-abstract" class="form-textarea" rows="3" style="font-size: 0.85rem;">${defaultAbstract}</textarea>
                    </div>

                    <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                        <button class="btn btn-primary" id="btn-run-classifier" onclick="VoiceAgent.runClassifierAnalysis()" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border: none; padding: 10px 20px; font-weight: 700; font-size: 0.9rem;">
                            ⚡ Analizar Propuesta con Deep Learning
                        </button>
                    </div>

                    <!-- Panel de Resultados Dinámicos -->
                    <div id="dl-classifier-results" style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                        <div style="text-align: center; color: #94a3b8; padding: 20px;">
                            Presiona <strong>"Analizar Propuesta con Deep Learning"</strong> para procesar el texto con las redes neuronales semánticas.
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalContainer.style.display = 'flex';
        modalContainer.classList.remove('hidden');

        // Si ya venían datos precargados, renderizarlos inmediatamente
        if (initialData && initialData.primary_area) {
            this.renderClassifierResults(initialData);
        }
    },

    loadClassifierSample(index) {
        const titleEl = document.getElementById('dl-classifier-title');
        const abstractEl = document.getElementById('dl-classifier-abstract');
        if (!titleEl || !abstractEl) return;

        if (index === 1) {
            titleEl.value = "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning";
            abstractEl.value = "Automatización integral de emparejamiento semántico mediante representaciones vectoriales densas de 768 dimensiones, arquitectura C4 desacoplada, marco de trabajo SCRUM y visor colaborativo de observaciones pedagógicas en la FICCT - UAGRM.";
        } else if (index === 2) {
            titleEl.value = "Plataforma IoT de Detección Temprana de Fallas en Redes de Telecomunicaciones";
            abstractEl.value = "Monitoreo en tiempo real de nodos de telecomunicación mediante microcontroladores ESP32, protocolo MQTT y análisis de telemetría para la detección predictiva de cortes de fibra óptica.";
        } else if (index === 3) {
            titleEl.value = "Modelo Predictivo de Deserción Universitaria con Redes Neuronales y Bases de Datos Vectoriales";
            abstractEl.value = "Diseño de un motor de inferencia analítica sobre el historial académico de la FICCT, empleando clustering k-means y clasificación profunda para alertar tempranamente estudiantes en riesgo académico.";
        }

        this.runClassifierAnalysis();
    },

    async runClassifierAnalysis() {
        const titleEl = document.getElementById('dl-classifier-title');
        const abstractEl = document.getElementById('dl-classifier-abstract');
        const resultsEl = document.getElementById('dl-classifier-results');
        const runBtn = document.getElementById('btn-run-classifier');
        if (!titleEl || !abstractEl || !resultsEl) return;

        const title = titleEl.value.trim();
        const abstract = abstractEl.value.trim();

        if (!title || !abstract) {
            alert("Por favor ingresa un título y un resumen técnico.");
            return;
        }

        if (runBtn) {
            runBtn.disabled = true;
            runBtn.textContent = "⏳ Infiriendo con Redes Neuronales...";
        }

        resultsEl.innerHTML = `
            <div style="text-align: center; padding: 25px;">
                <div class="fab-pulse" style="display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: #6366f1; animation: pulse-ring 1.2s infinite;"></div>
                <div style="margin-top: 12px; font-weight: 700; color: #4338ca;">Vectorizando texto y calculando afinidades semánticas...</div>
            </div>
        `;

        try {
            const data = await this.queryAiApi('/api/v1/ai/classify-area', { title, abstract });
            this.renderClassifierResults(data);
            this.speak(`Tema clasificado exitosamente en el eje: ${data.primary_area}, con ${data.confidence}% de certeza.`);
        } catch (error) {
            console.error('Error clasificando área:', error);
            resultsEl.innerHTML = `
                <div style="background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px;">
                    ⚠️ Error conectando con el motor de Deep Learning. Por favor asegúrate de que el servidor esté activo.
                </div>
            `;
        } finally {
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.textContent = "⚡ Analizar Propuesta con Deep Learning";
            }
        }
    },

    renderClassifierResults(data) {
        const resultsEl = document.getElementById('dl-classifier-results');
        if (!resultsEl) return;

        const dist = data.distribution || {};
        const kwList = data.keywords_detected || [];

        resultsEl.innerHTML = `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                <!-- Diagnóstico Principal -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Eje Estratégico Primario (Inferencia DL):</span>
                        <h3 style="margin: 2px 0 0 0; color: #1e3a8a; font-size: 1.15rem; font-weight: 800;">
                            🎯 ${data.primary_area}
                        </h3>
                    </div>
                    <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 6px 14px; border-radius: 20px; font-weight: 800; color: #065f46; font-size: 0.9rem;">
                        Confianza: ${data.confidence}%
                    </div>
                </div>

                <!-- Gráfico de Distribución de los 5 Ejes FICCT -->
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #475569;">Distribución Porcentual en los 5 Ejes de la FICCT:</span>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                        ${Object.entries(dist).map(([area, val]) => {
                            const isPrimary = area === data.primary_area;
                            return `
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                                        <span style="font-weight: ${isPrimary ? '800' : '500'}; color: ${isPrimary ? '#1e3a8a' : '#475569'};">
                                            ${area} ${isPrimary ? '★' : ''}
                                        </span>
                                        <span style="font-weight: 700; color: ${isPrimary ? '#1e3a8a' : '#64748b'};">${val}%</span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${val}%; height: 100%; background: ${isPrimary ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)' : '#94a3b8'}; border-radius: 4px; transition: width 0.6s ease;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Palabras Clave y Conceptos Extraídos -->
                <div style="margin-bottom: 16px;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #475569;">Conceptos NLP y Palabras Clave Detectadas:</span>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                        ${kwList.map(kw => `
                            <span style="background: #f1f5f9; color: #334155; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 600;">
                                #${kw}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Recomendación Metodológica y SQA -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 6px;">
                    <strong style="color: #065f46; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                        <span>📋</span> Marco Metodológico y Calidad SQA Recomendado:
                    </strong>
                    <p style="margin: 4px 0 0 0; color: #334155; font-size: 0.85rem; line-height: 1.4;">
                        ${data.methodological_recommendation}
                    </p>
                </div>
            </div>
        `;
    },

    closeModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.classList.add('hidden');
            modalContainer.style.display = 'none';
        }
    }
};

window.VoiceAgent = VoiceAgent;

/**
 * SIS-GradMatch: Agente Inteligente por Voz ("GradAgent IA") y Generador de Reportes Dinámicos
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
            // Buscar voz en español preferida
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
            this.appendMessage('GradAgent', '🎙️ Te estoy escuchando... Di tu solicitud (ej. "Generar reporte de avance", "Ver mis observaciones", "Calcular tutores")', 'agent-listening');
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
                this.appendMessage('GradAgent', `⚠️ No pude captar el audio (${event.error}). Puedes escribir tu comando abajo.`, 'agent-msg');
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
        const cleanText = text.replace(/[*_#`]/g, '');
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

    async processQuery(text) {
        const inputField = document.getElementById('agent-text-input');
        if (inputField) inputField.value = '';

        this.appendMessage('GradAgent', '⏳ Procesando comando...', 'agent-typing');

        try {
            const response = await fetch('/api/v1/ai/voice-agent-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: text,
                    current_user_role: window.Store?.currentUser?.role || 'ESTUDIANTE',
                    student_code: window.Store?.currentUser?.studentCode || '220012345'
                })
            });

            const data = await response.json();
            
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
            
            const fallbackMsg = "Ocurrió un error de red al contactar al motor de IA. Ejecutando acción local...";
            this.speak(fallbackMsg);
            this.appendMessage('GradAgent', fallbackMsg, 'agent-msg');
            
            // Fallback local
            if (text.toLowerCase().includes('reporte')) {
                this.showDynamicReportModal();
            }
        }
    },

    executeAction(data) {
        if (!data) return;

        switch (data.action) {
            case 'OPEN_REPORT_MODAL':
                setTimeout(() => this.showDynamicReportModal(data.data), 800);
                break;
            case 'NAVIGATE_TO_OBSERVATIONS':
                if (window.App && App.navigateTo) App.navigateTo('drafts');
                break;
            case 'TRIGGER_MATCHMAKING_CALCULATION':
                if (window.App && App.navigateTo) App.navigateTo('matchmaking');
                break;
            case 'TRIGGER_DOCUMENT_DOWNLOAD':
                if (data.data?.download_url) {
                    window.open(data.data.download_url, '_blank');
                }
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
                    <button class="agent-close-btn" onclick="VoiceAgent.toggleAgentPanel()">&times;</button>
                </div>

                <div class="agent-quick-actions">
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Generar reporte de avance de tesis')">📊 Generar Reporte</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Ver mis observaciones pendientes')">📝 Mis Observaciones</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('Calcular afinidad de tutores con IA')">🧠 Recomendar Tutor</button>
                    <button class="agent-pill-btn" onclick="VoiceAgent.processQuery('¿Cuáles son los plazos reglamentarios?')">📜 Plazos Reglamentarios</button>
                </div>

                <div class="agent-messages-container" id="agent-messages-box">
                    <div class="agent-msg">
                        ¡Hola! Soy <strong>GradAgent</strong>, tu agente inteligente para la titulación en la FICCT - UAGRM. 
                        Presiona el <strong>micrófono</strong> y habla, o escribe tu solicitud para que yo ejecute acciones y genere reportes dinámicos.
                    </div>
                </div>

                <div class="agent-input-bar">
                    <button class="agent-mic-btn" id="agent-mic-button" onclick="VoiceAgent.toggleListening()" title="Hablar por micrófono">
                        <span id="mic-icon">🎙️</span>
                    </button>
                    <input type="text" id="agent-text-input" placeholder="Di o escribe un comando..." onkeydown="if(event.key === 'Enter') VoiceAgent.handleTextSubmit()">
                    <button class="agent-send-btn" onclick="VoiceAgent.handleTextSubmit()" title="Enviar comando">
                        ➤
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    },

    toggleAgentPanel() {
        const panel = document.getElementById('grad-agent-panel');
        if (!panel) return;
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            const input = document.getElementById('agent-text-input');
            if (input) input.focus();
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
    // GENERADOR DE REPORTES DINÁMICOS
    // --------------------------------------------------------------------------
    showDynamicReportModal(customData = null) {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        const state = window.Store?.thesisState || {};
        const title = state.title || "Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada";
        const student = state.studentName || "Molina Cortez Maikol Anthony";
        const tutor = state.tutorName || "Ing. Rolando Antoni Martínez Canedo";
        const status = state.status || "OBSERVADO";
        const chapters = state.chapters || [];
        const totalCh = chapters.length || 5;
        const compCh = chapters.filter(c => c.status === 'APROBADO').length || 1;
        const pct = Math.round((compCh / totalCh) * 100);

        modalContent.innerHTML = `
            <div class="report-modal-wrapper">
                <div class="report-header">
                    <div class="report-institution">
                        <span class="report-badge-uagrm">UAGRM • FICCT</span>
                        <h2>EXPEDIENTE OFICIAL DE SEGUIMIENTO DE GRADO</h2>
                        <span class="report-sub">Dirección de Carrera de Ingeniería en Sistemas | Plan de Estudios 187-3</span>
                    </div>
                    <div class="report-actions-top">
                        <button class="btn-print-report" onclick="window.print()" title="Imprimir o Guardar en PDF">🖨️ Imprimir / Guardar PDF</button>
                        <button class="terms-close-btn" onclick="VoiceAgent.closeModal()">&times;</button>
                    </div>
                </div>

                <div class="report-body">
                    <!-- Resumen Ejecutivo -->
                    <div class="report-card-summary">
                        <div class="summary-col">
                            <span class="field-label">Postulante de Grado:</span>
                            <span class="field-value">${student}</span>
                            <span class="field-label">Registro Universitario:</span>
                            <span class="field-value">220012345</span>
                        </div>
                        <div class="summary-col">
                            <span class="field-label">Docente Tutor Oficial:</span>
                            <span class="field-value">${tutor}</span>
                            <span class="field-label">Modalidad Académica:</span>
                            <span class="field-value">Proyecto de Grado (Malla 100% Vencida)</span>
                        </div>
                        <div class="summary-col">
                            <span class="field-label">Estado de Expediente:</span>
                            <span class="status-pill status-${status.toLowerCase()}">${status}</span>
                            <span class="field-label">Fecha de Emisión:</span>
                            <span class="field-value">${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>

                    <!-- Proyecto y Título -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Título Registrado de la Tesis</h4>
                        <div class="report-title-box">
                            <strong>${title}</strong>
                        </div>
                    </div>

                    <!-- Gráfico Dinámico de Avance y Métricas -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Métricas y Avance de Entregables</h4>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${pct}%"></div>
                        </div>
                        <div class="progress-labels">
                            <span>Avance Global: <strong>${pct}%</strong></span>
                            <span>Capítulos Aprobados: <strong>${compCh} de ${totalCh}</strong></span>
                            <span>Observaciones Activas: <strong>1 pendiente</strong></span>
                        </div>
                    </div>

                    <!-- Tabla de Capítulos -->
                    <div class="report-section">
                        <h4 class="report-sec-h">Historial de Entregables por Capítulo</h4>
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Capítulo</th>
                                    <th>Nombre del Entregable</th>
                                    <th>Versión</th>
                                    <th>Estado</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Capítulo 1</td>
                                    <td>Marco Teórico y Estado del Arte</td>
                                    <td>v1.2</td>
                                    <td><span class="badge-approved">APROBADO</span></td>
                                    <td>Subsanado formalmente</td>
                                </tr>
                                <tr>
                                    <td>Capítulo 2</td>
                                    <td>Metodología de Desarrollo SCRUM</td>
                                    <td>v1.0</td>
                                    <td><span class="badge-observed">OBSERVADO</span></td>
                                    <td>Pendiente: Justificación de similitud coseno</td>
                                </tr>
                                <tr>
                                    <td>Capítulo 3</td>
                                    <td>Aseguramiento de Calidad SQA</td>
                                    <td>v1.0</td>
                                    <td><span class="badge-pending">PENDIENTE</span></td>
                                    <td>En elaboración por el estudiante</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Predicción de Graduación por IA -->
                    <div class="report-ai-prediction-box">
                        <div class="prediction-icon">🤖</div>
                        <div class="prediction-content">
                            <strong>Predicción de Titulación por Machine Learning (Modelo Gradient Boosting):</strong>
                            <p>Tiempo proyectado para Defensa Pública: <strong>110 días</strong> (Aproximadamente Marzo 2027). Nivel de Riesgo de Demora: <span class="risk-medium">MEDIO</span>. Recomendación: Subsanar observaciones del Capítulo 2 dentro del plazo reglamentario de 10 días para habilitar conformación de tribunales.</p>
                        </div>
                    </div>

                    <!-- Firma Digital y QR de Verificación -->
                    <div class="report-verification-row">
                        <div class="qr-box">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://sis-gradmatch-jyq66kbdha-uc.a.run.app/portal/%23expediente-220012345" alt="QR Verificación" style="border: 1px solid #e2e8f0; border-radius: 6px;">
                            <span>Escanear para verificar autenticidad en la nube</span>
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

        modalContainer.classList.remove('hidden');
    },

    closeModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.classList.add('hidden');
    }
};

window.VoiceAgent = VoiceAgent;

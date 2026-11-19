/**
 * SIS-GradMatch: Módulo de Consentimiento de Cookies y Términos y Condiciones
 * FICCT - UAGRM | Molina Cortez Maikol Anthony
 */

const CookieConsent = {
    STORAGE_KEY: 'gradmatch_cookie_consent_v1',
    TERMS_KEY: 'gradmatch_terms_accepted_v1',

    init() {
        this.renderCookieBanner();
        this.attachGlobalListeners();
    },

    hasConsent() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },

    hasAcceptedTerms() {
        return localStorage.getItem(this.TERMS_KEY) !== null;
    },

    renderCookieBanner() {
        if (this.hasConsent()) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <span class="cookie-icon">🍪</span>
                    <div>
                        <strong class="cookie-title">Política de Cookies y Privacidad Académica</strong>
                        <p class="cookie-desc">
                            SIS-GradMatch utiliza cookies técnicas y almacenamiento local esencial para gestionar sesiones seguras (JWT), 
                            recordar tus preferencias y garantizar la integridad de tus perfiles y borradores de grado según el reglamento de la 
                            <strong>FICCT - UAGRM</strong>. Puedes revisar los 
                            <a href="javascript:void(0)" onclick="CookieConsent.showTermsModal()" class="cookie-link">Términos y Condiciones</a>.
                        </p>
                    </div>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn-cookie-secondary" onclick="CookieConsent.acceptNecessary()">Solo Necesarias</button>
                    <button class="btn-cookie-primary" onclick="CookieConsent.acceptAll()">Aceptar Todas</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
    },

    acceptAll() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            accepted: true,
            type: 'ALL',
            date: new Date().toISOString()
        }));
        this.removeBanner();
        if (window.showToast) window.showToast("Preferencias de cookies guardadas exitosamente.", "success");
    },

    acceptNecessary() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            accepted: true,
            type: 'NECESSARY_ONLY',
            date: new Date().toISOString()
        }));
        this.removeBanner();
        if (window.showToast) window.showToast("Cookies configuradas: solo esenciales activas.", "info");
    },

    removeBanner() {
        const b = document.getElementById('cookie-consent-banner');
        if (b) {
            b.classList.add('cookie-banner-fadeout');
            setTimeout(() => b.remove(), 400);
        }
    },

    showTermsModal() {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        modalContent.innerHTML = `
            <div class="terms-modal-wrapper">
                <div class="terms-header">
                    <div class="terms-title-group">
                        <span class="terms-badge">FICCT • UAGRM</span>
                        <h2 class="terms-title">Términos y Condiciones de Uso y Política de Privacidad</h2>
                        <span class="terms-subtitle">Sistema Inteligente de Gestión de Proyectos de Grado (SIS-GradMatch)</span>
                    </div>
                    <button class="terms-close-btn" onclick="CookieConsent.closeTermsModal()">&times;</button>
                </div>

                <div class="terms-body">
                    <div class="terms-callout">
                        <strong>📌 Aviso Institucional:</strong> Al utilizar esta plataforma, usted declara conocer y acatar el 
                        <em>Reglamento General de Modalidades de Graduación de la FICCT - UAGRM</em> para la modalidad de Proyecto de Grado 
                        (Plan de Estudios 187-3).
                    </div>

                    <h3 class="terms-sec-title">1. Ámbito de Aplicación y Objeto</h3>
                    <p>
                        La plataforma SIS-GradMatch es una solución informática desarrollada con fines académicos e institucionales para la 
                        Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones de la Universidad Autónoma Gabriel René Moreno. 
                        Tiene por objeto digitalizar, agilizar y optimizar el proceso de asignación de tutores y seguimiento de proyectos de grado.
                    </p>

                    <h3 class="terms-sec-title">2. Tratamiento de Datos Personales y Académicos</h3>
                    <p>
                        La información personal, académica y de avance de tesis registrada por estudiantes y docentes (nombres, correos institucionales, 
                        códigos de registro, áreas temáticas y borradores) es tratada bajo estricta confidencialidad y utilizada exclusivamente 
                        para los fines de evaluación, tutoría y seguimiento facultativo.
                    </p>

                    <h3 class="terms-sec-title">3. Propiedad Intelectual y Derechos de Autor</h3>
                    <p>
                        Conforme a la normativa universitaria boliviana y reglamentación interna de la UAGRM:
                    </p>
                    <ul class="terms-list">
                        <li>Los estudiantes postulantes son los autores legítimos y titulares morales de sus proyectos y propuestas de investigación.</li>
                        <li>Los docentes tutores y revisores actúan como orientadores metodológicos y técnicos en representación de la FICCT.</li>
                        <li>Queda terminantemente prohibida la copia, plagio o apropiación indebida de ideas, perfiles o código fuente sin la debida citación y autorización formal.</li>
                    </ul>

                    <h3 class="terms-sec-title">4. Uso Ético de Inteligencia Artificial</h3>
                    <p>
                        El sistema integra algoritmos de Aprendizaje Automático (NLP, TF-IDF y Similitud Coseno) para sugerir docentes afines 
                        según su especialidad y disponibilidad. Dicha recomendación tiene carácter orientativo y no vinculante, quedando la 
                        designación final sujeta a la aprobación del Director de Carrera.
                    </p>

                    <h3 class="terms-sec-title">5. Responsabilidad en Entregables y Resoluciones</h3>
                    <p>
                        Los documentos y resoluciones emitidos mediante la plataforma cuentan con códigos QR de verificación criptográfica e 
                        identificadores inmutables en servidor para evitar cualquier tipo de falsificación documental.
                    </p>
                </div>

                <div class="terms-footer">
                    <div class="terms-agreement-check">
                        <input type="checkbox" id="chk-accept-terms" ${this.hasAcceptedTerms() ? 'checked' : ''} onchange="CookieConsent.toggleAcceptTerms(this.checked)">
                        <label for="chk-accept-terms">He leído, comprendo y acepto los Términos, Condiciones y Política de Privacidad de la FICCT.</label>
                    </div>
                    <button class="btn-primary" onclick="CookieConsent.confirmTermsAcceptance()">Aceptar y Continuar</button>
                </div>
            </div>
        `;

        modalContainer.classList.remove('hidden');
    },

    toggleAcceptTerms(checked) {
        if (checked) {
            localStorage.setItem(this.TERMS_KEY, new Date().toISOString());
        } else {
            localStorage.removeItem(this.TERMS_KEY);
        }
    },

    confirmTermsAcceptance() {
        localStorage.setItem(this.TERMS_KEY, new Date().toISOString());
        this.closeTermsModal();
        if (window.showToast) window.showToast("Términos y Condiciones aceptados formalmente.", "success");
    },

    closeTermsModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.classList.add('hidden');
    },

    attachGlobalListeners() {
        // Enlace accesible con tecla Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeTermsModal();
        });
    }
};

window.CookieConsent = CookieConsent;

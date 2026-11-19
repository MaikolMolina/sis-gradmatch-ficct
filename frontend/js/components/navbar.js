/**
 * SIS-GradMatch: Navbar & Sidebar Component
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const NavbarComponent = {
    init() {
        this.renderUserMeta();
        this.renderSidebar();
        this.bindEvents();
    },

    renderUserMeta() {
        const user = Store.state.currentUser;
        if (!user) return;

        const avatarEl = document.getElementById('current-user-avatar');
        const nameEl = document.getElementById('current-user-name');
        const roleEl = document.getElementById('current-user-role');

        if (avatarEl) avatarEl.textContent = user.avatar || 'US';
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.role.replace('_', ' ');

        // Highlight active role pill
        document.querySelectorAll('.role-pill').forEach(btn => {
            if (btn.dataset.user === user.username) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    renderSidebar() {
        const navContainer = document.getElementById('sidebar-nav-links');
        if (!navContainer) return;

        const role = Store.state.activeRole;
        let links = [];

        if (role === 'DIRECTOR_CARRERA' || role === 'ADMIN') {
            links = [
                { id: 'director-kpis', icon: '📊', label: 'Mando & Analítica' },
                { id: 'director-matchmaking', icon: '🤖', label: 'Matchmaking IA' },
                { id: 'director-classifier', icon: '🧠', label: 'Clasificador DL' },
                { id: 'director-resolutions', icon: '📜', label: 'Resoluciones RA' },
                { id: 'director-tribunals', icon: '⚖️', label: 'Designar Tribunales' },
                { id: 'director-cpd', icon: '🏛️', label: 'Validación CPD' }
            ];
        } else if (role === 'DOCENTE_TUTOR') {
            links = [
                { id: 'tutor-inbox', icon: '📥', label: 'Bandeja Tesistas' },
                { id: 'tutor-reviewer', icon: '📝', label: 'Revisión Borradores' },
                { id: 'tutor-dictamen', icon: '✅', label: 'Dictamen de Aprobación' }
            ];
        } else if (role === 'ESTUDIANTE') {
            links = [
                { id: 'student-timeline', icon: '🧭', label: 'Línea de Tiempo' },
                { id: 'student-profile', icon: '📄', label: 'Cargar Perfil PDF' },
                { id: 'student-classifier', icon: '🧠', label: 'Clasificador DL' },
                { id: 'student-draft', icon: '📤', label: 'Subir Borrador' },
                { id: 'student-observations', icon: '💬', label: 'Mis Observaciones' }
            ];
        }

        navContainer.innerHTML = links.map(link => `
            <a class="nav-item ${Store.state.activeView === link.id ? 'active' : ''}" data-view="${link.id}">
                <span class="icon">${link.icon}</span>
                <span class="label">${link.label}</span>
            </a>
        `).join('');

        // Attach click listeners to new links
        navContainer.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view === 'director-classifier' || view === 'student-classifier') {
                    VoiceAgent.openDeepLearningModal();
                    return;
                }
                Store.setView(view);
            });
        });
    },

    bindEvents() {
        // Quick demo user switcher buttons
        document.querySelectorAll('.role-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const userKey = btn.dataset.user;
                Store.selectDemoUser(userKey);
            });
        });
    }
};

window.NavbarComponent = NavbarComponent;

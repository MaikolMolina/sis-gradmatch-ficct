// SIS-GradMatch Corporate Website & Smart Chatbot Logic
document.addEventListener("DOMContentLoaded", () => {
  // Chatbot toggle
  const chatToggleBtn = document.getElementById("chatToggleBtn");
  const chatCloseBtn = document.getElementById("chatCloseBtn");
  const chatWindow = document.getElementById("chatWindow");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const chatMessages = document.getElementById("chatMessages");

  chatToggleBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("open");
  });

  chatCloseBtn.addEventListener("click", () => {
    chatWindow.classList.remove("open");
  });

  // Sending messages
  const appendMessage = (text, isBot = false) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isBot ? "bot-message" : "user-message"}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const handleSendMessage = () => {
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage(query, false);
    chatInput.value = "";

    // Simulated Smart NLP Assistant response based on UAGRM regulations
    setTimeout(() => {
      let botReply = getSmartBotResponse(query);
      appendMessage(botReply, true);
    }, 600);
  };

  chatSendBtn.addEventListener("click", handleSendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // Contact form submission
  const contactForm = document.getElementById("contactForm");
  const formFeedback = document.getElementById("formFeedback");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    formFeedback.style.color = "#059669";
    formFeedback.textContent = `¡Gracias, ${name}! Tu solicitud ha sido registrada correctamente. Te hemos enviado un correo de confirmación a ${email}.`;
    contactForm.reset();
  });
});

// Global chip prompt handler
function sendQuickPrompt(promptText) {
  const chatInput = document.getElementById("chatInput");
  chatInput.value = promptText;
  const chatSendBtn = document.getElementById("chatSendBtn");
  chatSendBtn.click();
}

// Smart Knowledge Base (UAGRM FICCT Degree Projects)
function getSmartBotResponse(query) {
  const q = query.toLowerCase();

  if (q.includes("requisito") || q.includes("postular") || q.includes("habilitacion")) {
    return "<strong>Requisitos de Postulación (FICCT - UAGRM):</strong><br>1. Ser alumno regular de Ingeniería en Sistemas.<br>2. Haber completado y aprobado hasta el 8vo semestre.<br>3. Presentar Perfil de Grado en PDF (máximo 15 MB) con justificación, objetivos y metodología PUDS.<br>4. No registrar deudas documentales en el CPD universitario.";
  } else if (q.includes("matching") || q.includes("ia") || q.includes("tutor") || q.includes("asignacion")) {
    return "<strong>¿Cómo funciona el Matchmaking Inteligente?</strong><br>El motor de IA utiliza modelos de lenguaje (Sentence-Transformers) para convertir el resumen y objetivos de tu perfil en un vector semántico denso de 768 dimensiones. Luego calcula la <em>similitud coseno</em> con las líneas de investigación de los docentes y pondera su cupo disponible para sugerir al tutor más calificado.";
  } else if (q.includes("modalidad") || q.includes("titulacion") || q.includes("tesis") || q.includes("trabajo dirigido")) {
    return "En la FICCT - UAGRM existen formalmente 4 modalidades de titulación:<br>• <strong>Proyecto de Grado:</strong> Solución práctica de ingeniería.<br>• <strong>Tesis de Grado:</strong> Investigación científica y metodológica.<br>• <strong>Trabajo Dirigido:</strong> Pasantía institucional en empresa/organismo.<br>• <strong>Graduación por Excelencia:</strong> Promedio ponderado destacado.";
  } else if (q.includes("borrador") || q.includes("revision") || q.includes("capitulo")) {
    return "Una vez aprobado tu perfil, subes tus borradores de avance por capítulos en formato PDF. Tu tutor utilizará nuestro visor interactivo para resaltar observaciones y dejar recomendaciones pedagógicas que recibirás de inmediato por email.";
  } else if (q.includes("tiempo") || q.includes("plazo") || q.includes("duracion")) {
    return "El proceso regular de Taller de Grado comprende un semestre académico (16 a 18 semanas). Gracias a SIS-GradMatch, la asignación de tutor pasa de demorar hasta 45 días a menos de 48 horas hábiles.";
  } else {
    return "Comprendo tu consulta sobre: '<em>" + query + "</em>'. Para atender este caso específico, puedes comunicarte con la Dirección de Carrera al correo <strong>sistemas@ficct.uagrm.edu.bo</strong> o acudir al Módulo 236 de la FICCT.";
  }
}

export const translations = {
  en: {
    // Nav / header
    title: "Property Maintenance Request",
    subtitle: "Submit a repair or maintenance issue",
    switchLang: "Español",

    // Form fields
    tenantName: "Your Name",
    tenantNamePlaceholder: "Full name",
    unitAddress: "Property Address / Unit",
    unitAddressPlaceholder: "e.g. 123 Main St, Unit 2",
    issueTitle: "Issue Title",
    issueTitlePlaceholder: "Brief description (e.g. Leaky faucet)",
    issueDescription: "Describe the Problem",
    issueDescriptionPlaceholder: "Please describe the issue in as much detail as possible...",
    location: "Where in the Property?",
    locationPlaceholder: "e.g. Kitchen, Master Bathroom, Garage",
    severity: "How Urgent is This?",
    severityLow: "Low — Not urgent, routine maintenance",
    severityMedium: "Medium — Needs attention soon",
    severityHigh: "High — Urgent, affecting daily living",
    severityCritical: "Critical — Emergency, safety hazard",
    photos: "Upload Photos (optional)",
    photosHelp: "You may upload up to 5 photos",
    submit: "Submit Request",
    submitting: "Submitting...",

    // Success
    successTitle: "Request Submitted!",
    successMessage: "Your maintenance request has been received. The property manager will be in touch soon.",
    submitAnother: "Submit Another Request",

    // Errors
    errorRequired: "Please fill in all required fields.",
    errorSubmit: "Something went wrong. Please try again.",
  },
  es: {
    // Nav / header
    title: "Solicitud de Mantenimiento",
    subtitle: "Envíe un problema de reparación o mantenimiento",
    switchLang: "English",

    // Form fields
    tenantName: "Su Nombre",
    tenantNamePlaceholder: "Nombre completo",
    unitAddress: "Dirección / Unidad",
    unitAddressPlaceholder: "ej. 123 Calle Principal, Unidad 2",
    issueTitle: "Título del Problema",
    issueTitlePlaceholder: "Descripción breve (ej. Grifo con goteo)",
    issueDescription: "Describa el Problema",
    issueDescriptionPlaceholder: "Por favor describa el problema con el mayor detalle posible...",
    location: "¿Dónde en la Propiedad?",
    locationPlaceholder: "ej. Cocina, Baño Principal, Garaje",
    severity: "¿Qué Tan Urgente Es?",
    severityLow: "Bajo — No urgente, mantenimiento de rutina",
    severityMedium: "Medio — Necesita atención pronto",
    severityHigh: "Alto — Urgente, afecta la vida diaria",
    severityCritical: "Crítico — Emergencia, peligro de seguridad",
    photos: "Subir Fotos (opcional)",
    photosHelp: "Puede subir hasta 5 fotos",
    submit: "Enviar Solicitud",
    submitting: "Enviando...",

    // Success
    successTitle: "¡Solicitud Enviada!",
    successMessage: "Su solicitud de mantenimiento ha sido recibida. El administrador de la propiedad se comunicará pronto.",
    submitAnother: "Enviar Otra Solicitud",

    // Errors
    errorRequired: "Por favor complete todos los campos requeridos.",
    errorSubmit: "Algo salió mal. Por favor intente de nuevo.",
  }
}

export type Lang = 'en' | 'es'

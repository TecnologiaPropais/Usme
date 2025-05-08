// Configuración de URLs base
const config = {
  // URLs base para diferentes entornos
  baseUrls: {
    local: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    production: import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com/api'
  },
  
  // URL actual basada en el entorno
  get baseUrl() {
    // Usamos la URL de desarrollo si estamos en desarrollo, de lo contrario producción
    return import.meta.env.MODE === 'development' 
      ? this.baseUrls.local 
      : this.baseUrls.production;
  },

  // URLs específicas para diferentes recursos
  get urls() {
    return {
      users: `${this.baseUrl}/users`,
      roles: `${this.baseUrl}/roles`,
      inscriptions: `${this.baseUrl}/inscriptions`,
      pi: `${this.baseUrl}/inscriptions/pi`,
      tables: `${this.baseUrl}/inscriptions/tables`,
      providers: `${this.baseUrl}/inscriptions/tables?tableType=provider`,
      inscriptionsTables: `${this.baseUrl}/inscriptions/tables?tableType=inscription`
    };
  }
};

export default config; 
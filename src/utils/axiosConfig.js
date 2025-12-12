import axios from 'axios'
import Vue from 'vue'

// Création de l'instance axios
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 secondes timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Récupérer le token depuis le stockage
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

// Récupérer les infos utilisateur
function getUser() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Intercepteur pour ajouter le token automatiquement à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Pour debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    // Pour debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`)
    }
    
    return response
  },
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      const { status, data } = error.response
      
      // Erreur 401 - Non autorisé
      if (status === 401) {
        // Nettoyer le stockage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        
        // Rediriger vers la page de login
        // Utiliser window.location car on n'a pas accès au router ici
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        
        // Message d'erreur personnalisé
        error.message = data.message || 'Session expirée. Veuillez vous reconnecter.'
      }
      
      // Erreur 403 - Interdit
      else if (status === 403) {
        error.message = data.message || 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
        
        // Rediriger vers le dashboard si pas autorisé
        if (!window.location.pathname.includes('/admin/overview')) {
          window.location.href = '/admin/overview'
        }
      }
      
      // Erreur 404 - Non trouvé
      else if (status === 404) {
        error.message = data.message || 'Ressource non trouvée'
      }
      
      // Erreur 500+ - Erreur serveur
      else if (status >= 500) {
        error.message = data.message || 'Erreur serveur. Veuillez réessayer plus tard.'
      }
      
      // Autres erreurs
      else {
        error.message = data.message || error.message
      }
      
      console.error(`[API Error] ${status} ${error.config.url}:`, error.message)
    } 
    // Pas de réponse du serveur
    else if (error.request) {
      error.message = 'Serveur inaccessible. Vérifiez votre connexion internet.'
      console.error('[API Error] Pas de réponse du serveur')
    }
    // Erreur de configuration
    else {
      console.error('[API Error] Configuration:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Fonctions utilitaires pour l'authentification
const auth = {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!getToken()
  },
  
  // Récupérer le token
  getToken() {
    return getToken()
  },
  
  // Récupérer les infos utilisateur
  getUser() {
    return getUser()
  },
  
  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    const user = getUser()
    return user && user.role === role
  },
  
  // Vérifier si l'utilisateur a au moins un des rôles spécifiés
  hasAnyRole(roles) {
    const user = getUser()
    return user && roles.includes(user.role)
  },
  
  // Déconnexion
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    // Supprimer le header Authorization
    delete axiosInstance.defaults.headers.common['Authorization']
    
    // Rediriger vers login
    window.location.href = '/login'
  },
  
  // Configuration après login
  setupAfterLogin(token, user, remember = false) {
    if (remember) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
    }
    
    // Configurer axios pour les requêtes futures
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
  
  // Vérifier le token avec le backend
  async verifyToken() {
    try {
      const token = getToken()
      if (!token) return false
      
      const response = await axiosInstance.get('/api/auth/verify')
      return response.data.success
    } catch (error) {
      this.logout()
      return false
    }
  }
}

// Export par défaut l'instance axios configurée
export default axiosInstance

// Export des fonctions d'authentification
export { auth }
<template>
  <div class="auth-login-container">
    <img src="./images/TEXSTYLE-WALL-2017-scaled.jpg" alt="login image" class="auth-login__bg-img" />
    
    <form @submit.prevent="handleLogin" class="auth-login-form">
      <img src="./images/logo.jpg" class="auth-login__logo" alt="Logo">
      
      <h1 class="auth-login__title">Se connecter</h1>
      
      <div v-if="errorMessage" class="auth-login__error">
        {{ errorMessage }}
      </div>
      
      <div class="auth-login__fields">
        <div class="auth-login__field">
          <i class="fas fa-user auth-login__field-icon"></i>
          <div class="auth-login__field-input-wrapper">
            <input
              type="text"
              v-model="credentials.username"
              required
              class="auth-login__input"
              id="auth-username-input"
              :disabled="loading"
            />
            <label for="auth-username-input" class="auth-login__input-label">Nom d'utilisateur ou Email</label>
          </div>
        </div>
        
        <div class="auth-login__field">
          <i class="fas fa-lock auth-login__field-icon"></i>
          <div class="auth-login__field-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="credentials.password"
              required
              class="auth-login__input"
              id="auth-password-input"
              :disabled="loading"
            />
            <label for="auth-password-input" class="auth-login__input-label">Mot de passe</label>
            <i 
              :class="showPassword ? 'fas fa-eye auth-login__toggle-password' : 'fas fa-eye-slash auth-login__toggle-password'" 
              @click="togglePasswordVisibility"
            ></i>
          </div>
        </div>
      </div>
      
      <div class="auth-login__options">
        <div class="auth-login__remember">
          <input 
            type="checkbox" 
            class="auth-login__checkbox" 
            v-model="rememberMe"
            :disabled="loading"
            id="auth-remember-me"
          />
          <label for="auth-remember-me" class="auth-login__checkbox-label">Souviens toi de moi</label>
        </div>
        <a href="#" class="auth-login__forgot-password">Mot de passe oublié?</a>
      </div>
      
      <button 
        type="submit" 
        class="auth-login__submit-btn"
        :disabled="loading"
        :class="{ 'auth-login__submit-btn--loading': loading }"
      >
        <span v-if="loading">Connexion en cours...</span>
        <span v-else>Se connecter</span>
      </button>
      
      <p class="auth-login__footer">
        Vous n'avez pas de compte? <a href="#" class="auth-login__footer-link">Contactez l'admin</a>
      </p>
    </form>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      rememberMe: false,
      loading: false,
      errorMessage: '',
      showPassword: false
    };
  },
  mounted() {
    this.initFloatingLabels();
    
    // Vérifier si déjà connecté
    const token = localStorage.getItem('token');
    if (token) {
      this.verifyToken(token);
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await axios.post(
          'https://tsg-back.onrender.com/api/auth/login',
          this.credentials
        );
        
        if (response.data.success) {
          const { token, user } = response.data;
          
          // Stocker le token
          if (this.rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
          }
          
          // Configurer axios pour les requêtes futures
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Rediriger vers le dashboard
          this.$router.push('/admin/overview');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = error.response?.data?.message || 'Erreur de connexion';
      } finally {
        this.loading = false;
      }
    },
    
    async verifyToken(token) {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          this.$router.push('/dashboard');
        }
      } catch (error) {
        // Token invalide, nettoyer le stockage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    },
    
    togglePasswordVisibility() {
      const passwordInput = document.getElementById('login-pass');
      const eyeIcon = document.getElementById('login-eye');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
      } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
      }
    },
    
    initFloatingLabels() {
      const inputs = document.querySelectorAll('.login__input');
      
      inputs.forEach(input => {
        // Initial state
        if (input.value) {
          const label = input.nextElementSibling;
          if (label) {
            label.style.top = '-12px';
            label.style.fontSize = '0.813rem';
          }
        }
        
        // Add event listeners
        input.addEventListener('input', function() {
          const label = this.nextElementSibling;
          if (label) {
            if (this.value.trim() !== '') {
              label.style.top = '-12px';
              label.style.fontSize = '0.813rem';
            } else if (document.activeElement !== this) {
              label.style.top = '13px';
              label.style.fontSize = '1rem';
            }
          }
        });
        
        input.addEventListener('blur', function() {
          const label = this.nextElementSibling;
          if (label) {
            if (this.value.trim() === '') {
              label.style.top = '13px';
              label.style.fontSize = '1rem';
            }
          }
        });
        
        input.addEventListener('focus', function() {
          const label = this.nextElementSibling;
          if (label && this.value.trim() === '') {
            label.style.top = '-12px';
            label.style.fontSize = '0.813rem';
          }
        });
      });
    }
  }
};
</script>

<style scoped>
.auth-login-container * {
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

.auth-login-container {
  position: relative;
  height: 100vh;
  display: grid;
  align-items: center;
}

.auth-login__bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
}

.auth-login-form {
  position: relative;
  background-color: hsla(0, 0%, 10%, 0.1);
  border: 2px solid hsl(0, 0%, 100%);
  margin-inline: 1.5rem;
  padding: 2.5rem 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(8px);
  z-index: 1;
}

.auth-login__logo {
  width: 41%;
  height: auto;
  margin: auto;
  display: flex;
}

.auth-login__title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: hsl(0, 0%, 100%);
}

.auth-login__error {
  background-color: hsl(0, 100%, 50%, 0.2);
  color: hsl(0, 100%, 90%);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid hsl(0, 100%, 70%, 0.3);
}

.auth-login__fields {
  display: grid;
  row-gap: 1.75rem;
  margin-bottom: 1.5rem;
}

.auth-login__field {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  column-gap: 0.75rem;
  border-bottom: 2px solid hsl(0, 0%, 100%);
}

.auth-login__field-icon {
  font-size: 1.25rem;
  color: hsl(0, 0%, 100%);
}

.auth-login__field-input-wrapper {
  position: relative;
}

.auth-login__input {
  width: 100%;
  padding-block: 0.8rem;
  background: none;
  color: hsl(0, 0%, 100%);
  position: relative;
  z-index: 1;
  font-size: 1rem;
  border: none;
  outline: none;
}

.auth-login__input-label {
  position: absolute;
  left: 0;
  top: 13px;
  font-weight: 500;
  color: hsl(0, 0%, 100%);
  transition: top 0.3s, font-size 0.3s;
  pointer-events: none;
  font-size: 1rem;
}

.auth-login__toggle-password {
  position: absolute;
  right: 0;
  top: 18px;
  z-index: 10;
  cursor: pointer;
  color: hsl(0, 0%, 100%);
  font-size: 1.25rem;
}

.auth-login__field:nth-child(2) .auth-login__input {
  padding-right: 1.8rem;
}

.auth-login__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.auth-login__remember {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
}

.auth-login__checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.auth-login__checkbox-label,
.auth-login__forgot-password,
.auth-login__footer {
  font-size: 0.813rem;
  color: hsl(0, 0%, 100%);
}

.auth-login__forgot-password {
  color: hsl(0, 0%, 100%);
}

.auth-login__forgot-password:hover {
  text-decoration: underline;
}

.auth-login__submit-btn {
  width: 100%;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: hsl(0, 0%, 100%);
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
  border: none;
  font-size: 1rem;
  color: hsl(0, 0%, 10%);
  transition: background-color 0.3s;
}

.auth-login__submit-btn:hover:not(:disabled) {
  background-color: hsl(0, 0%, 90%);
}

.auth-login__submit-btn:disabled,
.auth-login__submit-btn--loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-login__footer {
  text-align: center;
}

.auth-login__footer-link {
  color: hsl(0, 0%, 100%);
  font-weight: 500;
}

.auth-login__footer-link:hover {
  text-decoration: underline;
}

.auth-login__input:focus + .auth-login__input-label,
.auth-login__input:not(:placeholder-shown) + .auth-login__input-label {
  top: -12px;
  font-size: 0.813rem;
}

@media screen and (min-width: 576px) {
  .auth-login-container {
    justify-content: center;
  }
  
  .auth-login-form {
    width: 432px;
    padding: 4rem 3rem 3.5rem;
    border-radius: 1.5rem;
    margin-inline: auto;
  }
  
  .auth-login__title {
    font-size: 2rem;
  }
}
</style>
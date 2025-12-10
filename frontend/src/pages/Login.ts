 
import { t } from "../languages/translation"

export default function Login(): string {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <div class="auth-header">
            <h1 class="auth-title">${t('auth.login.title')}</h1>
            <p class="auth-subtitle">${t('auth.login.subtitle')}</p>
          </div>
          
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="email" class="form-label">${t('auth.login.email')}</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                placeholder="${t('auth.signup.emailPlaceholder')}"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">${t('auth.login.password')}</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                placeholder="${t('auth.signup.passwordPlaceholder')}"
                required
              />
            </div>
            
            <div class="form-options">
              <a href="#" class="forgot-password">${t('auth.login.forgotPassword')}</a>
            </div>
            
            <button type="submit" class="auth-button primary" id="login-btn">
              <span class="button-text">${t('auth.login.submitButton')}</span>
              <div class="button-loader" style="display: none;">
                <div class="loader-spinner"></div>
              </div>
            </button>
            
            <div class="auth-divider">
              <span>${t('auth.signup.or')}</span>
            </div>
            
            <div class="social-login">
              <button type="button" class="social-button google" id="google-login-btn">
                <img src="/public/google-logo.svg" alt="Google" class="social-icon" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;" />
                ${t('auth.login.google')}
              </button>
            </div>
            
            <div class="auth-footer">
              <p>${t('auth.login.noAccount')} <a href="/signup" data-link class="auth-link">${t('auth.login.signupLink')}</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

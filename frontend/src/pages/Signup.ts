 
import { t } from "../languages/translation"

export default function Signup(): string {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <div class="auth-header">
            <h1 class="auth-title">${t('auth.signup.title')}</h1>
            <p class="auth-subtitle">${t('auth.signup.subtitle')}</p>
          </div>
          
          <form class="auth-form" id="signup-form">
            <div class="form-group">
              <label for="username" class="form-label">${t('auth.signup.username')}</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                class="form-input" 
                placeholder="${t('auth.signup.usernamePlaceholder')}"
                required
                minlength="3"
                maxlength="20"
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">${t('auth.signup.email')}</label>
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
              <label for="password" class="form-label">${t('auth.signup.password')}</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                placeholder="${t('auth.signup.passwordPlaceholder')}"
                required
                minlength="8"
              />
            </div>
            
            <div class="form-group">
              <label for="confirm-password" class="form-label">${t('auth.signup.confirmPassword')}</label>
              <input 
                type="password" 
                id="confirm-password" 
                name="confirm-password" 
                class="form-input" 
                placeholder="${t('auth.signup.confirmPasswordPlaceholder')}"
                required
              />
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" id="terms" name="terms">
                <span class="checkmark"></span>
                ${t('auth.termsAndServices.agree')} <a href="#" class="terms-link" id="terms-link">${t('auth.termsAndServices.terms')}</a> ${t('auth.termsAndServices.and')} <a href="#" class="terms-link" id="privacy-link">${t('auth.termsAndServices.privacy')}</a>
              </label>
            </div>
            
            <button type="submit" class="auth-button primary" id="signup-btn">
              <span class="button-text">${t('auth.signup.submitButton')}</span>
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
          </form>

          <!-- Modal para Terms of Service -->
          <div id="terms-modal" class="modal" style="display: none;">
            <div class="modal-content">
              <span class="close" id="terms-close">&times;</span>
              <h2>${t('auth.termsAndServices.termsText.title')}</h2>
              <div class="modal-text">
                <p><strong>${t('auth.termsAndServices.termsText.one.title')}</strong></p>
                <p>${t('auth.termsAndServices.termsText.one.content')}</p>

                <p><strong>${t('auth.termsAndServices.termsText.two.title')}</strong></p>
                <p>${t('auth.termsAndServices.termsText.two.content')}</p>

                <p><strong>${t('auth.termsAndServices.termsText.three.title')}</strong></p>
                <p>${t('auth.termsAndServices.termsText.three.content')}</p>

                <p><strong>${t('auth.termsAndServices.termsText.four.title')}</strong></p>
                <p>${t('auth.termsAndServices.termsText.four.content')}</p>

                <p><strong>${t('auth.termsAndServices.termsText.five.title')}</strong></p>
                <p>${t('auth.termsAndServices.termsText.five.content')}</p>
              </div>
            </div>
          </div>

          <!-- Modal para Privacy Policy -->
          <div id="privacy-modal" class="modal" style="display: none;">
            <div class="modal-content">
              <span class="close" id="privacy-close">&times;</span>
              <h2>${t('auth.termsAndServices.policyText.title')}</h2>
              <div class="modal-text">
                <p><strong>${t('auth.termsAndServices.policyText.one.title')}</strong></p>
                <p>${t('auth.termsAndServices.policyText.one.content')}</p>

                <p><strong>${t('auth.termsAndServices.policyText.two.title')}</strong></p>
                <p>${t('auth.termsAndServices.policyText.two.content')}</p>

                <p><strong>${t('auth.termsAndServices.policyText.three.title')}</strong></p>
                <p>${t('auth.termsAndServices.policyText.three.content')}</p>

                <p><strong>${t('auth.termsAndServices.policyText.four.title')}</strong></p>
                <p>${t('auth.termsAndServices.policyText.four.content')}</p>

                <p><strong>${t('auth.termsAndServices.policyText.five.title')}</strong></p>
                <p>${t('auth.termsAndServices.policyText.five.content')}</p>
              </div>
            </div>
          </div>
          
          <div class="auth-footer">
            <p>${t('auth.signup.hasAccount')} <a href="/login" data-link class="auth-link">${t('auth.signup.loginLink')}</a></p>
          </div>
        </div>
      </div>
    </div>
  `
}

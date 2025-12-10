 

import { t } from '../languages/translation';

export default function ForgotPassword(): string {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <!-- ✅ PASO 1: Solicitar email -->
          <div id="forgot-password-step" class="forgot-password-step">
            <div class="auth-header">
              <h1>${t('forgotPassword.title')}</h1>
              <p>${t('forgotPassword.subTitle')}</p>
            </div>

            <form class="auth-form" id="forgot-password-form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input" 
                  placeholder=${t('forgotPassword.emailPlaceholder')} 
                  required
                  autocomplete="email"
                >
              </div>

              <button type="submit" class="auth-button primary" id="forgot-password-btn">
                <span class="button-text">${t('forgotPassword.sendResetTokenButton')}</span>
                <div class="button-loader"></div>
              </button>
            </form>

            <div class="auth-footer">
              <p>${t('forgotPassword.rememberPassword')} <a href="/login" data-link class="auth-link">${t('forgotPassword.backToLogin')}</a></p>
            </div>
          </div>

          <!-- ✅ PASO 2: Ingresar token y nueva contraseña -->
          <div id="reset-password-step" class="forgot-password-step" style="display: none;">
            <div class="auth-header">
              <h1>${t('forgotPassword.resetPassword.title')}</h1>
              <p>${t('forgotPassword.resetPassword.subtitle')}</p>
            </div>

            <form class="auth-form" id="reset-password-form">
              <div class="form-group">
                <label for="token" class="form-label">${t('forgotPassword.resetPassword.tokenLabel')}</label>
                <input 
                  type="text" 
                  id="token" 
                  name="token" 
                  class="form-input" 
                  placeholder=${t('forgotPassword.resetPassword.enterToken')} 
                  required
                  autocomplete="off"
                >
              </div>

              <div class="form-group">
                <label for="password" class="form-label">${t('forgotPassword.newPassword.title')}</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-input" 
                  placeholder=${t('forgotPassword.newPassword.placeholder')} 
                  required
                  autocomplete="new-password"
                >
              </div>

              <div class="form-group">
                <label for="confirm-password" class="form-label">${t('forgotPassword.newPassword.confirm')}</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirm-password" 
                  class="form-input" 
                  placeholder=${t('forgotPassword.newPassword.confirmPlaceholder')} 
                  required
                  autocomplete="new-password"
                >
              </div>

              <button type="submit" class="auth-button primary" id="reset-password-btn">
                <span class="button-text">${t('forgotPassword.resetPassword.button')}</span>
                <div class="button-loader"></div>
              </button>
            </form>

            <div class="auth-footer">
              <p>${t('forgotPassword.didntReceive')}<a href="#" id="back-to-email-btn" class="auth-link">${t('forgotPassword.tryAgain')}</a></p>
              <p>${t('forgotPassword.rememberPassword')} <a href="/login" data-link class="auth-link">${t('forgotPassword.backToLogin')}</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

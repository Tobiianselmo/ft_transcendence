 
import { t } from '../languages/translation'
export default function TwoFA(): string {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <div class="auth-header">
            <h1 class="auth-title">${t('doubleFactor.title')}</h1>
            <p class="auth-subtitle">${t('doubleFactor.enter')}</p>
          </div>
          
          <form class="auth-form" id="twofa-form">
            <div class="form-group">
              <label for="code" class="form-label">${t('doubleFactor.verification')}</label>
              <div class="twofa-code-container">
                <input 
                  type="text" 
                  id="code" 
                  name="code" 
                  class="form-input" 
                  placeholder="000000"
                  required
                  maxlength="6"
                  pattern="[0-9]{6}"
                  autocomplete="one-time-code"
                />
              </div>
            </div>
            
            <button type="submit" class="auth-button twofa-verify" id="twofa-btn">
              <span class="button-text">${t('doubleFactor.verify')}</span>
              <div class="button-loader" style="display: none;">
                <div class="loader-spinner"></div>
              </div>
            </button>
            
            <div class="auth-footer">
              <p>${t('doubleFactor.didntReceive')} <a href="#" class="auth-link resend-code" id="resend-code">${t('doubleFactor.resendCode')}</a></p>
              <p><a href="/login" data-link class="auth-link">${t('doubleFactor.backLogin')}</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

 
import { t } from "../languages/translation"

export default function VerifyRegister(): string {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <div class="auth-header">
            <h1 class="auth-title">${t('auth.verifyYourAccount.title')}</h1>
            <p class="auth-subtitle">${t('auth.verifyYourAccount.subtitle')}</p>
          </div>
          
          <form class="auth-form" id="verify-register-form">
            <div class="form-group">
              <label for="verification-code" class="form-label">${t('auth.verifyYourAccount.verificationCode')}</label>
              <div class="twofa-code-container">
                <input 
                  type="text" 
                  id="verification-code" 
                  name="verification-code" 
                  class="form-input" 
                  placeholder="000000"
                  required
                  maxlength="6"
                  pattern="[0-9]{6}"
                  autocomplete="one-time-code"
                />
              </div>
            </div>
            
            <button type="submit" class="auth-button twofa-verify" id="verify-register-btn">
              <span class="button-text">${t('auth.verifyYourAccount.verifyButton')}</span>
              <div class="button-loader" style="display: none;">
                <div class="loader-spinner"></div>
              </div>
            </button>
            
            <div class="auth-footer">
              <p>${t('auth.verifyYourAccount.didntReceiveCode')} <a href="#" class="auth-link resend-code" id="resend-verification-code">${t('auth.verifyYourAccount.resendCode')}</a></p>
              <p><a href="/signup" data-link class="auth-link">${t('auth.verifyYourAccount.backToSignup')}</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

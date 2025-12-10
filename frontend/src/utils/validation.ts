 
 
import { t } from '../languages/translation'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

 
const VALIDATION_REGEX = {
   
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
   
  validEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
   
  validDisplayName: /^[a-zA-Z0-9_]{3,}$/,
   
  twoFACode: /^\d{6}$/,
  teamName: /^[A-Za-z]{1,7}$/,
} as const

 
const isValidEmail = (email: string): boolean => VALIDATION_REGEX.validEmail.test(email)
const isStrongerPassword = (password: string): boolean => VALIDATION_REGEX.strongPassword.test(password)
const isValidDisplayName = (name: string): boolean => VALIDATION_REGEX.validDisplayName.test(name)

 
export const validators = {
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: "Email is required" }
    if (!isValidEmail(value)) {
      return { isValid: false, error: "Invalid email format" }
    }
    return { isValid: true }
  },

  password: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: `${t('profile.accountSettings.messages.passRequired')}` }
    if (value.length < 8) {
      return { isValid: false, error: `${t('profile.accountSettings.messages.passLength')}` }
    }
    if (!isStrongerPassword(value)) {
      return {
        isValid: false,
        error: `${t('profile.accountSettings.messages.passCharacters')}`,
      }
    }
    return { isValid: true }
  },

  displayName: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: `${t('profile.accountSettings.messages.userRequired')}` }
    if (value.length < 3) {
      return { isValid: false, error: `${t('profile.accountSettings.messages.userLength')}` }
    }
    if (!isValidDisplayName(value)) {
      return {
        isValid: false,
        error: `${t('profile.accountSettings.messages.userCharacters')}`,
      }
    }
    return { isValid: true }
  },

  confirmPassword: (value: string, originalPassword: string): ValidationResult => {
    if (!value) return { isValid: false, error: `${t('profile.accountSettings.messages.confirmPass')}` }
    if (value !== originalPassword) {
      return { isValid: false, error: `${t('profile.accountSettings.messages.passMismatch')}` }
    }
    return { isValid: true }
  },

  twoFACode: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: `${t('profile.accountSettings.messages.verificationCodeRequired')}` }
    if (value.length !== 6) return { isValid: false, error: `${t('profile.accountSettings.messages.verificationCodeLength')}` }
    if (!VALIDATION_REGEX.twoFACode.test(value)) {
      return { isValid: false, error: `${t('profile.accountSettings.messages.verificationCodeNumbers')}` }
    }
    return { isValid: true }
  },

  teamName: (value: string): ValidationResult => {
    if (!value) return { isValid: false }  
    if (!VALIDATION_REGEX.teamName.test(value)) {
      return {
        isValid: false,
        error: `${t('profile.teamSettings.messages.teamName')}`,
      }
    }
    return { isValid: true }
  },
}

 
export function validateFormData(
  formData: FormData,
  validationRules: Record<string, (value: string, ...args: any[]) => ValidationResult>,
): ValidationResult {
  for (const [field, validator] of Object.entries(validationRules)) {
    const value = formData.get(field) as string
    const result = validator(value)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}

 
export function validateField(
  fieldName: string,
  value: string,
  validatorName: keyof typeof validators,
  ...args: any[]
): ValidationResult {
  const validator = validators[validatorName] as any
  return validator(value, ...args)
}

 
export { isValidEmail, isStrongerPassword, isValidDisplayName }

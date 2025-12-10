 
export function handleTermsModal(): void {
  const termsModal = document.getElementById("terms-modal")
  if (termsModal) {
    termsModal.style.display = "block"
  }
}

export function handlePrivacyModal(): void {
  const privacyModal = document.getElementById("privacy-modal")
  if (privacyModal) {
    privacyModal.style.display = "block"
  }
}

export function handleCloseTermsModal(): void {
  const termsModal = document.getElementById("terms-modal")
  if (termsModal) {
    termsModal.style.display = "none"
  }
}

export function handleClosePrivacyModal(): void {
  const privacyModal = document.getElementById("privacy-modal")
  if (privacyModal) {
    privacyModal.style.display = "none"
  }
}

export function handleModalBackgroundClick(target: HTMLElement): void {
  if (target.id === "terms-modal") {
    target.style.display = "none"
  }

  if (target.id === "privacy-modal") {
    target.style.display = "none"
  }
}

export function handleEscapeKeyForModals(): void {
  const termsModal = document.getElementById("terms-modal")
  const privacyModal = document.getElementById("privacy-modal")

  if (termsModal && termsModal.style.display === "block") {
    termsModal.style.display = "none"
  }

  if (privacyModal && privacyModal.style.display === "block") {
    privacyModal.style.display = "none"
  }
}

'use client'

export function logout() {
  // Clear session data
  localStorage.removeItem('token') // or sessionStorage.removeItem('token')
  sessionStorage.clear()

  // Remove cookie if used
  document.cookie = 'token=; Max-Age=0; path=/;'

  // Redirect to login page
  window.location.href = '/login'
}

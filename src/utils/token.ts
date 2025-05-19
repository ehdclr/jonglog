export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth-storage') 
    ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.accessToken || null
    : null
}

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth-storage')
}
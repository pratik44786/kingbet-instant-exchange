export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  return JSON.parse(localStorage.getItem('authUser') || 'null');
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('userIdLogin');
  window.location.href = '/';
}

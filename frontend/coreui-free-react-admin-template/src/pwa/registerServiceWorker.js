const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const shouldRegister = !isLocalhost || window.location.search.includes('pwa=1')

  if (!shouldRegister) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {})
  })
}

export default registerServiceWorker

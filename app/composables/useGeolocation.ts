export const useGeolocation = () => {
  const coords = useState<{ lat: number; lng: number } | null>('jc:geo', () => null)
  const permissionDenied = useState('jc:geo-denied', () => false)
  const error = useState<string | null>('jc:geo-error', () => null)

  const config = useRuntimeConfig()
  const fallback = {
    lat: Number(config.public.cityFallbackLat),
    lng: Number(config.public.cityFallbackLng),
  }

  function locate(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        error.value = 'Geolocalización no soportada'
        permissionDenied.value = true
        resolve(fallback)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          permissionDenied.value = false
          resolve(coords.value)
        },
        () => {
          permissionDenied.value = true
          error.value = 'Permiso denegado; usando ciudad por defecto'
          coords.value = fallback
          resolve(fallback)
        },
        { enableHighAccuracy: false, timeout: 8000 },
      )
    })
  }

  return { coords, permissionDenied, error, locate, fallback }
}

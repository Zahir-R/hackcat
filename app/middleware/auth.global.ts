export default defineNuxtRouteMiddleware(() => {
  const { restore } = useAuth()
  restore()
})

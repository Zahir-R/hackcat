export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, restore } = useAuth()
  if (import.meta.client && !isLoggedIn.value) {
    void restore()
  }
})

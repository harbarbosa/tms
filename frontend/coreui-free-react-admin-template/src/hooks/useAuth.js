import { useDispatch, useSelector } from 'react-redux'
import authService from '../services/auth/authService'

const useAuth = () => {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)

  const bootstrapSession = async () => {
    try {
      const session = await authService.me()
      dispatch({ type: 'auth/bootstrapSuccess', payload: session })
      return session
    } catch (error) {
      authService.clearLocalSession()
      dispatch({ type: 'auth/logout' })
      return null
    } finally {
      dispatch({ type: 'auth/bootstrapComplete' })
    }
  }

  const login = async (credentials) => {
    const session = await authService.login(credentials)
    dispatch({ type: 'auth/loginSuccess', payload: session })
    return session
  }

  const logout = async () => {
    await authService.logout()
    dispatch({ type: 'auth/logout' })
  }

  return {
    ...authState,
    login,
    logout,
    bootstrapSession,
  }
}

export default useAuth

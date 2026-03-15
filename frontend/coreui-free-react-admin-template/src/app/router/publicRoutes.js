import React from 'react'

const LoginPage = React.lazy(() => import('../../features/auth/pages/LoginPage'))
const Register = React.lazy(() => import('../../views/pages/register/Register'))
const Page403 = React.lazy(() => import('../../views/pages/page403/Page403'))
const Page404 = React.lazy(() => import('../../views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('../../views/pages/page500/Page500'))

const publicRoutes = [
  { path: '/login', name: 'Login', element: LoginPage },
  { path: '/register', name: 'Register', element: Register },
  { path: '/403', name: 'Page 403', element: Page403 },
  { path: '/404', name: 'Page 404', element: Page404 },
  { path: '/500', name: 'Page 500', element: Page500 },
]

export default publicRoutes

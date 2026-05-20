import { Outlet } from 'react-router-dom'
import PageWrapper from './PageWrapper'
import ToastContainer from '../ui/ToastContainer'

const Layout = () => {
  return (
    <PageWrapper>
      <Outlet />
      <ToastContainer />
    </PageWrapper>
  )
}

export default Layout

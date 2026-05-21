import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAppStore } from '../../store/appStore'

const PageWrapper = ({ children }) => {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const closeMobileMenu = useAppStore((state) => state.closeMobileMenu)
  const fetchPlatformSettings = useAppStore((state) => state.fetchPlatformSettings)

  useEffect(() => {
    fetchPlatformSettings()
  }, [fetchPlatformSettings])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) closeMobileMenu()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [closeMobileMenu])

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-brand-surface font-sans text-brand-navy">
      <Sidebar />
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ml-0 lg:ml-64
          ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <Topbar />
        <main className="mt-16 sm:mt-20 p-4 sm:p-6 lg:p-8 min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] overflow-x-hidden overflow-y-auto bg-brand-surface">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PageWrapper

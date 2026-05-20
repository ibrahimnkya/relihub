import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAppStore } from '../../store/appStore'

const PageWrapper = ({ children }) => {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const fetchPlatformSettings = useAppStore((state) => state.fetchPlatformSettings)

  useEffect(() => {
    fetchPlatformSettings()
  }, [])

  return (
    <div className="flex min-h-screen bg-brand-surface font-sans text-brand-navy">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${collapsed ? 'ml-20' : 'ml-64'} overflow-hidden`}>
        <Topbar />
        <main className="mt-20 p-8 min-h-[calc(100vh-80px)] overflow-y-auto bg-brand-surface">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PageWrapper

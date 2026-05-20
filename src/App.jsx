import AppRouter from './router/AppRouter'
import InactivityLock from './components/shared/InactivityLock'

function App() {
  return (
    <div className="min-h-screen bg-brand-surface font-sans text-brand-navy">
      <InactivityLock>
        <AppRouter />
      </InactivityLock>
    </div>
  )
}

export default App

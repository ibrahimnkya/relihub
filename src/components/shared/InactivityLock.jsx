import { useState, useEffect, useRef } from 'react'
import { Lock, ArrowRight, LogOut, ShieldAlert, Fingerprint, ShieldCheck, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../store/toastStore'
import { authService } from '../../services/authService'

const INACTIVITY_LIMIT = 5 * 60 * 1000 // 5 minutes in milliseconds

const InactivityLock = ({ children }) => {
  const { isLocked, lock, unlock, user, logout, isAuthenticated } = useAuthStore()
  const { addToast } = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const timerRef = useRef(null)

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isLocked && isAuthenticated) {
      timerRef.current = setTimeout(() => {
        lock()
        addToast({ 
          title: 'Security Alert', 
          message: 'Session locked for protection.', 
          type: 'info' 
        })
      }, INACTIVITY_LIMIT)
    }
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handleActivity = () => resetTimer()

    if (isAuthenticated && !isLocked) {
      events.forEach(event => document.addEventListener(event, handleActivity))
      resetTimer()
    }

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, isLocked])

  const handleUnlock = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(false)

    try {
      // Validate using the logged-in user's email/username and the provided password
      const identifier = user?.email || user?.username;
      if (!identifier) {
        throw new Error('User not identified');
      }

      const response = await authService.login(identifier, password);
      
      // Check for explicit ERROR status in the response body (crucial for local/PHP/mock backends that return 200 OK with error bodies)
      if (response?.data?.status === 'ERROR') {
        throw new Error(response.data.errorMessage || 'Invalid credentials');
      }
      
      unlock()
      setPassword('')
      addToast({ title: 'Welcome Back', message: 'Your session has been unlocked.', type: 'success' })
    } catch (err) {
      setError(true)
      addToast({ title: 'Incorrect Password', message: 'Please try again.', type: 'danger' })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      {/* Background Content with Dynamic Blur and Inert Protection */}
      <div 
        className={`transition-all duration-1000 ${isLocked ? 'blur-[24px] grayscale-[40%] scale-[0.97] pointer-events-none select-none' : 'blur-0 grayscale-0 scale-100'}`}
        inert={isLocked ? 'true' : undefined}
      >
        {children}
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Backdrop Tint - Light Glassmorphism */}
          <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-xl backdrop-saturate-150"></div>
          
          {/* Ambient Glows */}
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] bg-brand-blue/5 blur-[120px] rounded-full animate-soft-pulse-blue pointer-events-none"></div>
          <div className="absolute bottom-1/3 right-1/4 h-[500px] w-[500px] bg-slate-300/10 blur-[120px] rounded-full animate-soft-pulse-navy pointer-events-none"></div>

          {/* White Premium Lock Card */}
          <div className="w-full max-w-[440px] bg-white rounded-[12px] p-10 shadow-[0_25px_60px_rgba(15,23,42,0.08)] relative overflow-hidden border border-slate-200">
            {/* Top Security Line with Crimson gradient */}
            <div className="absolute top-0 left-0 right-0 h-[5px] bg-brand-blue shadow-[0_1px_5px_rgba(164,23,32,0.2)]"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              {/* Security Icon HUD with soft premium pulse rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 h-28 w-28 -m-3 rounded-full bg-brand-blue/5 border border-brand-blue/10 animate-pulse-ring-premium pointer-events-none"></div>
                <div className="absolute inset-0 h-24 w-24 -m-1 rounded-full bg-brand-blue/5 animate-pulse-ring-premium delay-1000 pointer-events-none"></div>
                
                <div className="h-20 w-20 bg-slate-50 border border-slate-200/80 rounded-[12px] flex items-center justify-center text-brand-blue shadow-inner relative z-10 animate-float-premium">
                  <Fingerprint size={40} className="drop-shadow-[0_4px_10px_rgba(164,23,32,0.15)] text-brand-blue" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-brand-blue rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                    <Lock size={10} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <h2 className="text-xl font-black text-brand-navy tracking-tight leading-tight uppercase">Session Paused</h2>
                <p className="text-xs text-slate-500 font-bold tracking-tight">
                  Your active workspace was temporarily locked to protect sensitive operations and telemetry data during your absence.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-ping"></span>
                  <p className="text-[9px] text-brand-blue font-black uppercase tracking-[0.2em]">
                    Ready When You Are
                  </p>
                </div>
              </div>

              {/* User Identity Box */}
              <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[12px] flex items-center gap-4 transition-all hover:bg-slate-100/50">
                <div className="h-10 w-10 bg-white border border-slate-200 rounded-[10px] flex items-center justify-center text-brand-blue shadow-sm">
                  <ShieldCheck size={20} className="text-brand-blue" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-black text-brand-navy uppercase tracking-wider truncate">{user?.name || user?.full_name || 'System Administrator'}</p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight truncate">
                    {user?.email || user?.username || 'admin@relihub.com'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUnlock} className="w-full space-y-5">
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="Enter password to resume"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className={`w-full bg-slate-50 border ${error ? 'border-brand-red ring-4 ring-brand-red/10 animate-shake' : 'border-slate-200 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10'} rounded-[12px] py-4 px-4 text-xs font-bold text-center text-brand-navy placeholder:text-slate-300 focus:outline-none transition-all`}
                  />
                  {error && (
                    <div className="absolute -bottom-5.5 left-0 right-0 flex items-center justify-center gap-1.5 text-brand-red animate-shake">
                      <ShieldAlert size={11} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Incorrect password</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isVerifying || !password}
                  className="w-full group relative h-12 bg-brand-blue hover:bg-brand-hover text-white rounded-[12px] font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all transform active:scale-[0.98] shadow-lg shadow-brand-blue/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isVerifying ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      RESUME WORKSPACE <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              <button 
                onClick={() => logout()}
                className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-brand-red transition-all pt-2"
              >
                <LogOut size={12} /> Exit System Session
              </button>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(1deg); }
            }
            @keyframes pulse-ring {
              0%, 100% { transform: scale(0.95); opacity: 0.1; }
              50% { transform: scale(1.08); opacity: 0.25; }
            }
            @keyframes soft-pulse-blue {
              0%, 100% { opacity: 0.1; transform: scale(1) translate(0, 0); }
              50% { opacity: 0.2; transform: scale(1.05) translate(10px, -10px); }
            }
            @keyframes soft-pulse-navy {
              0%, 100% { opacity: 0.15; transform: scale(1) translate(0, 0); }
              50% { opacity: 0.25; transform: scale(1.03) translate(-10px, 10px); }
            }
            .animate-float-premium {
              animation: float 6s ease-in-out infinite;
            }
            .animate-pulse-ring-premium {
              animation: pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .animate-soft-pulse-blue {
              animation: soft-pulse-blue 10s ease-in-out infinite;
            }
            .animate-soft-pulse-navy {
              animation: soft-pulse-navy 10s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default InactivityLock

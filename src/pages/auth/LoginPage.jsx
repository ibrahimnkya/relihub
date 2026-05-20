import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Fuel, 
  ShieldCheck, 
  ArrowUpRight, 
  Compass, 
  BarChart2 
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      
      // Check for explicit ERROR status in the response body
      if (response.data?.status === 'ERROR') {
        throw new Error(response.data.errorMessage || 'Invalid credentials')
      }

      const userData = response.data?.returnData?.user || response.data?.user
      const authToken = response.data?.returnData?.access_token || response.data?.returnData?.token || response.data?.token
      
      if (!userData || !authToken) {
        throw new Error('Authentication response malformed. Missing user or token.')
      }

      login(userData, authToken)

      // Role-based redirection: Admins go to their specific portal
      const roleString = (userData.role || (userData.roles && userData.roles[0]?.name) || '').toLowerCase()
      const isAdmin = roleString.includes('admin') || 
                      roleString.includes('super') ||
                      roleString.includes('technical') ||
                      roleString.includes('system')

      if (isAdmin && userData.company_id) {
        navigate('/admin/companies')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT PANE - Operational Teaser Panel (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#0b0f19] relative flex-col justify-between p-16 overflow-hidden">
        
        {/* Background Image of Locomotive with smooth hover zoom animation */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out hover:scale-[1.05]"
          style={{ backgroundImage: "url('/locomotive.png')" }}
        ></div>

        {/* Premium subtle overlays to ensure the locomotive train is vividly visible while text remains legible */}
        <div className="absolute inset-0 z-0 bg-slate-950/35"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>
        
        {/* Background Grids */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
        </div>

        {/* Top Header of Teaser */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#A41720]/20 border border-[#A41720]/30 flex items-center justify-center">
              <Activity size={16} className="text-[#A41720] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-[0.25em] text-[#A41720] uppercase leading-none block">Operations Gateway</span>
              <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Tanzania Railways Corporation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Console Active</span>
          </div>
        </div>

        {/* Center Mockup telemetry cards */}
        <div className="relative z-10 my-auto py-12 flex flex-col gap-6 max-w-lg">
          
          {/* Main Title Banner */}
          <div className="space-y-4 animate-scale-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#A41720]/10 border border-[#A41720]/20 text-[9px] font-black text-[#A41720] tracking-widest uppercase">
              <ShieldCheck size={10} />
              TRC Operational Security
            </div>
            <h2 className="text-4xl font-black text-white leading-none tracking-tight uppercase italic">
              Smart Fueling & <br />
              <span className="text-[#A41720] not-italic font-black">Fleet Management</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              ReliHub provides unified oversight of locomotive fueling sessions, fuel inventory levels across terminal depots, and real-time operations auditing.
            </p>
          </div>

          {/* Floating Glass Card A - Active Locomotives */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-[20px] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group hover:border-[#A41720]/30 transition-all duration-500 animate-fade-in-up">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-[#A41720]"></div>
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#A41720]">
                  <Fuel size={18} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Locomotive TRC-Y312</h4>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dar es Salaam Main Depot</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[7px] font-black text-emerald-400 tracking-wider uppercase">Fueling Completed</span>
              </div>
            </div>

            {/* Custom Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/[0.05]">
              <div>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Total Fuel Loaded</span>
                <span className="text-[12px] font-black text-white uppercase italic tracking-tighter">3,200 Litres</span>
              </div>
              <div>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Locomotive Route</span>
                <span className="text-[12px] font-black text-[#A41720] uppercase italic tracking-tighter">Dar - Morogoro</span>
              </div>
              <div>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Fuel Tank Level</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#A41720] rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[8px] font-black text-white">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Glass Card B - Operational overview */}
          <div className="bg-white/[0.01] backdrop-blur-sm rounded-[20px] border border-white/[0.05] p-5 shadow-xl relative overflow-hidden group hover:border-[#A41720]/20 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Compass size={14} className="text-[#A41720]" />
                <span className="text-[9px] font-black tracking-widest uppercase">Daily Operations Summary</span>
              </div>
              <BarChart2 size={14} className="text-slate-600" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <span className="text-[18px] font-black text-white block">12</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Active Fleet</span>
              </div>
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <span className="text-[18px] font-black text-[#A41720] block">45.2K L</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Dispensed</span>
              </div>
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <span className="text-[18px] font-black text-white block">8</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Completed Trips</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom branding of Teaser */}
        <div className="relative z-10 flex items-center justify-between text-slate-500 text-[9px] font-bold uppercase tracking-widest pt-4 border-t border-white/[0.05]">
          <span>© 2026 ReliHub. All rights reserved.</span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            Tanzania Railways Corporation Portal <ArrowUpRight size={10} />
          </span>
        </div>
      </div>

      {/* RIGHT PANE - Crisp Modern High-Contrast Light Sign In */}
      <div className="col-span-12 lg:col-span-5 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        
        {/* Decorative dynamic background lights (visible on mobile only to keep it aesthetic) */}
        <div className="absolute inset-0 pointer-events-none lg:hidden overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#A41720]/5 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#A41720]/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-[420px] flex flex-col relative z-10 animate-scale-in">
          
          {/* Logo container - proper aspect-ratio sizing and positioning */}
          <div className="mb-10 flex flex-col items-start w-full">
            <div className="mb-6 flex items-center h-20">
              <img 
                src="/logo.png" 
                alt="ReliHub Logo" 
                className="h-20 w-auto object-contain block" 
                style={{ maxWidth: '320px' }} 
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
              ReliHub <span className="text-[#A41720]">Gateway</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Enter your credentials to access the ReliHub core dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-[12px] py-4 pl-12 pr-4 text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#A41720]/10 focus:border-[#A41720] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="admin@trc.go.tz"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#A41720] transition-colors" size={18} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="text-[8px] font-black text-[#A41720] uppercase tracking-widest hover:underline transition-all">
                  Reset Password?
                </a>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-[12px] py-4 pl-12 pr-12 text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#A41720]/10 focus:border-[#A41720] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#A41720] transition-colors" size={18} />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#A41720] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 text-[#A41720] bg-red-50 p-4 rounded-[12px] border border-red-100/80 animate-shake shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#A41720] hover:bg-[#C0152A] text-white font-black py-4 rounded-[12px] transition-all transform active:scale-[0.98] shadow-lg shadow-[#A41720]/15 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] relative overflow-hidden group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-[#C0152A] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-10"></div>
                </>
              )}
            </button>
          </form>
          
          {/* Footer of form */}
          <div className="mt-12 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Authorized TRC Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

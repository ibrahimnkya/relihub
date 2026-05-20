import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  Search, 
  Database, 
  Send, 
  CheckCircle, 
  MessageSquare,
  Plus,
  ChevronRight,
  User,
  Bot,
  Activity,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Layout,
  History,
  Info
} from 'lucide-react'
import { iqService } from '../../services/iqService'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import { checkHasModule } from '../../utils/modules'
import AccessRestricted from '../../components/shared/AccessRestricted'
import Badge from '../../components/ui/Badge'

const ReliIQ = () => {
  const { addToast } = useToast()
  const { user } = useAuthStore()
  
  // State
  const [stats, setStats] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [currentProcess, setCurrentProcess] = useState(null)
  
  // Sessions
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const chatEndRef = useRef(null)

  const hasAccess = checkHasModule(user, 'ai')

  useEffect(() => {
    if (hasAccess) {
      loadInitialData()
    }
  }, [hasAccess])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentProcess])

  const loadInitialData = async () => {
    try {
      const [chatsRes, statsRes, anomaliesRes] = await Promise.all([
        iqService.getChats(),
        iqService.getStats(),
        iqService.getAnomalies()
      ])
      setChats(chatsRes.data)
      setStats(statsRes.data)
      setAnomalies(anomaliesRes.data || [])
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  const deleteChat = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this conversation?')) return
    try {
      await iqService.deleteChat(id)
      if (activeChatId === id) {
        setActiveChatId(null)
        setMessages([])
      }
      loadInitialData()
      addToast({ title: 'Success', message: 'Conversation removed.', type: 'info' })
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not remove conversation.', type: 'danger' })
    }
  }

  const selectChat = async (id) => {
    setActiveChatId(id)
    setAnalyzing(true)
    try {
      const res = await iqService.getChatMessages(id)
      setMessages(res.data.map(m => ({
        role: m.role,
        content: m.content,
        reasoning: m.reasoning,
        timestamp: m.created_at
      })))
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not load history.', type: 'danger' })
    } finally {
      setAnalyzing(false)
    }
  }

  const startNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setInputValue('')
  }

  const handleQuery = async (e) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || analyzing) return

    const userMessage = inputValue
    setInputValue('')
    
    let chatId = activeChatId
    if (!chatId) {
      try {
        const res = await iqService.createChat(userMessage.substring(0, 40) + '...')
        chatId = res.data.id
        setActiveChatId(chatId)
        loadInitialData()
      } catch (err) {
        console.error('Failed to start chat:', err)
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }])
    setAnalyzing(true)

    try {
      setCurrentProcess({ stage: 'DISCOVERY', label: 'Searching records...', icon: Search })
      const discoveryRes = await iqService.discovery(userMessage)
      await new Promise(r => setTimeout(r, 600))

      setCurrentProcess({ stage: 'EXTRACTION', label: 'Analyzing data...', icon: Database })
      const extractionRes = await iqService.extraction(discoveryRes.data.data_points)
      await new Promise(r => setTimeout(r, 600))

      setCurrentProcess({ stage: 'ANSWERS', label: 'Preparing answer...', icon: FileText })
      const knowledgeContext = discoveryRes.data.knowledge_context
      const answersRes = await iqService.answers(userMessage, extractionRes.data.context, knowledgeContext, chatId)
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: answersRes.data.answer, 
        reasoning: answersRes.data.reasoning_chain,
        timestamp: new Date().toISOString() 
      }])
    } catch (err) {
      addToast({ title: 'System Error', message: 'I encountered an issue while searching. Please try again.', type: 'danger' })
    } finally {
      setAnalyzing(false)
      setCurrentProcess(null)
    }
  }

  if (!hasAccess) return <AccessRestricted moduleName="Reli Assistant" moduleCode="RELI_IQ" />

  return (
    <div className="animate-fade-in relative flex flex-col h-[calc(100vh-140px)] -m-8 font-sans bg-brand-surface">
      <div className="flex flex-1 overflow-hidden">
        
        {/* Simplified Sidebar */}
        <div className="w-80 bg-white border-r border-brand-border flex flex-col flex-shrink-0 shadow-sm">
          <div className="p-8 border-b border-brand-border bg-brand-surface/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/10">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-brand-navy tracking-tight leading-none mb-1">Reli Assistant</h1>
                <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest opacity-60">Help & Insights</p>
              </div>
            </div>
            
            <button 
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-3 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold transition-all hover:bg-brand-hover shadow-md shadow-brand-blue/20"
            >
              <Plus size={16} />
              New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-brand-body uppercase tracking-widest opacity-40 mb-4 px-2">
              <History size={12} />
              <span>Recent Conversations</span>
            </div>
            {chats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`w-full group flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative ${
                  activeChatId === chat.id 
                  ? 'bg-brand-blue/5 text-brand-blue border border-brand-blue/10' 
                  : 'text-brand-body hover:bg-brand-surface border border-transparent'
                }`}
              >
                <MessageSquare size={16} className={activeChatId === chat.id ? 'text-brand-blue' : 'text-brand-body/40'} />
                <div className="text-left flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${activeChatId === chat.id ? 'text-brand-blue' : 'text-brand-navy'}`}>{chat.title}</p>
                  <p className="text-[10px] opacity-40">{new Date(chat.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => deleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:text-brand-red transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-brand-border bg-brand-surface/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-body font-medium">System Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-brand-green"></div>
                  <span className="font-bold text-brand-green">Ready</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-body font-medium">Data Sync</span>
                <span className="font-bold text-brand-navy">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Main Workspace */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Subtle Header */}
          <div className="px-10 py-5 border-b border-brand-border flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <Badge variant="success">Connected</Badge>
              <span className="text-xs text-brand-body font-medium">I have access to the latest company records.</span>
            </div>
            <div className="flex items-center gap-2 text-brand-body/40 hover:text-brand-blue cursor-help transition-colors">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">How it works</span>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
            {messages.length === 0 && !analyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="h-20 w-20 bg-brand-blue/5 rounded-3xl flex items-center justify-center border border-brand-blue/10">
                  <Bot size={40} className="text-brand-blue" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-brand-navy">Hello! How can I help you today?</h3>
                  <p className="text-sm text-brand-body font-medium opacity-60">
                    Ask me about tank levels, recent incidents, branch operations, or anything else in the system.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border shadow-sm ${
                    msg.role === 'user' ? 'bg-brand-navy text-white' : 'bg-white border-brand-border text-brand-blue'
                  }`}>
                    {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-navy text-white rounded-tr-none' 
                        : 'bg-brand-surface border border-brand-border text-brand-navy rounded-tl-none'
                    }`}>
                      {msg.content}
                      {msg.role === 'assistant' && msg.reasoning && (
                        <div className="mt-5 pt-5 border-t border-brand-border/60">
                          <p className="text-[10px] font-bold text-brand-body uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Search size={10} />
                            Sources & Analysis
                          </p>
                          <div className="space-y-2">
                            {msg.reasoning.map((step, si) => (
                              <div key={si} className="flex items-center gap-3 text-[11px] text-brand-body/60 italic">
                                <CheckCircle size={12} className="text-brand-green/40" />
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-brand-body/30 uppercase tracking-widest">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {analyzing && currentProcess && (
              <div className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                  <Activity size={18} className="animate-spin-slow" />
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">{currentProcess.label}</p>
                  <div className="h-1 w-32 bg-brand-blue/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue animate-progress-loading shadow-[0_0_10px_#3B82F6]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Simple Input Area */}
          <div className="p-8 border-t border-brand-border bg-white">
            <form onSubmit={handleQuery} className="max-w-3xl mx-auto relative group">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question here..."
                className="w-full bg-brand-surface border border-brand-border rounded-2xl py-4 pl-6 pr-16 text-sm font-medium text-brand-navy placeholder:text-brand-body/30 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || analyzing}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 w-10 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-hover transition-all disabled:opacity-20 shadow-lg shadow-brand-blue/20"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-center mt-4 text-[9px] font-bold text-brand-body/30 uppercase tracking-widest">
              Information is based on real-time system data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReliIQ

import { useState, useMemo } from 'react'
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  ChevronRight,
  MoreVertical,
  Calendar,
  Zap,
  Briefcase,
  X
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import TableBase from '../../components/ui/TableBase'
import StatCard from '../../components/ui/StatCard'
import { useDeviceData, formatApiDate } from '../../hooks/useDeviceData'
import { useJobs } from '../../hooks/useJobs'
import { useToast } from '../../store/toastStore'
import EscalationMatrixModal from '../../components/shared/EscalationMatrixModal'

const JobsPage = () => {
  const { addToast } = useToast()
  const { jobs, loading } = useJobs()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [escalatingJob, setEscalatingJob] = useState(null)

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => 
      (j.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (j.asset?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (j.assignedTo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, jobs])

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-brand-border rounded-full"></div>
          <div className="absolute top-0 h-12 w-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-brand-heading tracking-tight uppercase flex items-center gap-3">
            <Briefcase className="text-brand-blue" />
            Field Ops Desk
          </h1>
          <p className="text-sm text-brand-body font-medium">Synchronizing field engineering with real-time hardware telemetry</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body group-focus-within:text-brand-blue transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks, assets, users..."
              className="bg-brand-card border border-brand-border rounded-[10px] py-2 pl-10 pr-4 text-sm text-brand-heading focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue w-64 transition-all placeholder:text-brand-body/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <StatCard 
          label="Total Workload" 
          value={jobs.length} 
          icon={ClipboardList} 
          variant="neutral" 
          compact 
          unit="ORDERS"
        />
        <StatCard 
          label="Awaiting Dispatch" 
          value={jobs.filter(j => j.assignedTo === 'Unassigned').length} 
          icon={Clock} 
          variant="warning" 
          compact 
          unit="QUEUED"
        />
        <StatCard 
          label="Critical Ops" 
          value={jobs.filter(j => j.priority === 'Critical').length} 
          icon={AlertCircle} 
          variant="danger" 
          compact 
          unit="URGENT"
        />
        <StatCard 
          label="Closed Tickets" 
          value={jobs.filter(j => j.status === 'Completed').length} 
          icon={CheckCircle2} 
          variant="success" 
          compact 
          unit="ARCHIVE"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        <div className={`flex flex-col overflow-hidden transition-all duration-500 ${selectedJob ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="flex-1 bg-brand-card rounded-[15px] border border-brand-border shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
              <h3 className="text-[10px] font-black text-brand-heading uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={16} className="text-brand-blue" />
                Live Workload Registry
              </h3>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <TableBase headers={['Task ID & Title', 'Asset / Site', 'Assignee', 'Status', 'Actions']}>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <p className="text-xs font-black text-brand-body uppercase tracking-widest opacity-40">No matching jobs found</p>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-black/5 transition-all group cursor-pointer border-b border-brand-border last:border-0 ${selectedJob?.id === job.id ? 'bg-brand-blue/5' : ''}`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-brand-blue uppercase font-mono tracking-tighter">{job.id}</span>
                          <span className="text-xs font-black text-brand-heading group-hover:text-brand-blue transition-colors">{job.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-brand-body" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-brand-heading lowercase font-mono">{job.asset}</span>
                            <span className="text-[9px] font-bold text-brand-body uppercase">{job.site}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border border-brand-border ${job.assignedTo === 'Unassigned' ? 'bg-brand-surface text-brand-body' : 'bg-brand-blue/10 text-brand-blue'}`}>
                            {job.assignedTo === 'Unassigned' ? '?' : job.assignedTo.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className={`text-xs font-bold ${job.assignedTo === 'Unassigned' ? 'text-brand-body/40 italic' : 'text-brand-heading'}`}>
                            {job.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          label={job.status.toUpperCase()} 
                          variant={job.status === 'Completed' ? 'success' : job.status === 'In Progress' ? 'info' : 'warning'} 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEscalatingJob(job); }}
                            className="px-3 py-1.5 bg-brand-red/10 text-brand-red text-[9px] font-black uppercase rounded-[6px] hover:bg-brand-red hover:text-white transition-all"
                          >
                            Escalate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </TableBase>
            </div>
          </div>
        </div>

        {/* Right Detail Panel */}
        {selectedJob && (
          <div className="lg:col-span-5 flex flex-col overflow-hidden animate-slide-in-right">
            <div className="flex-1 bg-brand-card rounded-[15px] border border-brand-border shadow-lg overflow-hidden flex flex-col">
              <div className="p-6 bg-brand-navy text-white relative">
                <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Work Order Detail</p>
                <h4 className="text-lg font-black uppercase tracking-tight leading-tight mb-4">{selectedJob.title}</h4>
                <div className="flex items-center gap-3">
                  <Badge label={selectedJob.priority} variant={selectedJob.priority === 'Critical' ? 'danger' : 'warning'} />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{selectedJob.id}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-brand-surface">
                 <section className="space-y-3">
                    <p className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Asset Parameters</p>
                    <div className="bg-brand-card p-4 rounded-[12px] border border-brand-border space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-brand-body uppercase">Sensor ID</span>
                          <span className="text-xs font-black text-brand-heading font-mono">{selectedJob.asset}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-brand-body uppercase">Location</span>
                          <span className="text-xs font-black text-brand-heading">{selectedJob.site}</span>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-3">
                    <p className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Engineering Assignment</p>
                    <div className="flex items-center justify-between bg-brand-card p-4 rounded-[12px] border border-brand-border">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-black">
                             {selectedJob.assignedTo === 'Unassigned' ? '?' : selectedJob.assignedTo[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-brand-heading">{selectedJob.assignedTo}</p>
                             <p className="text-[9px] font-bold text-brand-body uppercase">Primary Dispatch</p>
                          </div>
                       </div>
                       <button className="text-[10px] font-black text-brand-blue uppercase hover:underline">Change</button>
                    </div>
                 </section>

                 <section className="space-y-3">
                    <p className="text-[10px] font-black text-brand-heading uppercase tracking-widest">Operational Timeline</p>
                    <div className="space-y-3">
                       {[
                         { label: 'Issue Detected', time: formatApiDate(selectedJob.dueDate), done: true },
                         { label: 'Order Dispatched', time: 'Pending Action', done: selectedJob.status !== 'Pending' },
                         { label: 'Resolution ETA', time: '24h from dispatch', done: false }
                       ].map((step, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${step.done ? 'bg-brand-green' : 'bg-brand-border'}`} />
                            <div className="flex-1 flex justify-between">
                               <span className={`text-[10px] font-bold ${step.done ? 'text-brand-heading' : 'text-brand-body/40'}`}>{step.label}</span>
                               <span className="text-[9px] font-black text-brand-body uppercase">{step.time}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>

              <div className="p-6 bg-brand-card border-t border-brand-border">
                 <button 
                  onClick={() => addToast({ title: "Task Updated", message: "Job has been marked as resolved and closed.", type: "success" })}
                  className="w-full py-4 bg-brand-blue text-white rounded-[12px] font-black text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand-blue/10"
                 >
                   Resolve Work Order
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EscalationMatrixModal 
        alert={escalatingJob ? { id: escalatingJob.id, severity: escalatingJob.priority.toLowerCase(), message: escalatingJob.title } : null} 
        onClose={() => setEscalatingJob(null)} 
      />
    </div>
  )
}

export default JobsPage


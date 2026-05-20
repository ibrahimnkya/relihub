import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Plus, 
  Shield, 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  X, 
  Save, 
  Clock, 
  Target, 
  CreditCard, 
  PieChart, 
  Activity, 
  Droplet,
  User,
  Users,
  Database,
  Key,
  Lock,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { useToast } from '../../../store/toastStore'
import { useAuthStore } from '../../../store/authStore'
import { userService } from '../../../services/userService'
import { rbacService } from '../../../services/rbacService'
import { syncService } from '../../../services/syncService'

const MOCK_USERS = [
  { 
    id: 'usr-001', 
    name: 'Admin Node Alpha', 
    email: 'admin@trc.go.tz', 
    role: 'System Admin', 
    status: 'Active', 
    mfa: true, 
    lastLogin: '10 mins ago',
    permissions: ['view_telemetry', 'manage_sessions', 'approve_reconciliations', 'configure_system']
  },
  { 
    id: 'usr-002', 
    name: 'Ops Commander', 
    email: 'ops.lead@trc.go.tz', 
    role: 'Operations', 
    status: 'Active', 
    mfa: true, 
    lastLogin: '2 hours ago',
    permissions: ['view_telemetry', 'manage_sessions', 'approve_reconciliations']
  },
  { 
    id: 'usr-003', 
    name: 'Mtwara Post', 
    email: 'mtwara.hub@trc.go.tz', 
    role: 'Station Mgr', 
    status: 'Offline', 
    mfa: false, 
    lastLogin: '2 days ago',
    permissions: ['view_telemetry', 'manage_sessions']
  },
  { 
    id: 'usr-004', 
    name: 'Audit Node', 
    email: 'audit@trc.go.tz', 
    role: 'Auditor', 
    status: 'Locked', 
    mfa: true, 
    lastLogin: '1 month ago',
    permissions: ['view_telemetry']
  },
]

const PERMISSION_DEFINITIONS = [
  { id: 'view_telemetry', label: 'View Telemetry Dashboard', description: 'Read-only access to live fleet and tank telemetry.', icon: Activity },
  { id: 'manage_sessions', label: 'Manage Fueling Sessions', description: 'Ability to edit, flag, and review live fueling sessions.', icon: Droplet },
  { id: 'approve_reconciliations', label: 'Approve Reconciliations', description: 'Authorize end-of-day / end-of-shift fuel reconciliations.', icon: PieChart },
  { id: 'configure_system', label: 'Configure System', description: 'Access to system settings, API keys, and admin creation.', icon: Shield },
]

const UserManagement = () => {
  const { addToast } = useToast()
  const { user: authUser } = useAuthStore()
  const [viewTab, setViewTab] = useState('users') // 'users', 'roles', 'permissions'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data States
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)

  // Selection States
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedPermission, setSelectedPermission] = useState(null)
  
  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)

  // Form States
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role_ids: [] })
  const [roleForm, setRoleForm] = useState({ name: '', slug: '', description: '', permission_ids: [] })
  const [permissionForm, setPermissionForm] = useState({ name: '', slug: '', description: '' })

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [uRes, rRes, pRes] = await Promise.all([
        userService.getUsers(),
        rbacService.getRoles(),
        rbacService.getPermissions()
      ])
      setUsers(uRes.data?.returnData?.list_of_item || [])
      setRoles(rRes.data?.returnData?.list_of_item || [])
      setPermissions(pRes.data?.returnData?.list_of_item || [])
    } catch (error) {
      console.error('Failed to fetch RBAC data:', error)
      addToast({ title: 'Sync Error', message: 'Failed to synchronize access control data.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const handleUserAction = async (method, id = null) => {
    setLoading(true)
    try {
      const payload = method === 'delete' ? { form_method: 'delete', id } : { ...userForm, form_method: method, id }
      const res = await userService.iformAction(payload)
      
      // If saving/updating and roles are selected, assign them
      if ((method === 'save' || method === 'update') && userForm.role_ids.length > 0) {
        const targetId = method === 'save' ? res.data?.id : id // Assumes res.data.id contains new user ID
        if (targetId) {
          await userService.assignUserRoles(targetId, userForm.role_ids)
        }
      }

      addToast({ title: 'Success', message: `User ${method === 'save' ? 'registered' : method === 'update' ? 'updated' : 'removed'} successfully.`, type: 'success' })
      setIsUserModalOpen(false)
      setUserForm({ name: '', email: '', phone: '', password: '', role_ids: [] })
      fetchAllData()
    } catch (error) {
      addToast({ title: 'Error', message: `Failed to ${method} user.`, type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncDevices = async () => {
    setLoading(true)
    addToast({ title: 'Syncing', message: 'Initializing hardware resynchronization...', type: 'info' })
    try {
      const res = await syncService.syncDevicesAndSensors({
        form_method: "save",
        name: authUser?.name || authUser?.full_name || "Super Administrator",
        email: authUser?.email || "admin@admin.com",
        phone: authUser?.phone || "0715333300",
        password: "Admin@2025"
      })
      
      const message = res.data?.returnData?.output || 'Device nodes successfully synchronized with the gateway.'
      addToast({ title: 'Telemetry Sync', message, type: 'success' })
    } catch (error) {
      addToast({ title: 'Sync Failed', message: 'Could not establish heartbeat with hardware nodes.', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleAction = async (method, id = null) => {
    setLoading(true)
    try {
      let res;
      if (method === 'save') {
        res = await rbacService.createRole(roleForm)
      } else if (method === 'update') {
        res = await rbacService.updateRole(id, roleForm)
      }
      
      // Assign permissions if selected
      if (roleForm.permission_ids.length > 0) {
        const targetId = method === 'save' ? res.data?.id : id
        if (targetId) {
          await rbacService.assignRolePermissions(targetId, roleForm.permission_ids)
        }
      }

      addToast({ title: 'Role Updated', message: `Role infrastructure successfully configured.`, type: 'success' })
      setIsRoleModalOpen(false)
      setRoleForm({ name: '', slug: '', description: '', permission_ids: [] })
      fetchAllData()
    } catch (error) {
      addToast({ title: 'Deployment Error', message: `Failed to deploy role configuration.`, type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionAction = async (method, id = null) => {
    setLoading(true)
    try {
      if (method === 'save') {
        await rbacService.createPermission(permissionForm)
      } else if (method === 'update') {
        await rbacService.updatePermission(id, permissionForm)
      }
      addToast({ title: 'Access Updated', message: `Permission layers synchronized.`, type: 'success' })
      setIsPermissionModalOpen(false)
      fetchAllData()
    } catch (error) {
      addToast({ title: 'Security Error', message: `Failed to synchronize permission layers.`, type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Lock size={200} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">User Access Management</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Manage Users, Roles & Permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (viewTab === 'users') setIsUserModalOpen(true)
              if (viewTab === 'roles') setIsRoleModalOpen(true)
              if (viewTab === 'permissions') setIsPermissionModalOpen(true)
            }}
            className="bg-brand-blue text-white px-5 py-2.5 rounded-[10px] font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all border border-brand-hover active:scale-95"
          >
            <Plus size={16} />
            {viewTab === 'users' ? 'Add User' : viewTab === 'roles' ? 'Create Role' : 'New Permission'}
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-1 bg-black/5 p-1 rounded-[12px] border border-brand-border w-fit relative z-10 overflow-x-auto">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'roles', label: 'Roles', icon: Shield },
          { id: 'permissions', label: 'Permissions', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              viewTab === tab.id 
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                : 'text-brand-body hover:bg-white/50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table View */}
      <div className="border border-brand-border rounded-[15px] overflow-hidden bg-brand-card/50 backdrop-blur-sm relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/5">
            <tr>
              {viewTab === 'users' && (
                <>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Role & Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Status</th>
                  <th className="px-6 py-4 text-right border-b border-brand-border"></th>
                </>
              )}
              {viewTab === 'roles' && (
                <>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Role Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Slug</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Description</th>
                  <th className="px-6 py-4 text-right border-b border-brand-border"></th>
                </>
              )}
              {viewTab === 'permissions' && (
                <>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Permission Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Slug</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-body uppercase tracking-widest border-b border-brand-border">Description</th>
                  <th className="px-6 py-4 text-right border-b border-brand-border"></th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {viewTab === 'users' && users.map((user) => (
              <tr key={user.id} className="hover:bg-black/5 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 bg-brand-surface text-brand-blue rounded-[12px] flex items-center justify-center font-black border border-brand-border shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-heading uppercase leading-none mb-1">{user.name}</p>
                      <p className="text-[10px] font-bold text-brand-body tracking-wider opacity-60">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-brand-blue uppercase tracking-tight">
                        {user.roles?.map(r => r.name).join(', ') || 'No Role Assigned'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.phone}</span>
                   </div>
                </td>
                <td className="px-6 py-5">
                  <Badge label="ACTIVE" variant="success" />
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setUserForm({
                          name: user.name,
                          email: user.email,
                          phone: user.phone,
                          password: '', // Don't populate password
                          role_ids: user.roles?.map(r => r.id) || []
                        })
                        setSelectedUser(user)
                        setIsUserModalOpen(true)
                      }}
                      className="p-2 text-brand-body hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleUserAction('delete', user.id)}
                      className="p-2 text-brand-body hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {viewTab === 'roles' && roles.map((role) => (
              <tr key={role.id} className="hover:bg-black/5 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Shield className="text-brand-blue" size={18} />
                    <span className="text-sm font-black text-brand-heading uppercase">{role.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] bg-black/5 px-2 py-1 rounded">{role.slug}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs text-brand-body font-medium max-w-xs truncate">{role.description}</p>
                </td>
                <td className="px-6 py-5 text-right">
                   <button 
                    onClick={() => {
                      setRoleForm({
                        name: role.name,
                        slug: role.slug,
                        description: role.description,
                        permission_ids: role.permissions?.map(p => p.id) || []
                      })
                      setSelectedRole(role)
                      setIsRoleModalOpen(true)
                    }}
                    className="p-2 text-brand-body hover:text-brand-blue rounded-lg hover:bg-black/5 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {viewTab === 'permissions' && permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-black/5 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Lock className="text-brand-amber" size={18} />
                    <span className="text-sm font-black text-brand-heading uppercase">{perm.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-brand-body uppercase tracking-[0.2em] bg-black/5 px-2 py-1 rounded">{perm.slug}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs text-brand-body font-medium max-w-xs truncate">{perm.description}</p>
                </td>
                <td className="px-6 py-5 text-right">
                   <button 
                    onClick={() => {
                      setPermissionForm({
                        name: perm.name,
                        slug: perm.slug,
                        description: perm.description
                      })
                      setSelectedPermission(perm)
                      setIsPermissionModalOpen(true)
                    }}
                    className="p-2 text-brand-body hover:text-brand-blue rounded-lg hover:bg-black/5 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && ((viewTab === 'users' && users.length === 0) || (viewTab === 'roles' && roles.length === 0) || (viewTab === 'permissions' && permissions.length === 0)) && (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Database size={48} />
                    <p className="text-xs font-black uppercase tracking-widest">No Protocol Data Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Provisioning Modal */}
      {isUserModalOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-brand-card shadow-2xl border-l border-brand-border flex flex-col h-full animate-slide-in-right overflow-hidden">
            <div className="p-6 border-b border-brand-border bg-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue border border-brand-blue/20"><User size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight">User Details</h3>
                  <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest">Register New System User</p>
                </div>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-brand-body hover:text-brand-heading transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ibrahim Nkya"
                    className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="ibra@example.com"
                      className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="0656121886"
                      className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Assigned Permissions (Roles)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => {
                          const exists = userForm.role_ids.includes(role.id)
                          setUserForm({
                            ...userForm,
                            role_ids: exists 
                              ? userForm.role_ids.filter(id => id !== role.id)
                              : [...userForm.role_ids, role.id]
                          })
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          userForm.role_ids.includes(role.id)
                            ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                            : 'bg-brand-surface border-brand-border text-brand-body hover:border-brand-blue/20'
                        }`}
                      >
                        <Shield size={12} />
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/5 border-t border-brand-border flex gap-3">
              <button 
                onClick={() => {
                  setIsUserModalOpen(false)
                  setSelectedUser(null)
                  setUserForm({ name: '', email: '', phone: '', password: '', role_ids: [] })
                }} 
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-brand-body hover:text-brand-heading transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUserAction(selectedUser ? 'update' : 'save', selectedUser?.id)}
                disabled={loading}
                className="flex-[2] bg-brand-blue text-white py-3 rounded-[12px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 border border-brand-hover"
              >
                {loading && <RefreshCw size={14} className="animate-spin" />}
                {selectedUser ? 'Update Authority' : 'Authorize Node'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Role Configuration Modal */}
      {isRoleModalOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => { setIsRoleModalOpen(false); setSelectedRole(null); setRoleForm({ name: '', slug: '', description: '', permission_ids: [] }); }}></div>
          <div className="relative w-full max-w-md bg-brand-card shadow-2xl border-l border-brand-border flex flex-col h-full animate-slide-in-right overflow-hidden">
             <div className="p-6 border-b border-brand-border bg-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-amber/10 rounded-xl flex items-center justify-center text-brand-amber border border-brand-amber/20"><Shield size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight">{selectedRole ? 'Update Authority' : 'Authority Layer'}</h3>
                  <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest">{selectedRole ? `Configuring ${selectedRole.name}` : 'Configure System Access Roles'}</p>
                </div>
              </div>
              <button onClick={() => { setIsRoleModalOpen(false); setSelectedRole(null); setRoleForm({ name: '', slug: '', description: '', permission_ids: [] }); }} className="text-brand-body hover:text-brand-heading transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Role Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Super Agent"
                    className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                  />
                </div>
                {!selectedRole && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Unique Identifier (Slug)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. super_agent"
                      className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      value={roleForm.slug}
                      onChange={(e) => setRoleForm({...roleForm, slug: e.target.value})}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Authority Scope (Description)</label>
                  <textarea 
                    placeholder="Describe the access limits of this role..."
                    className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all min-h-[80px] resize-none"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Authorized Protocols (Permissions)</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                    {permissions.map(perm => (
                      <button
                        key={perm.id}
                        onClick={() => {
                          const exists = roleForm.permission_ids.includes(perm.id)
                          setRoleForm({
                            ...roleForm,
                            permission_ids: exists 
                              ? roleForm.permission_ids.filter(id => id !== perm.id)
                              : [...roleForm.permission_ids, perm.id]
                          })
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                          roleForm.permission_ids.includes(perm.id)
                            ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue shadow-sm'
                            : 'bg-brand-surface border-brand-border text-brand-body hover:border-brand-blue/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Lock size={12} />
                          {perm.name}
                        </div>
                        {roleForm.permission_ids.includes(perm.id) && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/5 border-t border-brand-border flex gap-3">
              <button onClick={() => { setIsRoleModalOpen(false); setSelectedRole(null); setRoleForm({ name: '', slug: '', description: '', permission_ids: [] }); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-brand-body hover:text-brand-heading transition-colors">Discard</button>
              <button 
                onClick={() => handleRoleAction(selectedRole ? 'update' : 'save', selectedRole?.id)}
                disabled={loading}
                className="flex-[2] bg-brand-blue text-white py-3 rounded-[12px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 border border-brand-hover"
              >
                {loading && <RefreshCw size={14} className="animate-spin" />}
                {selectedRole ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Permission Definition Modal */}
      {isPermissionModalOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-fade-in" onClick={() => { setIsPermissionModalOpen(false); setSelectedPermission(null); setPermissionForm({ name: '', slug: '', description: '' }); }}></div>
          <div className="relative w-full max-w-md bg-brand-card shadow-2xl border-l border-brand-border flex flex-col h-full animate-slide-in-right overflow-hidden">
             <div className="p-6 border-b border-brand-border bg-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red border border-brand-red/20"><Lock size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-brand-heading uppercase tracking-tight">{selectedPermission ? 'Update Protocol' : 'Security Protocol'}</h3>
                  <p className="text-[10px] text-brand-body font-bold uppercase tracking-widest">{selectedPermission ? `Configuring Layer ${selectedPermission.slug}` : 'Define Granular Access Layers'}</p>
                </div>
              </div>
              <button onClick={() => { setIsPermissionModalOpen(false); setSelectedPermission(null); setPermissionForm({ name: '', slug: '', description: '' }); }} className="text-brand-body hover:text-brand-heading transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Protocol Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Update reports"
                    className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    value={permissionForm.name}
                    onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                  />
                </div>
                {!selectedPermission && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Protocol Identifier (Slug)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. update.reports"
                      className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      value={permissionForm.slug}
                      onChange={(e) => setPermissionForm({...permissionForm, slug: e.target.value})}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-brand-body uppercase tracking-[0.2em] ml-1">Protocol Details</label>
                  <textarea 
                    placeholder="Granular description of this permission layer..."
                    className="w-full bg-brand-surface border border-brand-border rounded-[12px] py-3 px-4 text-sm font-bold text-brand-heading focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all min-h-[100px] resize-none"
                    value={permissionForm.description}
                    onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/5 border-t border-brand-border flex gap-3">
              <button onClick={() => { setIsPermissionModalOpen(false); setSelectedPermission(null); setPermissionForm({ name: '', slug: '', description: '' }); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-brand-body hover:text-brand-heading transition-colors">Discard</button>
              <button 
                onClick={() => handlePermissionAction(selectedPermission ? 'update' : 'save', selectedPermission?.id)}
                disabled={loading}
                className="flex-[2] bg-brand-blue text-white py-3 rounded-[12px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 border border-brand-hover"
              >
                {loading && <RefreshCw size={14} className="animate-spin" />}
                {selectedPermission ? 'Save Permission' : 'Create Permission'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}

export default UserManagement

export const checkHasModule = (user, moduleId) => {
  if (!user) return false

  const getRoleString = () => {
    if (!user?.role && !user?.roles && !user?.role_name) return ''
    if (typeof user.role === 'string') return user.role
    if (user.role?.name) return user.role.name
    if (user.role?.slug) return user.role.slug
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name || user.roles[0].slug || ''
    }
    return user.role_name || ''
  }

  const roleString = (getRoleString() || user?.name || user?.full_name || '').toLowerCase()
  
  // Platform-level Super Admins (no company_id) or anyone with "Super" in their identity gets universal access
  if (roleString.includes('super') || 
      roleString.includes('technical') || 
      roleString.includes('system') ||
      (!user?.company_id && roleString.includes('admin'))
  ) {
    return true
  }

  let modulesList = []
  // Check both company.modules and top-level company_modules
  const rawModules = user?.company_modules || user?.company?.modules
  
  if (typeof rawModules === 'string') {
    try { 
      const parsed = JSON.parse(rawModules)
      modulesList = Array.isArray(parsed) ? parsed : []
    } catch(e) {
      // Handle comma-separated if not JSON
      modulesList = rawModules.split(',').map(m => m.trim())
    }
  } else if (Array.isArray(rawModules)) {
    modulesList = rawModules
  }

  // Case-insensitive inclusion check
  return modulesList.some(m => m.toLowerCase() === moduleId.toLowerCase())
}

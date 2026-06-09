import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ListChecks, Image, FileText, Users, ShieldCheck, FolderArchive, BarChart3, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const menuItems = [
  { path: '/studies', label: '检查列表', icon: ListChecks },
  { path: '/viewer', label: '影像阅览', icon: Image },
  { path: '/report', label: '报告编辑', icon: FileText },
  { path: '/consultation', label: '会诊协作', icon: Users },
  { path: '/quality', label: '质控管理', icon: ShieldCheck },
  { path: '/archive', label: '共享归档', icon: FolderArchive },
  { path: '/settings', label: '统计设置', icon: BarChart3 },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
      {!collapsed && (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
            M
          </div>
          <span className="font-semibold text-slate-800">医学影像平台</span>
        </div>
      )}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn('shrink-0', isActive ? 'text-blue-600' : 'text-slate-500')}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3">
        {currentUser && (
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50',
              collapsed ? 'justify-center' : ''
            )}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{currentUser.name}</p>
                <p className="truncate text-xs text-slate-500">{currentUser.department}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

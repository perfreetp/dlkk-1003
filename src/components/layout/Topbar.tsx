import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Search, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const breadcrumbMap: Record<string, string> = {
  '/studies': '检查列表',
  '/viewer': '影像阅览',
  '/report': '报告编辑',
  '/consultation': '会诊协作',
  '/quality': '质控管理',
  '/archive': '共享归档',
  '/settings': '统计设置',
}

export default function Topbar() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getBreadcrumbs = () => {
    const crumbs = [{ label: '首页', path: '/' }]
    const pathSegments = location.pathname.split('/').filter(Boolean)
    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += '/' + segment
      if (breadcrumbMap[currentPath]) {
        crumbs.push({ label: breadcrumbMap[currentPath], path: currentPath })
      }
    })
    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={16} className="text-slate-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-slate-900">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-slate-500 hover:text-slate-700 transition-colors">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索检查、患者、报告..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-80 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                <User size={18} className="text-slate-600" />
              </div>
            )}
            <ChevronDown size={16} className={cn('text-slate-500 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                {currentUser && (
                  <>
                    <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.department}</p>
                  </>
                )}
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User size={16} />
                  个人中心
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Settings size={16} />
                  账号设置
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

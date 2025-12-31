import { Link, useRouterState } from '@tanstack/react-router'
import { UserButton, useClerk, useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Users,
  Video,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Companies', href: '/companies', icon: Building2 },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Videos', href: '/videos', icon: Video },
]

export function Sidebar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/' || currentPath === ''
    return currentPath.startsWith(href)
  }

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-bg-secondary border-r border-border-subtle
        flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Header */}
      <div className="px-4 flex items-start justify-between border-b border-border-subtle">
        {!collapsed && (
          <Link to="/" className="flex items-center">
            <img
              src="/Primary Logo Transparent Background.png"
              alt="Sentra"
              className="w-full mx-auto"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-2 border-t border-border-subtle">
        {/* Logout button */}
        <button
          onClick={() => signOut({ redirectUrl: '/login' })}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-text-secondary hover:bg-bg-hover hover:text-text-primary
            transition-colors duration-150
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <div
          className={`
            flex items-center gap-3
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
                userButtonPopoverCard:
                  'bg-bg-elevated border border-border-default',
                userButtonPopoverActionButton:
                  'text-text-secondary hover:bg-bg-hover',
                userButtonPopoverActionButtonText: 'text-text-secondary',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// Nav Link Component
interface NavLinkProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}

function NavLink({ item, isActive, collapsed }: NavLinkProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-colors duration-150
        ${collapsed ? 'justify-center' : ''}
        ${
          isActive
            ? 'bg-accent-muted text-accent'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }
      `}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
        </>
      )}
    </Link>
  )
}

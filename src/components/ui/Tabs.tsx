import { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used within Tabs')
  return context
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const value = controlledValue ?? uncontrolledValue

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) setUncontrolledValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 gap-1',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
  children: ReactNode
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext()
  const isActive = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1',
        isActive
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900',
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  children: ReactNode
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext()

  if (activeValue !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('mt-4 focus:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default Tabs

import { useState, useRef, useEffect, ReactNode, HTMLAttributes } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: ReactNode
}

interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  className,
  disabled,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative w-full', className)} {...props}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'border-blue-500 ring-2 ring-blue-100'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-slate-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 origin-top duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-500">暂无选项</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-slate-50',
                  option.value === value && 'bg-blue-50 text-blue-600'
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {option.value === value && <Check size={16} className="shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Select

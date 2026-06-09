import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize
  prefix?: ReactNode
  suffix?: ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-9 text-sm',
  lg: 'h-11 text-base',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', prefix, suffix, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative flex items-center w-full rounded-lg border border-slate-200 bg-white',
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100',
          'transition-colors',
          className
        )}
      >
        {prefix && (
          <div className="flex items-center pl-3 text-slate-400 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex-1 bg-transparent px-3 py-1 outline-none placeholder:text-slate-500 text-slate-900',
            sizeClasses[size],
            prefix ? 'pl-2' : '',
            suffix ? 'pr-2' : ''
          )}
          {...props}
        />
        {suffix && (
          <div className="flex items-center pr-3 text-slate-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export default Input

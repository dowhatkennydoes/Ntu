'use client'

import { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  gradient?: string
  motionProps?: MotionProps
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    gradient = 'from-blue-600 to-purple-600',
    motionProps,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
    
    const variants = {
      primary: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-lg hover:shadow-xl focus:ring-zinc-500",
      secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:ring-zinc-500",
      outline: "border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-500",
      ghost: "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-500",
      gradient: `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-blue-500`,
      glass: "bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 focus:ring-white/50"
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2",
      xl: "px-8 py-4 text-lg rounded-2xl gap-3"
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: variant === 'gradient' ? 1.02 : 1.01 }}
        whileTap={{ scale: 0.98 }}
        {...(motionProps as any)}
        {...(props as any)}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        {/* Content */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-200",
          loading && "opacity-0"
        )}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>

        {/* Gradient overlay for hover effect */}
        {variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-inherit"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    )
  }
)

ModernButton.displayName = "ModernButton"

export { ModernButton }

// Preset button variations
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ModernButtonProps, 'variant'>>(
  (props, ref) => <ModernButton ref={ref} variant="primary" {...props} />
)

export const GradientButton = forwardRef<HTMLButtonElement, Omit<ModernButtonProps, 'variant'>>(
  (props, ref) => <ModernButton ref={ref} variant="gradient" {...props} />
)

export const GlassButton = forwardRef<HTMLButtonElement, Omit<ModernButtonProps, 'variant'>>(
  (props, ref) => <ModernButton ref={ref} variant="glass" {...props} />
)

PrimaryButton.displayName = "PrimaryButton"
GradientButton.displayName = "GradientButton"  
GlassButton.displayName = "GlassButton"
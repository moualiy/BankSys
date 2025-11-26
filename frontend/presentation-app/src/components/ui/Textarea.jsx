import React from 'react';

/**
 * Textarea Component
 * Multi-line text input with consistent styling
 */
const Textarea = React.forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 transition-all duration-250 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:focus:border-primary-400 disabled:bg-neutral-100 dark:disabled:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <div className={`${widthClass} flex flex-col gap-1`}>
      {label && (
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {helperText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

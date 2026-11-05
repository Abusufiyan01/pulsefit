import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchInput({
  value: controlledValue,
  onChange: controlledOnChange,
  onSearch,
  placeholder = 'Search...',
  debounce = 300,
  className = '',
  ...props
}) {
  const [internalValue, setInternalValue] = useState('')
  const timerRef = useRef(null)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  useEffect(() => {
    if (!onSearch) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(value)
    }, debounce)
    return () => clearTimeout(timerRef.current)
  }, [value, debounce, onSearch])

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value)
    if (controlledOnChange) controlledOnChange(e)
  }

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('')
      if (onSearch) onSearch('')
    }
    if (controlledOnChange) {
      controlledOnChange({ target: { value: '' } })
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="input pl-10 pr-10"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-current transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export { SearchInput }

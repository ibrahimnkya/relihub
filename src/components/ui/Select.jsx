import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

const Select = ({ label, icon: Icon, options, value, onChange, placeholder = 'Select option...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', updateCoords)
    window.addEventListener('resize', updateCoords)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updateCoords)
      window.removeEventListener('resize', updateCoords)
    }
  }, [])

  const toggleDropdown = () => {
    if (!isOpen) {
      updateCoords()
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option.value
    onChange && onChange({ target: { value: val } })
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => 
    (typeof opt === 'string' ? opt : opt.value) === value
  )
  
  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none block ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={toggleDropdown}
        className={`
          relative group flex items-center bg-slate-50 border border-slate-200 rounded-[12px] py-2.5 px-4 cursor-pointer transition-all shadow-sm
          hover:border-brand-blue/30 hover:bg-white
          ${isOpen ? 'ring-2 ring-brand-blue/20 border-brand-blue bg-white' : ''}
          ${Icon ? 'pl-10' : ''}
        `}
      >
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-blue transition-colors">
            <Icon size={14} />
          </div>
        )}

        <span className={`text-[13px] font-bold truncate ${selectedOption ? 'text-brand-navy' : 'text-slate-400'}`}>
          {displayValue}
        </span>

        <div className={`ml-auto text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`}>
          <ChevronDown size={14} strokeWidth={3} />
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          style={{ 
            position: 'absolute', 
            top: coords.top + 4, 
            left: coords.left, 
            width: coords.width,
            zIndex: 9999
          }}
          className="bg-white border border-slate-200 rounded-[12px] shadow-2xl py-1 overflow-hidden animate-scale-in origin-top"
        >
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {options.map((option, i) => {
              const val = typeof option === 'string' ? option : option.value
              const labelText = typeof option === 'string' ? option : option.label
              const isSelected = val === value

              return (
                <div 
                  key={i}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-2.5 text-[11px] font-bold uppercase tracking-tight flex items-center justify-between cursor-pointer transition-colors
                    ${isSelected ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'}
                  `}
                >
                  {labelText}
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Select

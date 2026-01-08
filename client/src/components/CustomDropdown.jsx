import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ label, options = [], value, onChange, name, icon, color = 'violet', placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close logic when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(name, optionValue);
        setIsOpen(false);
    };

    // Safe fallback if options is empty or value not found
    const selectedOption = options.find(opt => opt.value === value) ||
        (placeholder ? { label: placeholder, value: '' } : (options[0] || { label: 'Select...', value: '' }));

    // Color maps for dynamic theming
    const colorMap = {
        violet: { ring: 'focus:ring-violet-500/20', border: 'hover:border-violet-300', active: 'bg-violet-50 text-violet-700', icon: 'text-violet-500' },
        emerald: { ring: 'focus:ring-emerald-500/20', border: 'hover:border-emerald-300', active: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-500' },
        pink: { ring: 'focus:ring-pink-500/20', border: 'hover:border-pink-300', active: 'bg-pink-50 text-pink-700', icon: 'text-pink-500' },
        blue: { ring: 'focus:ring-blue-500/20', border: 'hover:border-blue-300', active: 'bg-blue-50 text-blue-700', icon: 'text-blue-500' }
    };

    const theme = colorMap[color] || colorMap.violet;

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl transition-all duration-200 outline-none text-left flex items-center justify-between group ${theme.border} ${isOpen ? 'ring-4 ' + theme.ring + ' border-' + color + '-400' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center ${theme.icon}`}>
                            {icon}
                        </div>
                    )}
                    <span className={`font-semibold transition-colors ${!value && placeholder ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {selectedOption.label}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top animate-fade-in-up">
                    <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-4 py-3 text-left font-medium transition-all flex items-center justify-between hover:bg-slate-50
                                    ${value === option.value ? theme.active + ' border-l-4 border-' + color + '-500' : 'text-slate-600 border-l-4 border-transparent'}
                                `}
                            >
                                <span className="flex-1">{option.label}</span>
                                {value === option.value && (
                                    <svg className={`w-5 h-5 ${theme.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;

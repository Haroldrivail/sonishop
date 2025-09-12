import React, { useState } from 'react'

const Tooltip = ({ children, content, position = 'right', disabled = false }) => {
    const [isVisible, setIsVisible] = useState(false)

    if (disabled || !content) {
        return children
    }

    const getPositionClasses = () => {
        switch (position) {
            case 'right':
                return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
            case 'left':
                return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
            case 'top':
                return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
            case 'bottom':
                return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
            default:
                return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
        }
    }

    const getArrowClasses = () => {
        switch (position) {
            case 'right':
                return 'absolute right-full top-1/2 transform -translate-y-1/2 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-gray-900'
            case 'left':
                return 'absolute left-full top-1/2 transform -translate-y-1/2 border-r-0 border-l-4 border-t-4 border-b-4 border-transparent border-l-gray-900'
            case 'top':
                return 'absolute top-full left-1/2 transform -translate-x-1/2 border-t-0 border-b-4 border-l-4 border-r-4 border-transparent border-b-gray-900'
            case 'bottom':
                return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-b-0 border-t-4 border-l-4 border-r-4 border-transparent border-t-gray-900'
            default:
                return 'absolute right-full top-1/2 transform -translate-y-1/2 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-gray-900'
        }
    }

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 ${getPositionClasses()}`}>
                    <div className="bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap font-medium">
                        {content}
                        <div className={getArrowClasses()}></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tooltip

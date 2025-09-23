'use client'

import React, { useState, useEffect } from 'react'

interface AnimatedCounterProps {
  end: string
  duration?: number
  suffix?: string
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  end, 
  duration = 2000,
  suffix = '' 
}) => {
  const [count, setCount] = useState('0')

  useEffect(() => {
    const numericEnd = parseInt(end.replace(/\D/g, ''))
    if (isNaN(numericEnd)) {
      setCount(end)
      return
    }

    let start = 0
    const increment = numericEnd / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= numericEnd) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start).toString() + suffix)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [end, duration, suffix])

  return <span>{count}</span>
}

export default AnimatedCounter
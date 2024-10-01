import * as React from "react"
import { useRef, useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { Phone, Send, X, Shield } from "lucide-react" // Added Shield import
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"

interface CallingModalProps {
  onClose: () => void
}

export function CallingModal({ onClose }: CallingModalProps) {
  const constraintsRef = useRef(null)
  const chatBoxRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const controls = useAnimation()

  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setConstraints({
      top: 0,
      left: 0,
      right: window.innerWidth - 200, // Subtracting modal width
      bottom: window.innerHeight - 200 // Subtracting approximate modal height
    })
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    const timer = setInterval(() => {
      if (isVisible) {
        const currentTime = Date.now()
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
        setElapsedTime(elapsedSeconds)
      } else {
        setStartTime(prevStartTime => prevStartTime + 1000)
      }
    }, 1000)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isVisible, startTime])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setStartTime(Date.now())
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isLoading) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isLoading, startTime])

  const snapTo = (value: number, snapPoints: number[], threshold = 100) => {
    const closest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
    return Math.abs(value - closest) < threshold ? closest : value
  }

  const handleDragEnd = () => {
    const xValue = x.get()
    const yValue = y.get()
    
    const margin = 20 // Margin from the edges of the viewport
    const snappedX = snapTo(xValue, [margin, constraints.right - margin])
    const snappedY = snapTo(yValue, [margin, constraints.bottom - margin])

    controls.start({ x: snappedX, y: snappedY, transition: { type: "spring", stiffness: 300, damping: 30 } })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div ref={constraintsRef} className="fixed inset-0 overflow-hidden">
      <motion.div
        ref={chatBoxRef}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.001}
        style={{ x, y, zIndex: 9999, width: '200px', cursor: 'grab' }} // Added cursor: 'grab' here
        className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden pointer-events-auto"
        whileDrag={{ scale: 1.0, cursor: 'grabbing' }} // Added cursor: 'grabbing' here
        dragTransition={{ power: 0.1, timeConstant: 200, bounceStiffness: 600, bounceDamping: 10 }}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        <div className="bg-gray-100 flex justify-between items-center" style={{ paddingTop: '1rem', paddingRight: '1rem', paddingLeft: '1rem' }}>
          <div style={{ width: '100%', height: '0.25rem', backgroundColor: '#D1D5DB', margin: '0 auto', borderRadius: '9999px' }} />
        </div>
        <div className="p-4 space-y-4">
          <div className="relative flex flex-col space-y-2 cursor-move">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                <div role="status">
                  <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.625rem', color: '#6B7280', opacity: isLoading ? 0.5 : 1 }}>AI can make mistakes. Please double-check responses.</p>
            <div className="flex justify-between items-center" style={{ opacity: isLoading ? 0.5 : 1 }}>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 'bold' }}>
                {isLoading ? "00:00" : formatTime(elapsedTime)}
              </p>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" style={{ color: '#6B7280' }}/>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Secure</span>
              </div>
            </div>
          </div>
          <Button 
            style={{ 
              width: '100%', 
              backgroundColor: '#d13438', 
              color: 'white', 
              position: 'relative',
              zIndex: 20  // Ensure button is above the loading overlay
            }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b12e30'} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d13438'}
            onClick={onClose}
          >
            <Phone className="mr-2 h-4 w-4" /> End call
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
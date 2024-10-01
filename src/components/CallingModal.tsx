import * as React from "react"
import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Phone, Shield, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CallingModalProps {
  onClose: () => void
}

export function CallingModal({ onClose }: CallingModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    const interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-4 right-4 w-[300px] bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ zIndex: 9999, cursor: 'grab' }}
      whileDrag={{ cursor: 'grabbing' }}
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
              {formatTime(elapsedTime)}
            </p>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" style={{ color: '#4B5563' }}/>
              <span style={{ fontSize: '0.75rem', color: '#4B5563' }}>Secure</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className={`p-2 mr-4 transition-colors duration-200 ${
              isMuted ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-200'
            }`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 text-gray-600" />
            ) : (
              <Mic className="h-5 w-5 text-gray-600" />
            )}
          </Button>
          <Button 
            className="flex-1 text-white transition-colors duration-200 ml-4"
            style={{ 
              backgroundColor: '#bc2f32',
              marginLeft: '.75rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#751D20'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#bc2f32'}
            onClick={onClose}
          >
            <Phone className="mr-2 h-4 w-4" /> End call
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
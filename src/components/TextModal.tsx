import * as React from "react"
import { useRef, useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"

interface TextModalProps {
  onClose: () => void
  question: string
  isVisible: boolean
  onAskFollowUp: (question: string) => void // Add this new prop
}

export function TextModal({ onClose, question, isVisible, onAskFollowUp }: TextModalProps) {
  const constraintsRef = useRef(null)
  const sidebarRef = useRef(null)
  const width = useMotionValue(300) // Initial width
  const controls = useAnimation()
  const [constraints, setConstraints] = useState({ min: 300, max: window.innerWidth })
  const x = useMotionValue(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const initialWidth = useMotionValue(300)
  const minimizedWidth = 300
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followUpQuestion, setFollowUpQuestion] = useState("")

  useEffect(() => {
    if (isVisible) {
      setPosition({ x: 0, y: 0 }); // Reset position when modal becomes visible
    }
  }, [isVisible]);

  const handleDragEnd = (event: any, info: any) => {
    const newPosition = { x: position.x + info.delta.x, y: position.y + info.delta.y };
    setPosition(newPosition);
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (!isMinimized) {
      controls.start({ width: minimizedWidth, height: 40 }) // Set a fixed height for the minimized state
    } else {
      controls.start({ width: initialWidth.get(), height: '100vh' })
    }
  }

  const handleClose = () => {
    setIsMinimized(false); // Reset minimized state
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0" style={{ zIndex: 10000 }}>
      <motion.div
        ref={sidebarRef}
        style={{ 
          width: isMinimized ? minimizedWidth : width,
          height: isMinimized ? 40 : '100vh', // Fixed height when minimized
          zIndex: 10001,
        }}
        drag={isMinimized ? false : true} // Allow dragging in all directions when not minimized
        dragConstraints={constraintsRef}
        dragElastic={0.001}
        onDragEnd={handleDragEnd}
        animate={{
          x: position.x,
          y: position.y,
        }}
        initial={{ x: 0, y: 0 }}
        className="bg-white shadow-lg flex flex-col absolute left-0 top-0"
      >
        <div 
          className="bg-gray-100 flex items-center justify-between p-2 h-10 cursor-move"
          
        >
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMinimize}
            className="mr-2"
          >
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          {isMinimized ? (
            <div className="flex-grow truncate mx-2">
              
            </div>
          ) : (
            <div className="flex-grow mx-2">
              <div className="w-full h-1 bg-gray-300 rounded-full" />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose} // Use handleClose instead of onClose
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {!isMinimized && (
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow space-y-4 overflow-y-auto p-4">
              <div className="flex flex-col space-y-4">
                <div className="bg-gray-100 rounded-md">
                  <h3 style={{ fontSize: '0.625rem', color: '#6B7280', paddingBottom: '0.25rem' }}>Your question:</h3>
                  <p className="font-semibold text-gray-800">{question}</p>
                </div>
                <div className="space-y-4">
                  
                  <p className="text-xs text-gray-600">
                    To begin your development journey, start by setting up your environment. Install Node.js and npm, then choose a code editor like VS Code. Next, create a new project using a framework such as Next.js:
                  </p>
                  <div className="bg-gray-100 text-xs p-3 rounded-md">
                    <code>npx create-next-app my-project</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Navigate to your project directory in the terminal:
                  </p>
                  <div className="bg-gray-100 text-xs p-3 rounded-md">
                    <code>cd my-project</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Finally, start the development server to see your app in action:
                  </p>
                  <div className="bg-gray-100 text-xs p-3 rounded-md">
                    <code>npm run dev</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    With your project set up, you're ready to start coding. Open your project in your code editor and begin building your app. Remember to refer to the documentation of your chosen framework for specific guidance and best practices.
                  </p>
                  <p className="text-xs text-gray-600">
                    Navigate to your project directory in the terminal:
                  </p>
                  <div className="bg-gray-100 text-xs p-3 rounded-md">
                    <code>cd my-project</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    Finally, start the development server to see your app in action:
                  </p>
                  <div className="bg-gray-100 text-xs p-3 rounded-md">
                    <code>npm run dev</code>
                  </div>
                  <p className="text-xs text-gray-600">
                    With your project set up, you're ready to start coding. Open your project in your code editor and begin building your app. Remember to refer to the documentation of your chosen framework for specific guidance and best practices.
                  </p>
                 
              
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-border">
              <p style={{ fontSize: '0.625rem', color: '#6B7280', paddingBottom: '1rem' }}>AI can make mistakes. Please double-check responses.</p>
              <form onSubmit={(e) => {
                e.preventDefault()
                onAskFollowUp(followUpQuestion)
                setFollowUpQuestion("")
              }}>
                <div className="flex items-center space-x-2 p-2">
                  <Input
                    type="text"
                    placeholder="Ask follow-up"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button 
                    type="submit" 
                    disabled={!followUpQuestion.trim()}
                    variant={followUpQuestion.trim() ? "default" : "secondary"}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            
            </div>
            
            
          </div>
        )}
        {/* Resize handle */}
        {!isMinimized && (
          <div 
            className="absolute inset-y-0 right-0 w-1 cursor-ew-resize" 
            style={{ zIndex: 10002 }} 
            onMouseDown={() => {
              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          />
        )}
      </motion.div>
    </div>
  )

  function handleMouseMove(e: MouseEvent) {
    const newWidth = e.clientX
    width.set(Math.min(Math.max(newWidth, constraints.min), constraints.max))
    x.set(0)
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    handleDragEnd(null, { delta: { x: 0, y: 0 } })
  }
}
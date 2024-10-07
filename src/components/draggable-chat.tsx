"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { HelpCircle, Phone, CornerDownRight, AudioLines } from "lucide-react"
import { Button } from "@components/ui/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@components/ui/command"
import { CommandInput } from "cmdk"
import { CallingModal } from "./CallingModal"
import { TextModal } from './TextModal'
import { useCallAI } from '../hooks/useCallAI'

export function DraggableChat() {
  const [open, setOpen] = useState(false)
  const [isTextModalVisible, setIsTextModalVisible] = useState(false)
  const [question, setQuestion] = useState("")

  const { isCalling, isConnecting, isMuted, startCall, endCall, toggleMute } = useCallAI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      } else if (e.key === "Escape") {
        // Reset everything when Esc is pressed
        setOpen(false)
        endCall()
        setIsTextModalVisible(false)
        setQuestion("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleClose = () => {
    endCall();
    setOpen(false);
    setIsTextModalVisible(false);
    setQuestion("");
  }

  const handleCallAI = () => {
    if (isConnecting) return;
    if (isCalling) {
      endCall();
    } else {
      startCall();
    }
    setOpen(false); // Close the CommandDialog when opening CallingModal
  }

  const handleSuggestionClick = (suggestion: string) => {
    toggleTextModal(suggestion);
  };

  const toggleTextModal = (question: string) => {
    setQuestion(question);
    setIsTextModalVisible(true);
    setOpen(false);
  };

  const handleAskFollowUp = (followUpQuestion: string) => {
    // Implement the follow-up question logic here
    console.log("Follow-up question:", followUpQuestion);
    // You might want to set a new state or trigger an action
  };

  return (
    <>
      {/* Conditionally render the HelpCircle Button when no modals are open */}
      {!(isConnecting || isCalling || isTextModalVisible) && (
        <Button
          onClick={() => setOpen(true)}
          variant="default"
          size="icon"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            height: '56px',
            width: '56px',
            borderRadius: '9999px',
            backgroundColor: 'black',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'background-color 0.2s ease',
            zIndex: 999,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'black'}
        >
          <HelpCircle className="h-7 w-7" />
          <span className="sr-only">Open Help</span>
        </Button>
      )}

      {/* Calling Modal */}
      {(isConnecting || isCalling) && (
        <CallingModal
          onClose={handleClose}
          isConnecting={isConnecting}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Command Dialog */}
      <CommandDialog open={open && !isTextModalVisible} onOpenChange={setOpen}>
        <div className="flex items-center space-x-4 p-2" style={{ padding: '6px' }}>
          <Button
            variant="default"
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
            onClick={handleCallAI}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call AI
          </Button>
          <div className="flex flex-1 items-center space-x-2" style={{ paddingLeft: '8px', paddingRight: '24px' }}>
            <CommandInput
              placeholder="Ask anything about Plaace..."
              className="w-full h-9 py-2 px-3 focus:outline-none focus:ring-0 border-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  toggleTextModal(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
        </div>
        <CommandList>
          <CommandEmpty>
            <p className="text-sm text-muted-foreground">
              Press{" "}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                Enter ↵ 
              </kbd>
              {" "}to get an answer.
            </p>
          </CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem 
              onSelect={() => handleSuggestionClick("How do I get started?")}
              style={{ cursor: 'pointer' }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>How do I get started?</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleSuggestionClick("How do I compare two areas?")}
              style={{ cursor: 'pointer' }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>How do I compare two areas?</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleSuggestionClick("What can I do on Area Insights?")}
              style={{ cursor: 'pointer' }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>What can I do on Area Insights?</span>
            </CommandItem>
          </CommandGroup>
          
          <div className="p-2 text-xs flex items-center justify-center" style={{ marginTop: '12px', marginBottom: '12px', borderTop: 'none', color: '#9BA3AF' }}>
            <a 
              href="https://midpilot.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cursor-pointer flex items-center transition-colors duration-200"
              style={{ color: 'unset' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9BA3AF'}
            >
              <AudioLines className="w-3 h-3" style={{ marginLeft: '0.1rem', marginRight: '0.25rem'}} />
              Midpilot
            </a>
          </div>
        </CommandList>
      </CommandDialog>

      {/* Text Modal */}
      {isTextModalVisible && (
        <TextModal
          onClose={() => {
            setIsTextModalVisible(false);
            setQuestion("");
          }}
          question={question}
          isVisible={isTextModalVisible}
        />
      )}
    </>
  )
}
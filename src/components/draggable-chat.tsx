"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { HelpCircle, Phone, CornerDownRight, AudioLines } from "lucide-react"
import { Button } from "@components/ui/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@components/ui/command"
import { CommandInput } from "cmdk"
import { CallingModal } from "./CallingModal"
import { TextModal } from './TextModal'

export function DraggableChat() {
  const [open, setOpen] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isTextModalVisible, setIsTextModalVisible] = useState(false)
  const [question, setQuestion] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      } else if (e.key === "Escape") {
        // Reset everything when Esc is pressed
        setOpen(false)
        setIsCalling(false)
        setIsTextModalVisible(false)
        setQuestion("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleClose = () => {
    setIsCalling(false)
    setOpen(false)
    setIsTextModalVisible(false)
    setQuestion("")
  }

  const handleCallAI = () => {
    setIsCalling(true);
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
      {isCalling && <CallingModal onClose={handleClose} />}
      <Button
        onClick={() => setOpen(true)}
        variant="default"
        size="icon"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          height: '56px',
          width: '56px',
          borderRadius: '9999px',
          backgroundColor: 'black',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'background-color 0.2s ease',
          zIndex: 999, // Set lower than CallingModal
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'} // gray-800
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'black'}
      >
        <HelpCircle className="h-7 w-7" />
        <span className="sr-only">Open Help</span>
      </Button>
      <CommandDialog open={open && !isTextModalVisible} onOpenChange={setOpen}>
        <div className="flex items-center space-x-4 p-2" style={{ padding: '6px' }}>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-black text-white hover:bg-gray-800"
            onClick={handleCallAI} // Use the new handler here
          >
            <Phone className="h-4 w-4 mr-2" />
            Call AI
          </Button>
          <div className="flex flex-1 items-center space-x-2" style={{ paddingLeft: '8px', paddingRight: '24px' }}>
            <CommandInput
              placeholder="Ask anything about Inventory..."
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
              onSelect={() => handleSuggestionClick("How do I create a dashboard?")}
              style={{ cursor: 'pointer' }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>How do I export my data to CSV?</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleSuggestionClick("What can I do on area insights?")}
              style={{ cursor: 'pointer' }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>What can I see on the Analytics page?</span>
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
      <TextModal
        onClose={() => {
          setIsTextModalVisible(false);
          setQuestion("");
        }}
        onAskFollowUp={handleAskFollowUp}
        question={question}
        isVisible={isTextModalVisible}
      />
    </>
  )
}

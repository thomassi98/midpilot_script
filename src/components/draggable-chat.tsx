"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  HelpCircle,
  Phone,
  CornerDownRight,
  AudioLines,
  Settings,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { CommandInput } from "cmdk"
import { CallingModal } from "./CallingModal"
import { TextModal } from "./TextModal"
import { useCallAI } from "../hooks/useCallAI"
import ConsentModal from "./consentModal"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import utility functions
import {
  isScriptHostedOn,
  extractEmail,
  fetchAccountDocument,
  getCookieValue,
} from "../utils/plaaceUtils"

// Constants for localStorage keys
const CONSENT_STATUS_KEY = "dataConsentGiven"
const CONSENT_TIMESTAMP_KEY = "dataConsentTimestamp"
const CONSENT_EMAIL_KEY = "dataConsentEmail"

// Define the type for pending actions
type PendingAction = { actionType: "callAI" | "toggleDataSharing" }

export function DraggableChat() {
  const [open, setOpen] = useState(false)
  const [isTextModalVisible, setIsTextModalVisible] = useState(false)
  const [question, setQuestion] = useState("")
  const [hasConsented, setHasConsented] = useState<boolean | undefined>(undefined) // Manage consent state
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false) // Control consent modal visibility
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null) // Store pending action
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const { isCalling, isConnecting, isMuted, startCall, endCall, toggleMute } =
    useCallAI()

  // State to hold the current user's email if available
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // Flag to indicate if the script is hosted on Plaace
  const isOnPlaace = isScriptHostedOn("plaace")

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
  }, [endCall])

  // Extract the user's email if we are on Plaace
  useEffect(() => {
    if (isOnPlaace) {
      // Fetch account document and extract email asynchronously
      fetchAccountDocument(getCookieValue("token_jwt") || "")
        .then((accountDocument) => {
          const email = extractEmail(accountDocument)
          setCurrentUserEmail(email)
        })
        .catch((error) => {
          console.error("Error fetching account document:", error)
          setCurrentUserEmail(null)
        })
    } else {
      // Not on Plaace, no email available
      setCurrentUserEmail(null)
    }
  }, [isOnPlaace])

  // Check if user has given consent on mount
  useEffect(() => {
    // Retrieve stored consent data
    const consentGiven = localStorage.getItem(CONSENT_STATUS_KEY)
    const consentTimestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY)

    if (isOnPlaace && currentUserEmail) {
      const storedEmail = localStorage.getItem(CONSENT_EMAIL_KEY)

      if (consentGiven && consentTimestamp && storedEmail) {
        if (storedEmail === currentUserEmail) {
          // Emails match, proceed to set consent status
          setHasConsented(consentGiven === "true")
        } else {
          // Emails do not match, clear stored consent data
          localStorage.removeItem(CONSENT_STATUS_KEY)
          localStorage.removeItem(CONSENT_TIMESTAMP_KEY)
          localStorage.removeItem(CONSENT_EMAIL_KEY)
          setHasConsented(undefined)
        }
      } else {
        // No consent data found, or incomplete data
        setHasConsented(undefined)
      }
    } else {
      // Not on Plaace, or email not available
      if (consentGiven && consentTimestamp) {
        setHasConsented(consentGiven === "true")
      } else {
        setHasConsented(undefined)
      }
    }
  }, [isOnPlaace, currentUserEmail])

  const handleClose = () => {
    endCall()
    setOpen(false)
    setIsTextModalVisible(false)
    setQuestion("")
  }

  const handleCallAI = () => {
    if (hasConsented === true) {
      if (isConnecting) return
      if (isCalling) {
        endCall()
      } else {
        startCall()
      }
      setOpen(false) // Close the CommandDialog when opening CallingModal
    } else {
      // Show consent modal and set the pending action
      setPendingAction({ actionType: "callAI" })
      setIsConsentModalVisible(true)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    toggleTextModal(suggestion)
  }

  const toggleTextModal = (question: string) => {
    setQuestion(question)
    setIsTextModalVisible(true)
    setOpen(false)
  }

  const handleConsent = (consent: boolean) => {
    setHasConsented(consent)
    if (consent) {
      // Store consent data along with timestamp
      localStorage.setItem(CONSENT_STATUS_KEY, consent.toString())
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString())
      if (isOnPlaace && currentUserEmail) {
        // If on Plaace and email is available, store the email
        localStorage.setItem(CONSENT_EMAIL_KEY, currentUserEmail)
      } else {
        // Not on Plaace or email not available, remove any stored email
        localStorage.removeItem(CONSENT_EMAIL_KEY)
      }
    } else {
      // Clear consent data if user does not consent
      localStorage.removeItem(CONSENT_STATUS_KEY)
      localStorage.removeItem(CONSENT_TIMESTAMP_KEY)
      localStorage.removeItem(CONSENT_EMAIL_KEY)
    }
    setIsConsentModalVisible(false)

    if (consent && pendingAction) {
      // Execute the pending action
      const action = pendingAction
      setPendingAction(null) // Clear pending action
      switch (action.actionType) {
        case "callAI":
          // Proceed with the call
          if (isConnecting) return
          if (isCalling) {
            endCall()
          } else {
            startCall()
          }
          setOpen(false)
          break
        case "toggleDataSharing":
          // Turn on data sharing
          localStorage.setItem('dataConsentGiven', 'true')
          setHasConsented(true)
          break
        default:
          break
      }
    } else {
      // Clear any pending actions
      setPendingAction(null)
    }
  }

  const handleConsentModalBack = () => {
    setIsConsentModalVisible(false)
    setPendingAction(null)
  }

  const toggleDataSharing = () => {
    if (hasConsented) {
      // Turning off data sharing
      localStorage.setItem('dataConsentGiven', 'false')
      setHasConsented(false)
    } else {
      // Turning on data sharing, show consent modal first
      setPendingAction({ actionType: "toggleDataSharing" })
      setIsConsentModalVisible(true)
    }
  }

  return (
    <>
      {/* Consent Modal */}
      {isConsentModalVisible && (
        <ConsentModal
          onConsent={handleConsent}
          onBack={handleConsentModalBack}
        />
      )}

      {/* Conditionally render the HelpCircle Button when no modals are open */}
      {!(isConnecting || isCalling || isTextModalVisible) && (
        <Button
          onClick={() => setOpen(true)}
          variant="default"
          size="icon"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            height: "56px",
            width: "56px",
            borderRadius: "9999px",
            backgroundColor: "black",
            color: "white",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "background-color 0.2s ease",
            zIndex: 999,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#1f2937")
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "black")}
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
        <div
          className="flex items-center space-x-4 p-2"
          style={{ padding: "6px" }}
        >
          <Button
            variant="default"
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
            onClick={handleCallAI}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call AI
          </Button>
          <div
            className="flex flex-1 items-center space-x-2"
            style={{ paddingLeft: "8px", paddingRight: "24px" }}
          >
            <CommandInput
              placeholder="Ask anything about Plaace..."
              className="w-full h-9 py-2 px-3 focus:outline-none focus:ring-0 border-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (e.currentTarget.value.trim() !== "") {
                    toggleTextModal(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
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
              </kbd>{" "}
              to get an answer.
            </p>
          </CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => handleSuggestionClick("How do I get started?")}
              style={{ cursor: "pointer" }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>How do I get started?</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSuggestionClick("How do I compare two areas?")
              }
              style={{ cursor: "pointer" }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>How do I compare two areas?</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSuggestionClick("What can I do on Area Insights?")
              }
              style={{ cursor: "pointer" }}
            >
              <CornerDownRight className="mr-2 h-4 w-4" />
              <span>What can I do on Area Insights?</span>
            </CommandItem>
          </CommandGroup>

            <div
              className="p-2 text-xs flex items-center justify-center"
              style={{
                marginTop: "12px",
                marginBottom: "12px",
                borderTop: "none",
                color: "#9BA3AF",
              }}
            >
              <span
                className="cursor-pointer flex items-center transition-colors duration-200"
                style={{ color: "unset" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9BA3AF")}
                onClick={() => setIsSettingsModalOpen(true)}
              >
                Share data with Plaace: {hasConsented ? "On" : "Off"}

              </span>
            </div>

        </CommandList>
      </CommandDialog>

      {/* Text Modal */}
      {isTextModalVisible && (
        <TextModal
          onClose={() => {
            setIsTextModalVisible(false)
            setQuestion("")
          }}
          question={question}
          isVisible={isTextModalVisible}
        />
      )}

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{  marginBottom: '0.8rem' }} >Data Sharing Settings</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto p-4 sm:p-6">
            <div>
              <div className="flex items-center justify-between">
                <div>Share conversations</div>
                <Checkbox
                  checked={hasConsented}
                  onCheckedChange={toggleDataSharing}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--token-text-secondary)', paddingRight: '12rem', marginTop: '0.75rem' }}>
              Allow Plaace to use your call audio and transcripts to improve their services.
              <a href="https://midpilot.com/privacy" target="_blank" style={{ textDecoration: 'underline', marginLeft: '0.25rem' }} rel="noreferrer">Learn more</a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

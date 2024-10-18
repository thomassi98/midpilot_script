'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React from 'react'
import { ArrowLeft, Link, Shield } from 'lucide-react'

export default function ConsentModal({
  onConsent,
  onBack,
}: {
  onConsent: (consent: boolean) => void
  onBack: () => void
}) {
  const [isOpen, setIsOpen] = useState(true) // Open by default

  const handleConsent = (consent: boolean) => {
    localStorage.setItem('dataConsentGiven', consent.toString())
    setIsOpen(false)
    onConsent(consent)
  }

  const handleBack = () => {
    setIsOpen(false)
    onBack()
  }
//TODO: Add a checkbox which enables continue button only if checked
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] sm:h-[400px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            We record conversations
          </DialogTitle>
          <DialogDescription>
            In compliance with the General Data Protection Regulation (GDPR), we want you to know we process and store recordings to improve our product.
          </DialogDescription>
        </DialogHeader>
            <div className="my-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Data we collect</AccordionTrigger>
                <AccordionContent className='pb-2'>
                <ul className="list-disc pl-5 text-sm text-muted-foreground ">
                <li style={{ listStyle: 'inside' }} className="text-sm mt-2 leading-relaxed">Conversation transcript (Deleted after two years)</li>
                <li style={{ listStyle: 'inside' }} className="text-sm mt-2 leading-relaxed">Conversation audio (Deleted after two years)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>
          <div className="my-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Data is only used to</AccordionTrigger>
                <AccordionContent className='pb-2'>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li style={{ listStyle: 'inside' }}className="text-sm mt-2 leading-relaxed">To understand how our service is used</li>
                    <li style={{ listStyle: 'inside' }}className="text-sm mt-2 leading-relaxed">To improve our service and user experience</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        <div className="flex-grow overflow-auto py-4">
          <div className="text-sm text-muted-foreground">
            <p>
              By clicking &quot;Continue&quot;, you agree to our data collection practices as described. 
              Read more in our <span style={{ textDecoration: 'underline' }}><a href="https://www.midpilot.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a></span>.
            </p>
          </div>
        </div>
        <DialogFooter style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <>
              <Button
                style={{ marginLeft: "auto", marginRight: "0" }}
                onClick={() => handleConsent(true)}
              >
                Continue
              </Button>
            </>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

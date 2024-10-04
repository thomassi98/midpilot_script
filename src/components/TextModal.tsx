"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatHistory from "./ChatHistory";
import { getGuide, Message } from "../services/getGuide";

interface TextModalProps {
  onClose: () => void;
  question: string;
  isVisible: boolean;
}

const getAgentId = (): string | null => {
  const scriptTag = document.currentScript || document.querySelector('script[agent-id]');
  return scriptTag ? scriptTag.getAttribute('agent-id') : null;
};



export function TextModal({ onClose, question, isVisible }: TextModalProps) {
  const constraintsRef = useRef(null);
  const sidebarRef = useRef(null);
  const width = useMotionValue(300);
  const controls = useAnimation();
  const [constraints, setConstraints] = useState({ min: 300, max: 300 });
  const x = useMotionValue(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const initialWidth = useMotionValue(300);
  const minimizedWidth = 300;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followUpQuestion, setFollowUpQuestion] = useState("");

  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConstraints({ min: 300, max: window.innerWidth });
    const handleResize = () => {
      setConstraints({ min: 300, max: window.innerWidth });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (question) {
      const initialConversation: Message[] = [{ role: "user", content: question }];
      setConversation(initialConversation);
      fetchGuide(initialConversation);
    }
  }, [question]);

  async function fetchGuide(conversation: Message[]) {
    try {
      setIsLoading(true);
      setError(null);
      const agentId = getAgentId();
      if (!agentId) {
        console.error('Agent ID not provided. Please include agent-id attribute in the script tag.');
        return;
      }
      const assistantMessage = await getGuide(agentId, conversation);
      const newConversation = [...conversation, assistantMessage];
      setConversation(newConversation);
    } catch (error) {
      console.error("Error fetching guide:", error);
      setError("Failed to fetch response.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleAskFollowUp = (followUpQuestion: string) => {
    if (!followUpQuestion.trim()) return;
    const userMessage: Message = { role: "user", content: followUpQuestion.trim() };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    fetchGuide(newConversation);
    setFollowUpQuestion("");
  };

  const handleDragEnd = (event: any, info: any) => {
    const newPosition = { x: position.x + info.delta.x, y: position.y + info.delta.y };
    setPosition(newPosition);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      controls.start({ width: minimizedWidth, height: 40 });
    } else {
      controls.start({ width: initialWidth.get(), height: '100vh' });
    }
  };

  const handleClose = () => {
    setIsMinimized(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0" style={{ zIndex: 10000 }}>
      <motion.div
        ref={sidebarRef}
        style={{
          width: isMinimized ? minimizedWidth : width,
          height: isMinimized ? 40 : '100vh',
          zIndex: 10001,
        }}
        drag={isMinimized ? false : true}
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
        <div className="bg-gray-100 flex items-center justify-between p-2 h-10 cursor-move">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMinimize}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            {/* <ChatHistory /> */}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow space-y-4 overflow-y-auto p-4">
              <div className="flex flex-col space-y-4">
                {conversation.map((message, index) => (
                  <div
                    key={index}
                        className={`flex ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"} items-start`}
                    >
                    <div
                      className={`${
                        message.role === "assistant" ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-black"} rounded-md p-2 max-w-xs`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-center items-center">
                    <p className="text-gray-500 text-sm">Loading...</p>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center items-center">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-border">
              <p style={{ fontSize: '0.625rem', color: '#6B7280', paddingBottom: '1rem' }}>
                AI can make mistakes. Please double-check responses.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskFollowUp(followUpQuestion);
                }}
              >
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
        {!isMinimized && (
          <div
            className="absolute inset-y-0 right-0 w-1 cursor-ew-resize"
            style={{ zIndex: 10002 }}
            onMouseDown={() => {
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        )}
      </motion.div>
    </div>
  );

  function handleMouseMove(e: MouseEvent) {
    const newWidth = e.clientX;
    width.set(Math.min(Math.max(newWidth, constraints.min), constraints.max));
    x.set(0);
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleDragEnd(null, { delta: { x: 0, y: 0 } });
  }
}

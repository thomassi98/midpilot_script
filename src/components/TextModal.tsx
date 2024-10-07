"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { X, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGuide, Message } from "../services/getGuide";

interface TextModalProps {
  onClose: () => void;
  question: string;
  isVisible: boolean;
}

const getAgentId = (): string | null => {
  const scriptTag =
    document.currentScript || document.querySelector("script[agent-id]");
  return scriptTag ? scriptTag.getAttribute("agent-id") : null;
};

export function TextModal({
  onClose,
  question,
  isVisible,
}: TextModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const latestUserMessageRef = useRef<HTMLDivElement>(null);

  const [modalWidth] = useState(300); // Fixed width, no resizing
  const [isMinimized, setIsMinimized] = useState(false);

  // Modal height
  const [modalHeight, setModalHeight] = useState<number>(0);
  const minHeight = 200;
  const [maxHeight, setMaxHeight] = useState<number>(0);

  const [followUpQuestion, setFollowUpQuestion] = useState("");

  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize drag controls
  const dragControls = useDragControls();

  // Drag constraints
  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    right: 0,
  });

  // Store previous modal height to restore after minimizing
  const [prevModalHeight, setPrevModalHeight] = useState<number>(0);

  const [chevronHover, setChevronHover] = useState(false);
  const [closeHover, setCloseHover] = useState(false);

  // State to track resizing
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Set initial modal height to 2/3 of the viewport after component mounts
    const initialHeight = window.innerHeight * 0.66;
    setModalHeight(initialHeight);
    setMaxHeight(window.innerHeight - 100);

    updateDragConstraints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update maxHeight and drag constraints on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(window.innerHeight - 100);
      updateDragConstraints();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [modalWidth]);

  // Update drag constraints when modalWidth or isMinimized changes
  useEffect(() => {
    updateDragConstraints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalWidth, isMinimized]);

  useEffect(() => {
    if (question) {
      const initialConversation: Message[] = [
        { role: "user", content: question },
      ];
      setConversation(initialConversation);
      fetchGuide(initialConversation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    // Scroll to the latest user message whenever the conversation changes
    if (latestUserMessageRef.current) {
      latestUserMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [conversation]);

  async function fetchGuide(conversation: Message[]) {
    try {
      setIsLoading(true);
      setError(null);
      const agentId = getAgentId();
      if (!agentId) {
        console.error(
          "Agent ID not provided. Please include agent-id attribute in the script tag."
        );
        return;
      }
      const assistantMessage = await getGuide(agentId, conversation);
      // Ensure the assistant message has the correct role
      const newAssistantMessage = { ...assistantMessage, role: "assistant" };
      const newConversation = [...conversation, newAssistantMessage];
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
    const userMessage: Message = {
      role: "user",
      content: followUpQuestion.trim(),
    };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    fetchGuide(newConversation);
    setFollowUpQuestion("");
  };

  const toggleMinimize = () => {
    if (!isMinimized) {
      // Save current height before minimizing
      setPrevModalHeight(modalHeight);
    } else {
      // Restore previous height when maximizing
      setModalHeight(prevModalHeight);
    }
    setIsMinimized(!isMinimized);

    // Update drag constraints after changing minimized state
    updateDragConstraints();
  };

  const handleClose = () => {
    onClose();
  };

  const updateDragConstraints = () => {
    const viewportWidth = window.innerWidth;
    const leftBoundary = -(viewportWidth - modalWidth);
    const rightBoundary = 0;

    setDragConstraints({
      left: leftBoundary,
      right: rightBoundary,
    });
  };

  // **Conditional Rendering based on isVisible**
  if (!isVisible) {
    return null;
  }

  return (
    <div>
      <motion.div
        ref={modalRef}
        style={{
          width: modalWidth,
          height: isMinimized ? 'auto' : modalHeight,
          position: "fixed",
          bottom: 0,
          right: 0,               // Changed from 'left: 0' to 'right: 0'
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          maxHeight: maxHeight,
        }}
        className="bg-white rounded-md shadow-lg"
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragMomentum={false}
        dragListener={false}          // Disable default drag listener
        dragControls={dragControls}   // Attach drag controls
      >
        {/* Top Bar */}
        <motion.div
          className="bg-white rounded-md px-4 h-12 flex items-center justify-between"
          style={{ flexShrink: 0, cursor: "move" }}
          onMouseDown={handleDragOrResizeMouseDown}
          onPointerDown={(event) => {
            if (!isResizing) {
              dragControls.start(event);
            }
          }}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              onMouseEnter={() => setChevronHover(true)}
              onMouseLeave={() => setChevronHover(false)}
              style={{
                backgroundColor: chevronHover ? '#f3f4f6' : 'transparent',
              }}
            >
              {isMinimized ? (
                <ChevronUp className="h-4 w-4 text-black" />
              ) : (
                <ChevronDown className="h-4 w-4 text-black" />
              )}
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              onMouseEnter={() => setCloseHover(true)}
              onMouseLeave={() => setCloseHover(false)}
              style={{
                backgroundColor: closeHover ? '#f3f4f6' : 'transparent',
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Modal Content */}
        {!isMinimized && (
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow space-y-4 overflow-y-auto px-4 pt-6">
              {/* Messages */}
              {conversation.map((message, index) => (
                <div
                  key={index}
                  ref={message.role === "user" ? latestUserMessageRef : null}
                  className={`flex ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"} items-start`}
                >
                  {message.role === "user" ? (
                    <div className="flex flex-col space-y-4 mb-2">
                      <div>
                        <h3 style={{ fontSize: '0.625rem', color: '#6B7280', paddingBottom: '0.25rem' }}>Your question:</h3>
                        <p className="font-semibold text-lg text-gray-800">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8" style={{ marginBottom: '32px' }}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  )}
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
            {/* Bottom Bar */}
            <div className="px-4 pt-4 bg-white border-t border-border" style={{ marginBottom: '24px' }}>
              {/* Form content */}
              <div className="mt-4 mb-4">
                <p style={{ fontSize: '0.625rem', color: '#6B7280', marginBottom: '16px', marginTop: '16px' }}>
                  AI can make mistakes. Please double-check responses.
                </p>
              </div>
              <form
                style={{ margin: '0px' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskFollowUp(followUpQuestion);
                }}
              >
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Ask follow-up"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    className="flex-grow bg-white text-black"
                  />
                  <Button
                    type="submit"
                    disabled={!followUpQuestion.trim()}
                    variant={
                      followUpQuestion.trim() ? "default" : "secondary"
                    }
                  >
                    <ChevronRight className="h-4 w-4 text-black" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  function handleDragOrResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = modalHeight;

    function onMouseMove(event: MouseEvent) {
      const deltaY = event.clientY - startY;
      const newHeight = startHeight - deltaY;
      const clampedHeight = Math.min(
        Math.max(newHeight, minHeight),
        maxHeight
      );
      setModalHeight(clampedHeight);
    }

    function onMouseUp() {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
}
"use client"

import * as React from "react"
import { History } from "lucide-react"

import { Button } from "@components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import ShadowPortal from "./ShadowPortal";

interface ChatThread {
  id: string
  title: string
  timestamp: Date
}

interface CategoryProps {
  title: string
  threads: ChatThread[]
  onSelect: (thread: ChatThread) => void
}

const Category: React.FC<CategoryProps> = ({ title, threads, onSelect }) => (
  <div className="mb-8">
    <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">{title}</h3>
    {threads.map((thread) => (
      <Button
        key={thread.id}
        variant="ghost"
        className="w-full justify-start text-left font-normal"
        onClick={() => onSelect(thread)}
      >
        {thread.title}
      </Button>
    ))}
  </div>
)

const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const isYesterday = (date: Date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
}

const isWithinDays = (date: Date, days: number) => {
  const now = new Date()
  const timeDiff = now.getTime() - date.getTime()
  const daysDiff = timeDiff / (1000 * 3600 * 24)
  return daysDiff <= days && daysDiff > (days === 7 ? 1 : 7)
}

export default function ChatHistory() {
  const [selectedThread, setSelectedThread] = React.useState<ChatThread | null>(null)

  // Mock data for chat threads
  const chatThreads: ChatThread[] = [
    { id: "1", title: "Project Discussion", timestamp: new Date() },
    { id: "2", title: "Bug Report #1234", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: "3", title: "New Feature Request", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: "4", title: "Team Standup", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: "5", title: "Client Feedback", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: "6", title: "Code Review", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { id: "7", title: "Product Roadmap", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { id: "8", title: "User Research", timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
  ]

  const categorizeThreads = (threads: ChatThread[]) => {
    const today = threads.filter(thread => isToday(thread.timestamp))
    const yesterday = threads.filter(thread => isYesterday(thread.timestamp))
    const previous7Days = threads.filter(thread => isWithinDays(thread.timestamp, 7))
    const previous30Days = threads.filter(thread => isWithinDays(thread.timestamp, 30))
    const older = threads.filter(thread => thread.timestamp < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    return { today, yesterday, previous7Days, previous30Days, older }
  }

  const categorizedThreads = categorizeThreads(chatThreads)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md"
          aria-label="View chat history"
        >
          <History className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <ShadowPortal>
        <PopoverContent className="w-[250px] p-0 z-50">
          <ScrollArea className="h-[400px] px-3 py-2">
            {categorizedThreads.today.length > 0 && (
              <Category title="Today" threads={categorizedThreads.today} onSelect={setSelectedThread} />
            )}
            {categorizedThreads.yesterday.length > 0 && (
              <Category title="Yesterday" threads={categorizedThreads.yesterday} onSelect={setSelectedThread} />
            )}
            {categorizedThreads.previous7Days.length > 0 && (
              <Category title="Previous 7 days" threads={categorizedThreads.previous7Days} onSelect={setSelectedThread} />
            )}
            {categorizedThreads.previous30Days.length > 0 && (
              <Category title="Previous 30 days" threads={categorizedThreads.previous30Days} onSelect={setSelectedThread} />
            )}
            {categorizedThreads.older.length > 0 && (
              <Category title="Older" threads={categorizedThreads.older} onSelect={setSelectedThread} />
            )}
          </ScrollArea>
        </PopoverContent>
      </ShadowPortal>
    </Popover>
  )
}
"use client"

import { useEffect, useRef, useState } from "react"
import { Download, ChevronDown, ChevronRight } from "lucide-react"
import { useLogs, LogType } from "@/lib/log-context"
import { Button } from "@/components/ui/button"

export function WebSocketLogs() {
    const { logs, allLogs } = useLogs()
    const logsEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
    const [isUserScrolling, setIsUserScrolling] = useState(false)

    // Check if user is at the absolute bottom of the scroll container
    const isAtBottom = () => {
        const container = scrollContainerRef.current
        if (!container) return true

        const threshold = 20 // pixels from bottom
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight

        return scrollHeight - scrollTop - clientHeight <= threshold
    }

    useEffect(() => {
        // Only auto-scroll if user is at the absolute bottom (not manually scrolling up)
        if (!isUserScrolling && isAtBottom()) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [logs, isUserScrolling])

    // Handle scroll events to detect manual scrolling
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        let scrollTimeout: NodeJS.Timeout

        const handleScroll = () => {
            setIsUserScrolling(true)

            // Clear existing timeout
            clearTimeout(scrollTimeout)

            // Reset isUserScrolling after user stops scrolling
            scrollTimeout = setTimeout(() => {
                setIsUserScrolling(false)
            }, 150)
        }

        container.addEventListener('scroll', handleScroll)

        return () => {
            container.removeEventListener('scroll', handleScroll)
            clearTimeout(scrollTimeout)
        }
    }, [])

    const toggleLog = (logId: string) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev)
            if (newSet.has(logId)) {
                newSet.delete(logId)
            } else {
                newSet.add(logId)
            }
            return newSet
        })
    }

    const getLogColor = (type: LogType, message: string) => {
        // Check if this is an API log (starts with GET, POST, or DELETE)
        const isApiLog = message.startsWith("GET ") || message.startsWith("POST ") || message.startsWith("DELETE ")

        // All API logs should be white
        if (isApiLog) {
            return "text-white"
        }

        // WebSocket send and receive logs should be light blue
        if (type === "receive" || type === "send") {
            return "text-sky-300"
        }

        switch (type) {
            case "error":
                return "text-red-500"
            default:
                return "text-foreground"
        }
    }

    const downloadLogs = () => {
        if (allLogs.length === 0) {
            return
        }

        const logsData = allLogs.map(log => ({
            timestamp: log.timestamp.toISOString(),
            type: log.type,
            message: log.message,
            payload: log.payload,
        }))

        const dataStr = JSON.stringify(logsData, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `logs-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="flex h-full flex-col rounded-sm border border-white/30 bg-black min-h-0">
            <div className="flex items-center justify-between border-b border-white/30 px-1 py-0.5 flex-shrink-0">
                <div className="flex items-center gap-1">
                    <h2 className="text-xs">logs</h2>
                    <Button
                        variant="ghost"
                        className="!h-3 !w-3 !p-0 !min-w-0 [&_svg]:!h-3 [&_svg]:!w-3 hover:opacity-70 active:opacity-50"
                        onClick={downloadLogs}
                        disabled={allLogs.length === 0}
                        title="Download all logs"
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className="logs-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-1 font-mono text-[10px] min-h-0"
            >
                {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground text-[10px]">
                        No logs yet
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {logs.map(log => {
                            const isExpanded = expandedLogs.has(log.id)
                            const isCollapsible = log.payload !== undefined

                            return (
                                <div
                                    key={log.id}
                                    className={`${getLogColor(log.type, log.message)}`}
                                >
                                    <div
                                        className={`flex items-baseline gap-1 ${isCollapsible ? "cursor-pointer hover:bg-white/5" : ""}`}
                                        onClick={() => isCollapsible && toggleLog(log.id)}
                                    >
                                        {isCollapsible && (
                                            <span className="flex-shrink-0">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-2.5 w-2.5" />
                                                ) : (
                                                    <ChevronRight className="h-2.5 w-2.5" />
                                                )}
                                            </span>
                                        )}
                                        {!isCollapsible && <span className="w-2.5 flex-shrink-0" />}
                                        <span className="text-muted-foreground whitespace-nowrap text-[10px] leading-[1.2] flex-shrink-0">
                                            {log.timestamp.toLocaleTimeString()}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-[10px] leading-[1.2]">
                                                {log.message}
                                            </span>
                                        </div>
                                    </div>
                                    {isExpanded && log.payload !== undefined && (
                                        <div className="ml-6 mt-0.5 mb-1 pl-1 border-l border-white/20">
                                            <pre className="text-[9px] text-muted-foreground whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                                {typeof log.payload === "string"
                                                    ? log.payload
                                                    : JSON.stringify(log.payload, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        <div ref={logsEndRef} />
                    </div>
                )}
            </div>
        </div>
    )
}


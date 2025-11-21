"use client"

import { useEffect, useState, useRef } from "react"
import { Download } from "lucide-react"
import { useLogs, LogType } from "@/lib/log-context"
import { Button } from "@/components/ui/button"

interface WebSocketLogsProps {
    wsUrl: string
}

export function WebSocketLogs({ wsUrl }: WebSocketLogsProps) {
    const { logs, addLog } = useLogs()
    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Close existing connection if URL changes
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        // Initialize WebSocket connection
        const connectWebSocket = () => {
            if (!wsUrl || wsUrl.trim() === "") {
                addLog("WebSocket URL is empty", "error")
                return
            }

            try {
                const ws = new WebSocket(wsUrl)

                ws.onopen = () => {
                    setIsConnected(true)
                    addLog("Connected to WebSocket", "connection")
                }

                ws.onmessage = event => {
                    addLog(`Received: ${event.data}`, "message")
                }

                ws.onerror = error => {
                    addLog(`WebSocket error: ${error}`, "error")
                }

                ws.onclose = () => {
                    setIsConnected(false)
                    addLog("WebSocket connection closed", "connection")
                    // Attempt to reconnect after 3 seconds
                    setTimeout(connectWebSocket, 3000)
                }

                wsRef.current = ws
            } catch (error) {
                addLog(`Failed to connect: ${error}`, "error")
            }
        }

        connectWebSocket()

        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [wsUrl, addLog])

    useEffect(() => {
        // Auto-scroll to bottom when new logs arrive
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    const getLogColor = (type: LogType) => {
        switch (type) {
            case "error":
                return "text-destructive"
            case "connection":
                return "text-primary"
            case "api-request":
                return "text-blue-400"
            case "api-response":
                return "text-green-400"
            default:
                return "text-foreground"
        }
    }

    const downloadLogs = () => {
        if (logs.length === 0) {
            return
        }

        const logsData = logs.map(log => ({
            timestamp: log.timestamp.toISOString(),
            type: log.type,
            message: log.message,
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
                        className="!h-3 !w-3 !p-0 !min-w-0 [&_svg]:!h-3 [&_svg]:!w-3 active:opacity-50"
                        onClick={downloadLogs}
                        disabled={logs.length === 0}
                        title="Download logs"
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <div
                        className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                        {isConnected ? "Connected" : "Disconnected"}
                    </span>

                </div>
            </div>
            <div className="flex-1 overflow-auto p-1 font-mono text-xs min-h-0">
                {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground text-xs">
                        Waiting for WebSocket messages...
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {logs.map(log => (
                            <div
                                key={log.id}
                                className={`flex items-start gap-1 ${getLogColor(log.type)}`}
                            >
                                <span className="text-muted-foreground whitespace-nowrap text-xs leading-tight">
                                    {log.timestamp.toLocaleTimeString()}
                                </span>
                                <pre className="flex-1 break-words whitespace-pre-wrap font-mono text-xs leading-tight">
                                    {log.message}
                                </pre>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}
            </div>
        </div>
    )
}


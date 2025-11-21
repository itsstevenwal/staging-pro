"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export type LogType = "message" | "error" | "connection" | "api-request" | "api-response"

export interface LogEntry {
    id: string
    timestamp: Date
    message: string
    type: LogType
}

interface LogContextType {
    logs: LogEntry[]
    addLog: (message: string, type: LogType) => void
    clearLogs: () => void
}

const LogContext = createContext<LogContextType | undefined>(undefined)

export function LogProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<LogEntry[]>([])

    const addLog = useCallback((message: string, type: LogType) => {
        const logEntry: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            message,
            type,
        }
        setLogs(prev => [...prev, logEntry].slice(-100)) // Keep last 100 logs
    }, [])

    const clearLogs = useCallback(() => {
        setLogs([])
    }, [])

    return (
        <LogContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </LogContext.Provider>
    )
}

export function useLogs() {
    const context = useContext(LogContext)
    if (context === undefined) {
        throw new Error("useLogs must be used within a LogProvider")
    }
    return context
}


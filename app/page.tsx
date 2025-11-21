"use client"

import { Orderbook } from "@/components/Orderbook"
import { TradeTicket } from "@/components/TradeTicket"
import { WebSocketLogs } from "@/components/WebSocketLogs"

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-black">
      <header className="border-b border-white/30 p-2">
        <h1 className="text-lg font-bold">staging-pro</h1>
      </header>
      <main className="grid grid-cols-[4fr_3fr_3fr] flex-1 gap-2 overflow-hidden p-2">
        {/* First Column - Orderbook and Logs (4 parts) */}
        <div className="flex flex-col gap-2 min-h-0 min-w-0">
          <div className="flex-shrink-0">
            <Orderbook />
          </div>
          <div className="flex-1 min-h-0">
            <WebSocketLogs />
          </div>
        </div>

        {/* Second Column - First Trade Ticket (3 parts) */}
        <div className="flex flex-col min-h-0 min-w-0">
          <TradeTicket />
        </div>

        {/* Third Column - Second Trade Ticket (3 parts) */}
        <div className="flex flex-col min-h-0 min-w-0">
          <TradeTicket
            defaultAddress="0xD527CCdBEB6478488c848465F9947bDA3C2e6994"
            defaultPk="61925f6e49905e7551884129c1d46b3661d6b566173feee556737743162bec7d"
            defaultClobApiKey="1229b503-3124-94d7-0b28-46e64418510f"
            defaultClobSecret="1vslCNSHeKXnPIsitiDirDrQ8sPPI4hyXYqIXkBwfPs="
            defaultClobPassPhrase="8f25643b36d0c8be522646356010f3b1c61c1b47eada77ad8b4b58e9be7c87c0"
          />
        </div>
      </main>
    </div>
  )
}

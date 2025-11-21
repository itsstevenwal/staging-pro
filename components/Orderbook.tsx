"use client"

import { useState } from "react"
import { Copy } from "lucide-react"

interface Order {
  price: number
  size: number
  total: number
}

interface OrderbookData {
  bids: Order[]
  asks: Order[]
}

export function Orderbook() {
  const [activeTab, setActiveTab] = useState<"yes" | "no">("yes")
  const [yesTokenId, setYesTokenId] = useState<string>("71321045679252212594626385532706912750332728571942532289631379312455583992563")
  const [noTokenId, setNoTokenId] = useState<string>("52114319501245915516055106046884209969926127482827954674443846427813813222426")

  // Yes orderbook data
  const [yesOrderbook, setYesOrderbook] = useState<OrderbookData>({
    bids: [
      { price: 0.65, size: 100, total: 100 },
      { price: 0.64, size: 150, total: 250 },
      { price: 0.63, size: 200, total: 450 },
      { price: 0.62, size: 120, total: 570 },
      { price: 0.61, size: 180, total: 750 },
    ],
    asks: [
      { price: 0.66, size: 100, total: 100 },
      { price: 0.67, size: 150, total: 250 },
      { price: 0.68, size: 200, total: 450 },
      { price: 0.69, size: 120, total: 570 },
      { price: 0.70, size: 180, total: 750 },
    ],
  })

  // No orderbook data
  const [noOrderbook, setNoOrderbook] = useState<OrderbookData>({
    bids: [
      { price: 0.30, size: 200, total: 200 },
      { price: 0.29, size: 180, total: 380 },
      { price: 0.28, size: 150, total: 530 },
      { price: 0.27, size: 220, total: 750 },
      { price: 0.26, size: 100, total: 850 },
    ],
    asks: [
      { price: 0.31, size: 200, total: 200 },
      { price: 0.32, size: 180, total: 380 },
      { price: 0.33, size: 150, total: 530 },
      { price: 0.34, size: 220, total: 750 },
      { price: 0.35, size: 100, total: 850 },
    ],
  })

  const currentOrderbook = activeTab === "yes" ? yesOrderbook : noOrderbook
  const { bids, asks } = currentOrderbook

  // Sort asks in descending order (highest price first)
  const sortedAsks = [...asks].sort((a, b) => b.price - a.price)

  // Always show exactly 8 levels on each side, pad with empty if needed
  const limitedBids: (Order | null)[] = [...bids.slice(0, 8)]
  const limitedAsks: (Order | null)[] = [...sortedAsks.slice(0, 8)]

  // Pad to exactly 8 rows
  // Bids: pad at the bottom (push)
  while (limitedBids.length < 8) {
    limitedBids.push(null)
  }
  // Asks: pad at the top (unshift) so empty rows appear at the top
  while (limitedAsks.length < 8) {
    limitedAsks.unshift(null)
  }

  const maxTotal = Math.max(
    ...limitedBids.filter(b => b !== null).map(b => b.total),
    ...limitedAsks.filter(a => a !== null).map(a => a.total),
    1 // fallback to 1 to avoid division by zero
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-sm border border-white/30 bg-black">
      <div className="border-b border-white/30">
        <div className="px-1 py-0.5">
          <h2 className="text-xs">orderbook</h2>
        </div>
        <div className="px-1 py-1 space-y-1 border-t border-white/30">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground whitespace-nowrap w-3">Y</label>
            <input
              type="text"
              value={yesTokenId}
              onChange={(e) => setYesTokenId(e.target.value)}
              className="flex-1 px-1 py-0.5 text-xs bg-black border border-white/30 rounded-sm focus:outline-none focus:border-white/50"
            />
            <button
              onClick={() => copyToClipboard(yesTokenId)}
              className="p-0.5 text-white hover:bg-white/5 active:opacity-50 transition-colors"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground whitespace-nowrap w-3">N</label>
            <input
              type="text"
              value={noTokenId}
              onChange={(e) => setNoTokenId(e.target.value)}
              className="flex-1 px-1 py-0.5 text-xs bg-black border border-white/30 rounded-sm focus:outline-none focus:border-white/50"
            />
            <button
              onClick={() => copyToClipboard(noTokenId)}
              className="p-0.5 text-white hover:bg-white/5 active:opacity-50 transition-colors"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="flex border-t border-white/30">
          <button
            onClick={() => setActiveTab("yes")}
            className={`flex-1 px-1 flex items-center justify-center border-r border-white/30 text-xs font-medium transition-colors ${activeTab === "yes"
              ? "bg-white/10 text-white"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            style={{ height: '24px' }}
          >
            Yes
          </button>
          <button
            onClick={() => setActiveTab("no")}
            className={`flex-1 px-1 flex items-center justify-center text-xs font-medium transition-colors ${activeTab === "no"
              ? "bg-white/10 text-white"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            style={{ height: '24px' }}
          >
            No
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 overflow-x-auto">
        {/* Asks (Sell Orders) */}
        <div className="space-y-0 min-w-max">
          {limitedAsks.map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="relative flex items-center justify-between px-1 py-0.5 text-xs hover:bg-accent"
            >
              {ask && (
                <div
                  className="absolute left-0 top-0 h-full bg-red-500/40"
                  style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                />
              )}
              <div className="relative z-10 flex w-full items-center justify-between gap-2 whitespace-nowrap">
                {ask ? (
                  <>
                    <span className="text-red-500">{ask.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">{ask.size}</span>
                    <span className="text-muted-foreground">{ask.total}</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">—</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="border-y border-white/30 bg-muted/50 px-1 py-0.5 text-center text-xs font-medium">
          <div className="text-muted-foreground">
            Spread: {limitedAsks[0] && limitedBids[0] && limitedAsks[0] !== null && limitedBids[0] !== null ? (limitedAsks[0].price - limitedBids[0].price).toFixed(4) : "0.0000"}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0">
          {limitedBids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="relative flex items-center justify-between px-1 py-0.5 text-xs hover:bg-accent"
            >
              {bid && (
                <div
                  className="absolute left-0 top-0 h-full bg-green-500/40"
                  style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                />
              )}
              <div className="relative z-10 flex w-full items-center justify-between gap-2 whitespace-nowrap">
                {bid ? (
                  <>
                    <span className="text-green-500">{bid.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">{bid.size}</span>
                    <span className="text-muted-foreground">{bid.total}</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">—</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


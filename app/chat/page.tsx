"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { shops } from "@/lib/mock-data"
import { Search, MessageCircle, MoreVertical, CheckCheck } from "lucide-react"

export default function ChatListPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    // Mock chat data derived from shops
    const chats = shops.map((shop, index) => ({
        id: shop.id,
        name: shop.name,
        avatar: shop.image, // Using shop image as avatar
        lastMessage: index === 0 ? "Is the item still available for trade?" :
            index === 1 ? "I can offer 3 sacks of rice." :
                "Thanks for the smooth transaction!",
        time: index === 0 ? "2m ago" : index === 1 ? "1h ago" : "1d ago",
        unread: index === 0 ? 2 : 0,
        online: index < 2 // First two shops are "online"
    }))

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                    <button className="p-2 rounded-full hover:bg-secondary transition-colors">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary/50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="px-4 py-2 space-y-1">
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => router.push(`/chat/${chat.id}`)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/40 active:bg-secondary/60 transition-colors cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-full overflow-hidden border border-border">
                                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                            </div>
                            {chat.online && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className={`text-sm truncate pr-2 ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {chat.lastMessage}
                                </p>
                                {chat.unread > 0 ? (
                                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                        {chat.unread}
                                    </span>
                                ) : (
                                    <CheckCheck className="w-4 h-4 text-muted-foreground/50" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredChats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No messages found</h3>
                        <p className="text-muted-foreground text-sm">Try searching for a different shop.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

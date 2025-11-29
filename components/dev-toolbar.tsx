"use client"

import { User, Store, GripHorizontal } from "lucide-react"
import { motion } from "framer-motion"

export function DevToolbar() {
  const loginAsBuyer = () => {
    window.location.href = "/?test_user=buyer_1"
  }

  const loginAsSeller = () => {
    window.location.href = "/marketplace?test_user=shop_1"
  }

  return (
    <motion.div 
      drag
      dragMomentum={false}
      // Start position (bottom-left)
      initial={{ x: 0, y: 0 }}
      className="fixed bottom-24 left-4 z-[100] flex flex-col gap-2 cursor-grab active:cursor-grabbing"
    >
      <div className="bg-black/80 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs">
        {/* Drag Handle */}
        <div className="flex justify-center mb-2 opacity-50">
            <GripHorizontal className="w-4 h-4" />
        </div>
        
        <p className="font-bold mb-2 text-center uppercase tracking-widest text-white/50 text-[10px] select-none">
          Hackathon Dev
        </p>
        <div className="flex flex-col gap-2">
          <button 
            onClick={loginAsBuyer}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all font-bold shadow-lg active:scale-95"
            title="Switch to Customer Role"
          >
            <User className="w-4 h-4" /> 
            <span>Local Customer</span>
          </button>
          
          <button 
            onClick={loginAsSeller}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all font-bold shadow-lg active:scale-95"
            title="Switch to Shop Owner Role"
          >
            <Store className="w-4 h-4" /> 
            <span>Local Business</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from "framer-motion"
import Shimmer from "./Shimmer"

export default function MediaPageSkeleton() {
  const widths = [45, 30, 50, 35, 40, 25, 55, 30]
  const subWidths = [20, 25, 15, 30, 20, 15, 25, 20]
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col h-full pr-4 pb-2"
    >
      <div className="flex-none mt-6 flex items-stretch justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Shimmer width={100} height={100} rounded="6px" />
          </div>
          <div className="flex flex-col min-w-0 flex-1 gap-3">
            <Shimmer width="40%" height={24} rounded="4px" />
            <Shimmer width="20%" height={12} rounded="4px" />
            <div className="mt-1 flex items-center gap-2">
              <Shimmer width={90} height={28} rounded="999px" />
              <Shimmer width={110} height={28} rounded="999px" />
              <Shimmer width={28} height={28} rounded="999px" />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 pl-4 border-l border-white/10 min-w-[140px]">
           <Shimmer width="80%" height={12} rounded="4px" />
           <Shimmer width="70%" height={12} rounded="4px" />
           <Shimmer width="90%" height={12} rounded="4px" />
           <Shimmer width="60%" height={12} rounded="4px" />
        </div>
      </div>

      <div className="flex-none grid grid-cols-[32px_minmax(0,2.5fr)_minmax(0,2fr)_50px_32px_32px] gap-3 px-4 py-2 mt-6">
        <Shimmer height={12} rounded="4px" />
        <Shimmer height={12} rounded="4px" />
        <Shimmer height={12} rounded="4px" />
        <Shimmer height={12} rounded="4px" />
        <Shimmer height={12} rounded="4px" />
        <Shimmer height={12} rounded="4px" />
      </div>

      <div className="flex-1 overflow-y-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg mb-8 mt-2">
        <div className="flex flex-col">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0 h-[56px]">
              <div className="flex items-center justify-center w-[32px]">
                 <Shimmer width={16} height={16} rounded="4px" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Shimmer width={`${widths[i]}%`} height={12} rounded="4px" />
                <Shimmer width={`${subWidths[i]}%`} height={10} rounded="4px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

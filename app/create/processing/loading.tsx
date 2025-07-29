import { Loader2 } from "lucide-react"

export default function ProcessingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#FF6B35]" />
        <h2 className="text-xl font-bold text-[#2D3748] mb-2">Preparando sua trilha</h2>
        <p className="text-[#718096]">Isso pode levar alguns segundos...</p>
      </div>
    </div>
  )
}

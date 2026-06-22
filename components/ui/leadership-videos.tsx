import { PlayCircle } from "lucide-react";

export function LeadershipVideosSection() {
  return (
    <section className="w-full bg-[#030914] py-24 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 relative z-10">
        <div className="flex items-center gap-2 mb-4 text-blue-400 font-medium tracking-wider uppercase text-sm">
          <PlayCircle className="h-5 w-5" />
          <span>Leadership</span>
        </div>
        <h2 className="text-3xl font-semibold md:text-4xl tracking-tight text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 max-w-2xl">
          Hear from our leadership team
        </h2>

        <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl mx-auto">
          {/* Video 1 */}
          <a 
            href="https://www.youtube.com/watch?v=pB_1IuosqMc"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#030914] transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] block"
          >
            {/* Image */}
            <img 
              src="https://img.youtube.com/vi/pB_1IuosqMc/maxresdefault.jpg" 
              alt="Leadership message 1"
              className="absolute inset-0 w-full h-full object-cover scale-[1.02] opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-[1.05]"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
            
            {/* Play Button - Ultra Premium */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative group-hover:scale-110 transition-transform duration-500 ease-out flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors duration-500" />
                
                {/* The Button */}
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-2xl transition-all duration-300 group-hover:bg-white group-hover:border-white">
                  <svg className="w-6 h-6 text-white group-hover:text-blue-600 fill-current ml-1 transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between translate-y-2 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-500">
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Watch Now</span>
              </div>
              <div className="text-white/60 font-medium text-sm drop-shadow-md">ETV News</div>
            </div>
          </a>

          {/* Video 2 */}
          <a 
            href="https://www.youtube.com/watch?v=eAnvCRlr9Dw"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#030914] transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] block"
          >
            {/* Image */}
            <img 
              src="https://img.youtube.com/vi/eAnvCRlr9Dw/maxresdefault.jpg" 
              alt="Leadership message 2"
              className="absolute inset-0 w-full h-full object-cover scale-[1.02] opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-[1.05]"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
            
            {/* Play Button - Ultra Premium */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative group-hover:scale-110 transition-transform duration-500 ease-out flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors duration-500" />
                
                {/* The Button */}
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-2xl transition-all duration-300 group-hover:bg-white group-hover:border-white">
                  <svg className="w-6 h-6 text-white group-hover:text-blue-600 fill-current ml-1 transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between translate-y-2 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-500">
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Watch Now</span>
              </div>
              <div className="text-white/60 font-medium text-sm drop-shadow-md">CLNS</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

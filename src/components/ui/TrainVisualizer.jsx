import { useState, useEffect } from 'react'
import trainHeadImg from '../../assets/train_head_illustration.png'

const TrainVisualizer = ({ speed = 0, status = 'active' }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Subtle floating animation when active
  const isActive = status === 'active'
  
  return (
    <div 
      className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center perspective-1000"
      onMouseMove={(e) => {
        if (!isHovered) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20
        setRotation({ x, y })
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setRotation({ x: 0, y: 0 })
      }}
    >
      {/* Background Glow & Motion Environment */}
      <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isActive ? 'bg-brand-blue animate-pulse' : 'bg-slate-400'}`}></div>
      
      {/* Motion Background (Blurred Track/Speed) */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden rounded-[20px] pointer-events-none opacity-40">
           <div className="absolute top-1/2 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-brand-blue to-transparent animate-track-speed" />
           <div className="absolute top-[60%] left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent animate-track-speed-delayed" />
        </div>
      )}

      {/* 3D Train Container */}
      <div 
        className="relative z-10 transition-transform duration-300 ease-out preserve-3d"
        style={{ 
          transform: `rotateX(${rotation.y}deg) rotateY(${rotation.x}deg) scale(${isHovered ? 1.05 : 1})`,
        }}
      >
        <img 
          src={trainHeadImg} 
          alt="TRC Locomotive" 
          className={`w-full h-auto drop-shadow-2xl transition-all duration-1000 ${isActive ? 'brightness-110 contrast-110' : 'grayscale brightness-75'}`}
          style={{
            animation: isActive ? 'float 6s ease-in-out infinite' : 'none'
          }}
        />
        
        {/* Particle/Speed lines effect if speed is high */}
        {isActive && speed > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute h-[1.5px] bg-white/40 rounded-full animate-speed-line"
                style={{
                  width: `${Math.random() * 60 + 40}px`,
                  left: '-100px',
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 / (speed / 100 + 0.5)}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shadow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/20 blur-xl rounded-full scale-y-50"></div>
      
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes speed-line {
          0% { transform: translateX(0) scaleX(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(500px) scaleX(2); opacity: 0; }
        }
        @keyframes track-speed {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-track-speed {
          animation: track-speed 0.5s linear infinite;
        }
        .animate-track-speed-delayed {
          animation: track-speed 0.7s linear infinite reverse;
        }
      `}</style>
    </div>
  )
}

export default TrainVisualizer

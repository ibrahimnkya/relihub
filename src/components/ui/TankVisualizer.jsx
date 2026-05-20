import { useEffect, useRef, useMemo } from 'react'

const TANK_W = 100
const TANK_H = 180
const TANK_RX = 12
const TANK_Y_OFFSET = 10
const TANK_PADDING = 15 // Padding to keep scale/fluid within boundaries
const EFFECTIVE_H = TANK_H - (TANK_PADDING * 2)
const WAVE_AMP = 6
const WAVE_FREQ = 1.8
const WAVE_SPEED = 0.02

function buildWavePath(pct, phase) {
    const fluidY = TANK_Y_OFFSET + TANK_H - TANK_PADDING - (pct / 100) * EFFECTIVE_H
    const steps = 40
    const amplitude = WAVE_AMP * Math.min(1, pct / 10) * Math.min(1, (100 - pct) / 10)
    const pts = []

    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * (TANK_W + 40)
        const y = fluidY + Math.sin(phase + (i / steps) * Math.PI * 2 * WAVE_FREQ) * amplitude
        pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    }

    pts.push(`L${TANK_W + 40},${TANK_H + 40} L0,${TANK_H + 40} Z`)
    return pts.join(' ')
}

function fluidColors(percentage) {
    if (percentage < 15) return { body: '#A41720', top: '#C81E2A', glow: 'rgba(164, 23, 32, 0.2)' } // Critical (Brand Red)
    if (percentage < 30) return { body: '#D97706', top: '#F59E0B', glow: 'rgba(217, 119, 6, 0.2)' } // Warning (Amber)
    return { body: '#854d0e', top: '#eab308', glow: 'rgba(234, 179, 8, 0.2)' } // Optimal / Diesel
}

const TankVisualizer = ({
    percentage = 50,
    active = false,
    label = 'UNIT T-01',
    status = 'active',
    phaseOffset = 0,
    className = ""
}) => {
    const svgId = useRef(`tank-${Math.random().toString(36).slice(2, 7)}`)
    const waveRef = useRef(null)
    const bodyRef = useRef(null)
    const rafRef = useRef(null)
    const phaseRef = useRef(Math.random() * Math.PI * 2)
    const displayPctRef = useRef(percentage)
    const targetPctRef = useRef(percentage)

    // Sync target percentage
    useEffect(() => {
        targetPctRef.current = percentage
    }, [percentage])

    const colors = useMemo(() => fluidColors(percentage), [percentage])

    useEffect(() => {
        const animate = () => {
            // Smoothly interpolate display percentage towards target
            const diff = targetPctRef.current - displayPctRef.current
            if (Math.abs(diff) > 0.01) {
                displayPctRef.current += diff * 0.05
            } else {
                displayPctRef.current = targetPctRef.current
            }

            phaseRef.current += WAVE_SPEED
            const pct = displayPctRef.current
            const c = fluidColors(pct)
            const fluidY = TANK_Y_OFFSET + TANK_H - TANK_PADDING - (pct / 100) * EFFECTIVE_H

            if (bodyRef.current) {
                bodyRef.current.setAttribute('y', fluidY)
                bodyRef.current.setAttribute('height', TANK_Y_OFFSET + TANK_H - fluidY)
                bodyRef.current.setAttribute('fill', c.body)
            }

            if (waveRef.current) {
                waveRef.current.setAttribute('d', buildWavePath(pct, phaseRef.current + phaseOffset))
                waveRef.current.setAttribute('fill', c.top)
            }

            rafRef.current = requestAnimationFrame(animate)
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [phaseOffset])

    const clipId = `${svgId.current}-clip`
    const svgW = TANK_W + 24
    const svgH = TANK_H + 20

    return (
        <div className={`relative flex items-center justify-center group ${className}`}>
            {/* Percentage Badge */}
            <div className="absolute top-0 right-0 z-20">
                <div 
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider tabular-nums border shadow-sm transition-colors duration-500"
                    style={{ 
                        backgroundColor: `${colors.top}15`, 
                        borderColor: `${colors.top}30`,
                        color: colors.body
                    }}
                >
                    {Math.round(percentage)}%
                </div>
            </div>

            {/* SVG Tank System */}
            <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-[1.02] w-full flex justify-center">
                <svg
                    viewBox={`0 0 ${svgW + 20} ${svgH}`}
                    className="w-full h-auto max-h-[220px] overflow-visible"
                >
                    <defs>
                        <clipPath id={clipId}>
                            <rect x="12" y="10" width={TANK_W} height={TANK_H} rx={TANK_RX} />
                        </clipPath>
                        
                        <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                        </linearGradient>

                        <filter id="fluid-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Tank Outer Shell */}
                    <rect
                        x="12" y="10"
                        width={TANK_W} height={TANK_H}
                        rx={TANK_RX}
                        fill="#ffffff"
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="2"
                    />

                    {/* Internal Fluid Group */}
                    <g clipPath={`url(#${clipId})`}>
                        {/* Fluid Body */}
                        <rect
                            ref={bodyRef}
                            x="0"
                            width={svgW + 20}
                            y={TANK_H - (percentage / 100) * TANK_H + 10}
                            height={(percentage / 100) * TANK_H + 20}
                            fill={colors.body}
                        />
                        {/* Wave Surface */}
                        <path
                            ref={waveRef}
                            d={buildWavePath(percentage, phaseRef.current + phaseOffset)}
                            fill={colors.top}
                            filter="url(#fluid-glow)"
                        />

                        {/* Bubbles if active */}
                        {active && (
                            <g opacity="0.4">
                                {[...Array(6)].map((_, i) => (
                                    <circle key={i} r="1.5" fill="#fff">
                                        <animate
                                            attributeName="cy"
                                            from={TANK_H + 10}
                                            to={TANK_H - (percentage / 100) * TANK_H + 15}
                                            dur={`${2 + Math.random() * 2}s`}
                                            repeatCount="indefinite"
                                            begin={`${Math.random() * 2}s`}
                                        />
                                        <animate
                                            attributeName="cx"
                                            values={`${25 + i * 12};${30 + i * 12};${25 + i * 12}`}
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            values="0;1;0"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                ))}
                            </g>
                        )}
                    </g>

                    {/* Gauge Calibration Scale */}
                    {[...Array(11)].map((_, i) => {
                        const v = i * 10
                        const ty = TANK_Y_OFFSET + TANK_H - TANK_PADDING - (v / 100) * EFFECTIVE_H
                        const isMajor = v % 25 === 0
                        return (
                            <g key={v}>
                                {/* Outer Tick */}
                                <line
                                    x1="2" x2={isMajor ? "12" : "8"}
                                    y1={ty} y2={ty}
                                    stroke={isMajor ? "#64748b" : "#cbd5e1"}
                                    strokeWidth={isMajor ? "1.5" : "1"}
                                />
                                {/* Cross-Tank Reference Line (Glass Etched look) */}
                                {isMajor && (
                                    <line 
                                        x1="12" x2={TANK_W + 12}
                                        y1={ty} y2={ty}
                                        stroke="rgba(0,0,0,0.05)"
                                        strokeWidth="1"
                                        strokeDasharray="2,2"
                                    />
                                )}
                                {/* Right Label */}
                                {isMajor && (
                                    <text
                                        x={TANK_W + 18} y={ty + 3}
                                        fontSize="9"
                                        fill="#475569"
                                        className="font-black tabular-nums"
                                    >
                                        {v}%
                                    </text>
                                )}
                            </g>
                        )
                    })}

                    {/* Tank Highlight / Glass Shine */}
                    <rect
                        x="16" y="14"
                        width="8" height={TANK_H - 8}
                        rx="4"
                        fill="url(#glass-gradient)"
                        pointerEvents="none"
                    />

                    {/* Inner Border Shadow Effect */}
                    <rect
                        x="12" y="10"
                        width={TANK_W} height={TANK_H}
                        rx={TANK_RX}
                        fill="none"
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="1.5"
                    />
                </svg>

                {/* Active Flow Pulse */}
                {active && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-4 h-4 rounded-full animate-ping opacity-20" style={{ backgroundColor: colors.top }} />
                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: colors.top }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TankVisualizer


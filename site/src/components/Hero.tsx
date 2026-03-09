import { useEffect, useState } from 'react'

const terminalLines = [
  { text: '$ claude', delay: 0 },
  { text: '> /godmode', delay: 600 },
  { text: '', delay: 1000 },
  { text: '  GodMode v1.0.0 activated', delay: 1200 },
  { text: '  32 skills loaded', delay: 1500 },
  { text: '  Agent teams: ready', delay: 1800 },
  { text: '  Quality gates: armed', delay: 2100 },
  { text: '', delay: 2400 },
  { text: '  [intent-discovery] What are we building?', delay: 2600 },
  { text: '  [task-planning] Decomposing into atomic tasks...', delay: 3200 },
  { text: '  [test-first] Writing tests before implementation...', delay: 3800 },
  { text: '  [quality-gate] All checks passed.', delay: 4400 },
  { text: '', delay: 4800 },
  { text: '  Ready. Define > Plan > Execute > Review > Ship', delay: 5000 },
]

export function Hero() {
  const [visibleLines, setVisibleLines] = useState<number>(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    terminalLines.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6366f1]/8 rounded-full blur-[120px]" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-[#a855f7]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-[#22d3ee]/4 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#27272a] bg-[#111113]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-[#a1a1aa]">v1.0.0 -- Production Ready</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              <span className="gradient-text">GodMode</span>
            </h1>

            <p className="text-xl sm:text-2xl text-[#a1a1aa] leading-relaxed mb-4 max-w-lg">
              The AI development framework that thinks before it builds.
            </p>

            <p className="text-base text-[#71717a] leading-relaxed mb-10 max-w-lg">
              Give your AI coding agent a structured engineering pipeline.
              32 composable skills. Agent teams. Quality gates at every stage.
              Define, plan, execute, review, ship.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#install"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                  bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white
                  hover:from-[#818cf8] hover:to-[#c084fc]
                  transition-all duration-200 shadow-lg shadow-[#6366f1]/20"
              >
                Get Started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 7h12M8 2l5 5-5 5" />
                </svg>
              </a>
              <a
                href="https://github.com/NoobyGains/godmode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                  border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]
                  transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="relative">
            <div className="rounded-xl border border-[#27272a] bg-[#111113] overflow-hidden shadow-2xl shadow-black/50">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#0d0d0f]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#27272a]" />
                  <div className="w-3 h-3 rounded-full bg-[#27272a]" />
                  <div className="w-3 h-3 rounded-full bg-[#27272a]" />
                </div>
                <span className="text-xs font-mono text-[#71717a] ml-2">terminal</span>
              </div>

              {/* Terminal body */}
              <div className="p-5 font-mono text-sm leading-relaxed min-h-[340px]">
                {terminalLines.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line.text === '' ? (
                      <br />
                    ) : line.text.startsWith('$') ? (
                      <span className="text-[#a1a1aa]">{line.text}</span>
                    ) : line.text.startsWith('>') ? (
                      <span className="text-[#22d3ee]">{line.text}</span>
                    ) : line.text.includes('activated') || line.text.includes('Ready.') ? (
                      <span className="text-emerald-400">{line.text}</span>
                    ) : line.text.includes('passed') ? (
                      <span className="text-emerald-400">{line.text}</span>
                    ) : line.text.includes('[') ? (
                      <span>
                        <span className="text-[#a855f7]">{line.text.match(/\[.*?\]/)?.[0]}</span>
                        <span className="text-[#a1a1aa]">{line.text.replace(/\[.*?\]/, '')}</span>
                      </span>
                    ) : (
                      <span className="text-[#71717a]">{line.text}</span>
                    )}
                  </div>
                ))}
                {visibleLines < terminalLines.length && (
                  <span className="cursor-blink text-[#a1a1aa]">_</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#71717a]">
        <span className="text-xs font-mono">scroll</span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
          <path d="M6 4v12M2 12l4 4 4-4" />
        </svg>
      </div>
    </section>
  )
}

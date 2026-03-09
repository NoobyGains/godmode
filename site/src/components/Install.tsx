import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

export function Install() {
  const ref = useReveal()
  const [copied, setCopied] = useState(false)
  const command = 'claude plugin add NoobyGains/godmode'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <section id="install" className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6366f1]/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="reveal">
          <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
            Get Started
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            One command. That's it.
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-xl mx-auto mb-12">
            Install GodMode as a Claude Code plugin and activate it in any project.
            No configuration required.
          </p>

          {/* Install command */}
          <div className="rounded-xl border border-[#27272a] bg-[#111113] overflow-hidden max-w-lg mx-auto mb-8">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#27272a] bg-[#0d0d0f]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
              </div>
              <span className="text-[10px] font-mono text-[#52525b] ml-2">terminal</span>
            </div>

            {/* Command */}
            <div className="flex items-center justify-between px-5 py-4">
              <code className="font-mono text-sm sm:text-base text-[#a1a1aa]">
                <span className="text-[#22d3ee]">$</span> {command}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 ml-4 p-1.5 rounded text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 8.5 6.5 12 13 4" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="5" width="9" height="9" rx="1" />
                    <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Post-install steps */}
          <div className="space-y-3 max-w-sm mx-auto text-left">
            {[
              { step: '1', text: 'Install the plugin' },
              { step: '2', text: 'Open any project' },
              { step: '3', text: 'Type /godmode to activate' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-[#27272a] bg-[#19191d] flex items-center justify-center text-[10px] font-mono text-[#6366f1]">
                  {item.step}
                </div>
                <span className="text-sm text-[#a1a1aa]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

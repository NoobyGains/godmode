import { useReveal } from '../hooks/useReveal'

const painPoints = [
  {
    title: 'Code Dumping',
    description:
      'AI writes entire files without understanding context. No incremental approach, no consideration for existing patterns.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    title: 'No Testing',
    description:
      'Ships code without writing a single test. No red-green-refactor. No verification that anything actually works.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  },
  {
    title: 'Pattern Blindness',
    description:
      'Ignores existing conventions, naming patterns, and architectural decisions already established in the codebase.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Inconsistent Output',
    description:
      'Every response is a coin flip. Different quality, different approaches, different standards. No reliability guarantee.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

export function Problem() {
  const ref = useReveal()

  return (
    <section className="relative py-28 sm:py-36" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            AI agents are powerful.<br />
            <span className="text-[#71717a]">But they ship like interns.</span>
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            Without structure, AI coding tools produce inconsistent, untested,
            pattern-breaking code. They solve the wrong problems and skip the
            engineering discipline that makes software reliable.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="reveal-child group rounded-xl border border-[#27272a] bg-[#111113] p-6 hover:border-[#3f3f46] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[#19191d] border border-[#27272a] flex items-center justify-center text-[#ef4444] mb-4 group-hover:border-[#ef4444]/30 transition-colors">
                {point.icon}
              </div>
              <h3 className="font-semibold text-base mb-2">{point.title}</h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

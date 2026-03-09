import { useReveal } from '../hooks/useReveal'

const phases = [
  {
    step: '01',
    name: 'DEFINE',
    color: '#6366f1',
    description: 'Socratic requirements discovery. Understand what you are building before writing a single line.',
    skills: ['intent-discovery', 'comprehension-check'],
  },
  {
    step: '02',
    name: 'PLAN',
    color: '#818cf8',
    description: 'Atomic task decomposition with dependencies. Research existing patterns. Spec before code.',
    skills: ['task-planning', 'specification-first', 'reference-engine'],
  },
  {
    step: '03',
    name: 'EXECUTE',
    color: '#a855f7',
    description: 'Test-first development with batch execution. Agent teams for parallel workstreams.',
    skills: ['task-runner', 'test-first', 'team-orchestration'],
  },
  {
    step: '04',
    name: 'REVIEW',
    color: '#c084fc',
    description: 'Quality gates with automated checks. Pattern conformance. Evidence-based verification.',
    skills: ['quality-gate', 'quality-enforcement', 'pattern-matching'],
  },
  {
    step: '05',
    name: 'SHIP',
    color: '#22d3ee',
    description: 'Completion gate ensures nothing is missed. Merge protocol for clean integration.',
    skills: ['completion-gate', 'merge-protocol', 'knowledge-capture'],
  },
]

export function Pipeline() {
  const ref = useReveal()

  return (
    <section id="pipeline" className="relative py-28 sm:py-36" ref={ref}>
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/3 rounded-full blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 reveal">
          <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            A real engineering pipeline.<br />
            <span className="text-[#71717a]">Not just autocomplete.</span>
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            GodMode enforces a structured workflow that mirrors how senior
            engineers actually ship software. Every phase has skills, checks,
            and gates.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="reveal">
          {/* Horizontal flow for desktop */}
          <div className="hidden lg:flex items-stretch gap-0 mb-16">
            {phases.map((phase, i) => (
              <div key={phase.name} className="flex-1 flex items-stretch">
                <div
                  className="flex-1 rounded-xl border border-[#27272a] bg-[#111113] p-5 relative group hover:border-[#3f3f46] transition-all duration-300"
                >
                  <div
                    className="text-xs font-mono mb-2 tracking-wider"
                    style={{ color: phase.color }}
                  >
                    {phase.step}
                  </div>
                  <div
                    className="text-lg font-bold font-mono mb-1 tracking-wide"
                    style={{ color: phase.color }}
                  >
                    {phase.name}
                  </div>
                  <p className="text-xs text-[#71717a] leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${phase.color}40, transparent)`,
                    }}
                  />
                </div>

                {/* Arrow connector */}
                {i < phases.length - 1 && (
                  <div className="flex items-center px-1 text-[#3f3f46]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 10h8M11 7l3 3-3 3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vertical flow for mobile */}
          <div className="lg:hidden space-y-4">
            {phases.map((phase, i) => (
              <div key={phase.name}>
                <div className="rounded-xl border border-[#27272a] bg-[#111113] p-6 relative">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="text-xs font-mono tracking-wider"
                      style={{ color: phase.color }}
                    >
                      {phase.step}
                    </div>
                    <div
                      className="text-lg font-bold font-mono tracking-wide"
                      style={{ color: phase.color }}
                    >
                      {phase.name}
                    </div>
                  </div>
                  <p className="text-sm text-[#71717a] leading-relaxed mb-3">
                    {phase.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#27272a] text-[#71717a]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${phase.color}40, transparent)`,
                    }}
                  />
                </div>

                {i < phases.length - 1 && (
                  <div className="flex justify-center py-1 text-[#3f3f46]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 4v8M5 9l3 3 3-3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop skill tags below the pipeline */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {phases.map((phase) => (
              <div key={phase.name} className="flex flex-wrap gap-1.5 justify-center">
                {phase.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#27272a] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

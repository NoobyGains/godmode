import { useReveal } from '../hooks/useReveal'

const features = [
  {
    title: 'Parallel Execution',
    description:
      'Multiple Claude instances work on different modules simultaneously. Frontend, backend, and tests can progress in parallel.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 4v12M10 4v12M16 4v12" />
        <circle cx="4" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="10" cy="7" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Workspace Isolation',
    description:
      'Each agent operates in its own git worktree. No merge conflicts. No stepping on each other. Clean integration at the end.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="6" height="6" rx="1" />
        <rect x="12" y="2" width="6" height="6" rx="1" />
        <rect x="7" y="12" width="6" height="6" rx="1" />
        <path d="M5 8v2a2 2 0 0 0 2 2h0M15 8v2a2 2 0 0 1-2 2h0" />
      </svg>
    ),
  },
  {
    title: 'Peer-to-Peer Messaging',
    description:
      'Agents communicate through structured file-based messaging. Share context, report status, coordinate dependencies.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14l-2 2V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4" />
        <path d="M8 9h10a1 1 0 0 1 1 1v7l-2-2H9a1 1 0 0 1-1-1V9z" />
      </svg>
    ),
  },
]

export function AgentTeams() {
  const ref = useReveal()

  return (
    <section id="teams" className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a855f7]/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <div className="reveal">
              <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
                Agent Teams
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                One agent is good.<br />
                <span className="text-[#71717a]">A coordinated team is better.</span>
              </h2>
              <p className="text-lg text-[#a1a1aa] mb-10 max-w-lg">
                Spin up multiple Claude instances that collaborate like a
                real engineering team. Each agent owns a module, works in
                isolation, and communicates through structured protocols.
              </p>
            </div>

            <div className="space-y-6 reveal-stagger">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="reveal-child flex gap-4 group"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[#19191d] border border-[#27272a] flex items-center justify-center text-[#a855f7] group-hover:border-[#a855f7]/30 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#71717a] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual diagram */}
          <div className="reveal">
            <div className="rounded-xl border border-[#27272a] bg-[#111113] p-8">
              {/* Agent diagram */}
              <div className="space-y-6">
                {/* Orchestrator */}
                <div className="flex justify-center">
                  <div className="px-4 py-2.5 rounded-lg border border-[#6366f1]/40 bg-[#6366f1]/10 text-center">
                    <div className="text-[10px] font-mono text-[#6366f1] uppercase tracking-wider mb-0.5">
                      orchestrator
                    </div>
                    <div className="text-xs font-mono text-[#a1a1aa]">
                      team-orchestration
                    </div>
                  </div>
                </div>

                {/* Connection lines */}
                <div className="flex justify-center">
                  <svg width="200" height="30" viewBox="0 0 200 30" className="text-[#27272a]">
                    <line x1="100" y1="0" x2="30" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="100" y1="0" x2="100" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="100" y1="0" x2="170" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                </div>

                {/* Worker agents */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Agent A', task: 'Frontend', color: '#22d3ee' },
                    { label: 'Agent B', task: 'Backend', color: '#a855f7' },
                    { label: 'Agent C', task: 'Tests', color: '#10b981' },
                  ].map((agent) => (
                    <div
                      key={agent.label}
                      className="px-3 py-2.5 rounded-lg border bg-[#19191d] text-center"
                      style={{ borderColor: `${agent.color}30` }}
                    >
                      <div
                        className="text-[10px] font-mono uppercase tracking-wider mb-0.5"
                        style={{ color: agent.color }}
                      >
                        {agent.label}
                      </div>
                      <div className="text-xs font-mono text-[#71717a]">
                        {agent.task}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status indicators */}
                <div className="border-t border-[#27272a] pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Worktrees', value: '3 active' },
                      { label: 'Messages', value: '12 exchanged' },
                      { label: 'Status', value: 'In sync' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-[10px] font-mono text-[#52525b] uppercase tracking-wider">
                          {stat.label}
                        </div>
                        <div className="text-xs font-mono text-[#a1a1aa]">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

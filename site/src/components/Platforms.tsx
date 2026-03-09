import { useReveal } from '../hooks/useReveal'

const platforms = [
  {
    name: 'Claude Code',
    description: 'First-class plugin support. Install and activate with a single command.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#19191d" />
        <text x="16" y="21" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="14" fill="#c084fc">C</text>
      </svg>
    ),
    primary: true,
  },
  {
    name: 'Cursor',
    description: 'Drop-in rules file. GodMode loads as custom instructions for Cursor Agent.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#19191d" />
        <path d="M10 22V10l12 6-12 6z" fill="#71717a" />
      </svg>
    ),
    primary: false,
  },
  {
    name: 'OpenCode',
    description: 'Native agent support with full skill resolution and workspace isolation.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#19191d" />
        <text x="16" y="21" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="14" fill="#71717a">O</text>
      </svg>
    ),
    primary: false,
  },
  {
    name: 'Codex',
    description: 'Works as a project-level instruction set for OpenAI Codex agents.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#19191d" />
        <text x="16" y="21" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="12" fill="#71717a">{"</>"}</text>
      </svg>
    ),
    primary: false,
  },
]

export function Platforms() {
  const ref = useReveal()

  return (
    <section className="relative py-28 sm:py-36" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
            Platform Support
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Works where you work.
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            GodMode is platform-agnostic. One framework, multiple AI coding environments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`reveal-child rounded-xl border p-6 text-center transition-all duration-300 hover:border-[#3f3f46] ${
                platform.primary
                  ? 'border-[#6366f1]/30 bg-[#6366f1]/5'
                  : 'border-[#27272a] bg-[#111113]'
              }`}
            >
              <div className="flex justify-center mb-4">{platform.icon}</div>
              <h3 className="font-semibold text-base mb-2">{platform.name}</h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                {platform.description}
              </p>
              {platform.primary && (
                <span className="inline-block mt-3 text-[10px] font-mono text-[#6366f1] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#6366f1]/20">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

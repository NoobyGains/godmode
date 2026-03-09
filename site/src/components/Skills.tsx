import { useReveal } from '../hooks/useReveal'

interface Skill {
  name: string
  description: string
}

interface SkillGroup {
  domain: string
  color: string
  skills: Skill[]
}

const skillGroups: SkillGroup[] = [
  {
    domain: 'Foundation',
    color: '#6366f1',
    skills: [
      { name: 'activation', description: 'Skill system bootstrap' },
      { name: 'intent-discovery', description: 'Socratic requirements discovery' },
      { name: 'task-planning', description: 'Atomic task decomposition' },
      { name: 'task-runner', description: 'Batch execution with checkpoints' },
      { name: 'completion-gate', description: 'Evidence-based completion verification' },
    ],
  },
  {
    domain: 'Execution',
    color: '#818cf8',
    skills: [
      { name: 'team-orchestration', description: 'Multi-agent coordination' },
      { name: 'agent-messaging', description: 'Inter-agent communication' },
      { name: 'delegated-execution', description: 'Isolated subagent execution' },
      { name: 'parallel-execution', description: 'Concurrent workstreams' },
      { name: 'workspace-isolation', description: 'Git worktree isolation' },
    ],
  },
  {
    domain: 'Quality',
    color: '#a855f7',
    skills: [
      { name: 'quality-gate', description: 'Pre-review checklist' },
      { name: 'quality-enforcement', description: 'Automated standards' },
      { name: 'comprehension-check', description: 'Structured reasoning review' },
      { name: 'review-response', description: 'Feedback incorporation' },
      { name: 'pattern-matching', description: 'Convention conformance' },
    ],
  },
  {
    domain: 'Research',
    color: '#c084fc',
    skills: [
      { name: 'reference-engine', description: 'Architectural references' },
      { name: 'github-search', description: 'Open-source research' },
      { name: 'codebase-research', description: 'Deep repo investigation' },
      { name: 'design-research', description: 'Visual language exploration' },
    ],
  },
  {
    domain: 'Design',
    color: '#22d3ee',
    skills: [
      { name: 'ui-engineering', description: 'Component architecture' },
      { name: 'ux-patterns', description: 'Reference-driven UI/UX' },
      { name: 'design-integration', description: 'Design token consistency' },
      { name: 'system-design', description: 'Scalable architecture patterns' },
    ],
  },
  {
    domain: 'Security',
    color: '#f59e0b',
    skills: [
      { name: 'security-protocol', description: 'Threat modeling' },
      { name: 'performance-tuning', description: 'Profiling-driven optimization' },
    ],
  },
  {
    domain: 'Workflow',
    color: '#10b981',
    skills: [
      { name: 'specification-first', description: 'Spec as source of truth' },
      { name: 'test-first', description: 'Red-green-refactor enforcement' },
      { name: 'fault-diagnosis', description: 'Root cause analysis' },
      { name: 'merge-protocol', description: 'Branch finalization' },
      { name: 'project-bootstrap', description: 'Best-practice scaffolding' },
    ],
  },
  {
    domain: 'Meta',
    color: '#71717a',
    skills: [
      { name: 'protocol-authoring', description: 'Creating new skills' },
      { name: 'knowledge-capture', description: 'Learning from completed work' },
    ],
  },
]

export function Skills() {
  const ref = useReveal()

  return (
    <section id="skills" className="relative py-28 sm:py-36" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-sm font-mono text-[#6366f1] tracking-wider uppercase mb-4">
            The Skills
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            32 composable skills.<br />
            <span className="text-[#71717a]">8 domains. Infinite combinations.</span>
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            Each skill is a focused protocol that guides the AI through a
            specific engineering concern. Combine them to match your workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {skillGroups.map((group) => (
            <div
              key={group.domain}
              className="reveal-child rounded-xl border border-[#27272a] bg-[#111113] p-5 hover:border-[#3f3f46] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h3
                  className="text-sm font-mono font-semibold tracking-wide uppercase"
                  style={{ color: group.color }}
                >
                  {group.domain}
                </h3>
                <span className="text-[10px] font-mono text-[#3f3f46] ml-auto">
                  {group.skills.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {group.skills.map((skill) => (
                  <div key={skill.name} className="group/skill">
                    <div className="text-xs font-mono text-[#a1a1aa] group-hover/skill:text-white transition-colors">
                      {skill.name}
                    </div>
                    <div className="text-[11px] text-[#52525b] leading-snug">
                      {skill.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

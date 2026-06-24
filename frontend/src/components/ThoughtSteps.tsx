import { BrainCircuit, CheckCircle2, Loader2, Search, Sparkles } from 'lucide-react'
import type { ThoughtStep } from '../hooks/useResearch'

interface NodeConfig {
  icon: React.ReactNode
  label: string
  color: string
  bg: string
}

const NODE_CONFIG: Record<string, NodeConfig> = {
  plan: {
    icon: <BrainCircuit size={14} />,
    label: 'Plan',
    color: 'text-blue-400',
    bg: 'bg-blue-950 border-blue-900',
  },
  search: {
    icon: <Search size={14} />,
    label: 'Search',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950 border-emerald-900',
  },
  synthesize: {
    icon: <Sparkles size={14} />,
    label: 'Synthesize',
    color: 'text-violet-400',
    bg: 'bg-violet-950 border-violet-900',
  },
  reflect: {
    icon: <CheckCircle2 size={14} />,
    label: 'Reflect',
    color: 'text-amber-400',
    bg: 'bg-amber-950 border-amber-900',
  },
}

interface Props {
  steps: ThoughtStep[]
  currentNode: string | null
}

export default function ThoughtSteps({ steps, currentNode }: Props) {
  const finished = !currentNode

  return (
    <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        {finished ? (
          <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
          <Loader2 size={14} className="text-violet-400 animate-spin" />
        )}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {finished ? 'Agent finished' : 'Agent thinking…'}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {steps.map((step, i) => {
          const cfg = NODE_CONFIG[step.node] ?? {
            icon: null,
            label: step.node,
            color: 'text-gray-400',
            bg: 'bg-gray-800 border-gray-700',
          }

          return (
            <div key={i} className="flex items-start gap-3 animate-slide-in">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center ${cfg.bg} ${cfg.color}`}
              >
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{step.message}</p>

                {step.node === 'plan' &&
                  Array.isArray((step.data as any)?.sub_queries) && (
                    <ul className="mt-2 space-y-1">
                      {((step.data as any).sub_queries as string[]).map((q: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}

                {step.node === 'search' &&
                  Array.isArray((step.data as any)?.sources) && (
                    <ul className="mt-2 space-y-1">
                      {((step.data as any).sources as string[]).map((s: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="truncate">{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>
          )
        })}

        {currentNode && (
          <div className="flex items-center gap-3 animate-pulse pl-0.5">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center
                ${NODE_CONFIG[currentNode]?.bg ?? 'bg-gray-800 border-gray-700'}
                ${NODE_CONFIG[currentNode]?.color ?? 'text-gray-400'}`}
            >
              {NODE_CONFIG[currentNode]?.icon}
            </div>
            <span className="text-sm text-gray-500 italic">
              {NODE_CONFIG[currentNode]?.label ?? currentNode}…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

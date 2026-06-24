import { Zap } from 'lucide-react'
import ResearchOutput from './components/ResearchOutput'
import SearchBar from './components/SearchBar'
import ThoughtSteps from './components/ThoughtSteps'
import { useResearch } from './hooks/useResearch'

export default function App() {
  const { state, research, isLoading } = useResearch()

  const hasActivity = state.thoughtSteps.length > 0 || state.currentNode !== null
  const hasOutput = Boolean(state.tokens) || state.citations.length > 0

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-16 pb-24">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/50">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Research Agent</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Ask anything — the agent searches the web and synthesizes a cited answer in real time
          </p>
          <p className="text-gray-700 text-xs mt-1">
            LangGraph · Groq · Tavily
          </p>
        </header>

        <SearchBar onSubmit={research} isLoading={isLoading} />

        {state.error && (
          <div className="mt-4 bg-red-950/50 border border-red-900 rounded-xl p-4 text-red-400 text-sm">
            <span className="font-semibold">Error: </span>{state.error}
          </div>
        )}

        {hasActivity && (
          <ThoughtSteps steps={state.thoughtSteps} currentNode={state.currentNode} />
        )}

        {hasOutput && (
          <ResearchOutput
            tokens={state.tokens}
            citations={state.citations}
            isStreaming={isLoading}
          />
        )}
      </div>
    </div>
  )
}

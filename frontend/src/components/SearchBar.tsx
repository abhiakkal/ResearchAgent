import { Loader2, Search } from 'lucide-react'
import { FormEvent, useState } from 'react'

interface Props {
  onSubmit: (query: string) => void
  isLoading: boolean
}

const EXAMPLES = [
  'How does CRISPR gene editing work?',
  'What caused the 2008 financial crisis?',
  'Explain quantum entanglement simply',
]

export default function SearchBar({ onSubmit, isLoading }: Props) {
  const [query, setQuery] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q || isLoading) return
    onSubmit(q)
  }

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a research question…"
            disabled={isLoading}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-40
                       text-gray-100 placeholder-gray-500 text-base
                       focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                       disabled:opacity-60 transition-colors"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                       disabled:bg-gray-800 disabled:text-gray-600
                       text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Researching…
              </>
            ) : (
              <>
                <Search size={15} />
                Research
              </>
            )}
          </button>
        </div>
      </form>

      {!isLoading && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); onSubmit(ex) }}
              className="text-xs text-gray-500 hover:text-gray-300 bg-gray-900 hover:bg-gray-800
                         border border-gray-800 rounded-lg px-3 py-1.5 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

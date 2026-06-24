import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Citation } from '../hooks/useResearch'
import SourceCard from './SourceCard'

interface Props {
  tokens: string
  citations: Citation[]
  isStreaming: boolean
}

export default function ResearchOutput({ tokens, citations, isStreaming }: Props) {
  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {!tokens && isStreaming ? (
          <div className="flex items-center gap-2 text-gray-500 py-2">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-sm">Generating answer…</span>
          </div>
        ) : (
          <div className={isStreaming ? 'blink-cursor' : ''}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-white mt-6 mb-2 pb-1.5 border-b border-gray-800 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-gray-100 mt-4 mb-1.5">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-3 text-sm">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-gray-400 italic">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 mb-3 ml-4 list-disc marker:text-gray-600">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1 mb-3 ml-4 list-decimal marker:text-gray-600">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300 text-sm leading-relaxed">{children}</li>
                ),
                code: ({ children, className }) => {
                  const isBlock = Boolean(className?.includes('language-'))
                  return isBlock ? (
                    <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto mb-3 text-xs">
                      <code className="text-violet-300">{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-gray-800 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  )
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-violet-600 pl-4 text-gray-400 italic mb-3">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {tokens}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {citations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {citations.length} Sources
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {citations.map((c) => (
              <SourceCard key={c.index} citation={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

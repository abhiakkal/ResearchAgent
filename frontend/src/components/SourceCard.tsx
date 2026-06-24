import { ExternalLink } from 'lucide-react'
import type { Citation } from '../hooks/useResearch'

interface Props {
  citation: Citation
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

function formatUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname.length > 1 ? u.pathname.slice(0, 28) + (u.pathname.length > 28 ? '…' : '') : ''
    return u.hostname + path
  } catch {
    return url.slice(0, 40)
  }
}

export default function SourceCard({ citation }: Props) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 bg-gray-900 border border-gray-800
                 hover:border-gray-600 rounded-lg p-3 transition-colors"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
        <img
          src={getFaviconUrl(citation.url)}
          alt=""
          className="w-4 h-4 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug">
          {citation.title || 'Source'}
        </p>
        <p className="text-xs text-gray-600 mt-0.5 truncate">{formatUrl(citation.url)}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1.5">
        <span className="text-xs font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
          [{citation.index}]
        </span>
        <ExternalLink size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
      </div>
    </a>
  )
}

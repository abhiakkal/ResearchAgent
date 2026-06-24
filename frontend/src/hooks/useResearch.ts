import { useCallback, useState } from 'react'

export interface ThoughtStep {
  node: string
  message: string
  data?: Record<string, unknown>
}

export interface Citation {
  index: number
  url: string
  title: string
}

export interface ResearchState {
  thoughtSteps: ThoughtStep[]
  currentNode: string | null
  tokens: string
  citations: Citation[]
  error: string | null
  isComplete: boolean
}

const EMPTY: ResearchState = {
  thoughtSteps: [],
  currentNode: null,
  tokens: '',
  citations: [],
  error: null,
  isComplete: false,
}

export function useResearch() {
  const [state, setState] = useState<ResearchState>(EMPTY)
  const [isLoading, setIsLoading] = useState(false)

  const research = useCallback(async (query: string) => {
    setState(EMPTY)
    setIsLoading(true)

    let response: Response | null = null
    try {
      response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
    } catch (err) {
      setState((s) => ({ ...s, error: `Network error: ${String(err)}` }))
      setIsLoading(false)
      return
    }

    if (!response.body) {
      setIsLoading(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // SSE events are separated by double newlines
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue
            try {
              dispatch(JSON.parse(line.slice(6)))
            } catch { /* skip malformed JSON */ }
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  function dispatch(ev: Record<string, unknown>) {
    switch (ev.type) {
      case 'node_start':
        setState((s) => ({ ...s, currentNode: ev.node as string }))
        break

      case 'thought_step':
        setState((s) => ({
          ...s,
          thoughtSteps: [
            ...s.thoughtSteps,
            {
              node: ev.node as string,
              message: ev.message as string,
              data: ev.data as Record<string, unknown> | undefined,
            },
          ],
        }))
        break

      case 'token':
        setState((s) => ({ ...s, tokens: s.tokens + (ev.content as string) }))
        break

      case 'synthesis_complete':
        setState((s) => ({
          ...s,
          // Use streamed tokens if available; fall back to full synthesis
          tokens: s.tokens || (ev.content as string),
          citations: ev.citations as Citation[],
        }))
        break

      case 'complete':
        setState((s) => ({ ...s, currentNode: null, isComplete: true }))
        break

      case 'error':
        setState((s) => ({ ...s, error: ev.message as string, currentNode: null }))
        break
    }
  }

  return { state, research, isLoading }
}

import Markdown from 'react-markdown'

export type MessageBoxProps = {
  content: string
  type: 'bot' | 'user'
  status?: 'loading' | 'done' | 'error'
}

export function BotMessage({ content, status }: MessageBoxProps) {
  return (
    <div className="flex items-start justify-start w-full mb-4">
      <div className="shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-2xl shadow-sm max-w-[80%]">
        <Markdown>{content}</Markdown>
        {status === 'loading' && (
          <div className="flex space-x-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        {status === 'error' && <div className="text-red-500 text-sm mt-1">Oops! Something went wrong. Please try again.</div>}
      </div>
    </div>
  )
}

export function UserMessage({ content }: MessageBoxProps) {
  return (
    <div className="flex items-start justify-end w-full mb-4">
      <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-2xl shadow-sm max-w-[80%]">
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
      <div className="shrink-0 ml-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-700 dark:text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

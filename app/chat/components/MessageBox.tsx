export type MessageBoxProps = {
  content: string
  type: 'bot' | 'user'
}

export function BotMessage({ content, loading }: MessageBoxProps & { loading: boolean }) {
  return (
    <div className="flex items-center justify-start w-full mb-2">
      <div className="bg-zinc-100 text-black p-2 rounded-md">
        {content}
        {loading && '...'}
      </div>
    </div>
  )
}

export function UserMessage({ content }: MessageBoxProps) {
  return (
    <div className="flex items-center justify-end w-full mb-2">
      <div className="bg-blue-500 text-white p-2 rounded-md">{content}</div>
    </div>
  )
}

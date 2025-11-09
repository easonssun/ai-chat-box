'use client'

import { use, useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { MessageBoxProps } from './components/MessageBox'
import { BotMessage, UserMessage } from './components/MessageBox'
import cn from '@/lib/cn'
import { getServerUrl } from '@/lib/getEnv'
import { useSearchParams, useRouter } from 'next/navigation'

async function getSessionId() {
  const response = await fetch(getServerUrl() + 'api/session_id')

  if (!response.ok || !response.body) {
    throw new Error('ReadableStream not supported in this browser.')
  }

  const sessionId = await response.json()
  return sessionId
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get('sessionId')

  const [messages, setMessages] = useState<MessageBoxProps[]>([])
  const [inputDisabled, setInputDisabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 设置 query 参数
  const setSessionId = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sessionId', id)
    router.replace(`/chat?${params.toString()}`)
  }

  // 初始化 sessionId
  useEffect(() => {
    if (sessionId) return
    getSessionId().then(({ session_id }) => setSessionId(session_id))
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const input = inputValue.trim()
    setInputValue('')
    setMessages((prev) => [...prev, { content: input, type: 'user' }])
    setInputDisabled(true)

    const response = await fetch(getServerUrl() + 'api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, sessionId }),
    }).catch((error) => {
      console.error('Fetch error:', error)
      setInputDisabled(false)
      setMessages((prev) => [...prev, { content: '服务器错误，请稍后重试', type: 'bot', status: 'error' }])
      throw error
    })

    if (!response.ok || !response.body) {
      throw new Error('ReadableStream not supported in this browser.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let botMessage = ''
    setMessages((prev) => [...prev, { content: botMessage, type: 'bot', status: 'loading' }])

    // 流式读取
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n\n').filter((line) => line.startsWith('data:'))
        for (const line of lines) {
          const dataStr = line.replace(/^data:\s*/, '')
          try {
            const data = JSON.parse(dataStr)
            if (data.type === 'token') {
              botMessage += data.content
              setMessages((prev) => [...prev.slice(0, -1), { content: botMessage, type: 'bot', status: 'loading' }])
            } else if (data.type === 'done') {
              setMessages((prev) => [...prev.slice(0, -1), { content: botMessage, type: 'bot', status: 'done' }])
              console.log('Stream done')
            } else if (data.type === 'error') {
              setMessages((prev) => [...prev.slice(0, -1), { content: botMessage, type: 'bot', status: 'error' }])
              console.error('Stream error:', data.content)
              break
            }
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        }
      }
    } catch (e) {
      console.error('Stream error:', e)
    } finally {
      setInputDisabled(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setIsFocused(false)
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 font-sans">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">江</span>
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">江河水利智能客服</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-600 dark:text-slate-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-600 dark:text-slate-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* 欢迎信息 */}
        {messages.length === 0 && (
          <div className="text-center mb-8 mt-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">欢迎使用江河水利智能客服</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              我是您的智能水利客服助手，随时为您解答问题。请随时向我提问，我将尽力为您提供帮助。
            </p>
          </div>
        )}

        {/* 聊天消息区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">对话记录</h2>
          </div>

          <div className="h-[500px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 chat-messages">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) =>
                  msg.type === 'bot' ? (
                    <BotMessage key={index} type={msg.type} content={msg.content} status={msg.status} />
                  ) : (
                    <UserMessage key={index} type={msg.type} content={msg.content} status={msg.status} />
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">开始对话，AI 回复将显示在这里</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 底部输入区域 */}
      <footer className="sticky bottom-0 w-full border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className={cn(
              'flex space-x-2 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none  shadow-sm resize-none',
              { 'ring-2 ring-blue-500 dark:ring-blue-400': isFocused }
            )}
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                name="input"
                value={inputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="按 Enter 发送, Shift+Enter 换行"
                rows={1}
                className="w-full p-3 text-slate-800 dark:text-slate-200 resize-none overflow-hidden max-h-32 focus:outline-none"
                autoComplete="off"
                disabled={inputDisabled}
              />
              <div className="p-3 flex items-right justify-end gap-4">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </div>
                <button type="submit" disabled={inputDisabled || !inputValue.trim()} className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <div className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">内容由 ai 生成， 请仔细甄别</div>
        </div>
      </footer>
    </div>
  )
}

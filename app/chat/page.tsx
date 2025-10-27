'use client'

import { useState } from 'react'
import type { MessageBoxProps } from './components/MessageBox'
import { BotMessage, UserMessage } from './components/MessageBox'

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageBoxProps[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const input = formData.get('input') as string

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.trim() }),
    })

    setMessages((prev) => [...prev, { content: input, type: 'user' }])
    setIsLoading(true)

    if (!response.ok || !response.body) {
      throw new Error('ReadableStream not supported in this browser.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let botMessage = ''
    setMessages((prev) => [...prev, { content: botMessage, type: 'bot' }])

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
              setMessages((prev) => [...prev.slice(0, -1), { content: botMessage, type: 'bot' }])
            } else if (data.type === 'done') {
              console.log('Stream done')
            } else if (data.type === 'error') {
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
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-zinc-900 dark:text-zinc-100">AI 输出展示</h1>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-200">AI 输出内容</h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 min-h-[400px] bg-zinc-50 dark:bg-zinc-800">
            {messages ? (
              <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {messages.map((msg, index) =>
                  msg.type === 'bot' ? (
                    <BotMessage key={index} type={msg.type} content={msg.content} loading={isLoading} />
                  ) : (
                    <UserMessage key={index} type={msg.type} content={msg.content} />
                  )
                )}
                {isLoading && '...'}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                <p>AI 输出内容将显示在这里...</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="input"
              placeholder="请输入您的问题"
              className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              type="submit"
              className="cursor-pointer mt-2 w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

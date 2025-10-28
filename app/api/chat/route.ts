import { chainWithHistory, sessionId } from '@/llm/model'
import { NextResponse } from 'next/server'

export async function POST(req: Request, res: Response) {
  try {
    const { input } = await req.json()
    // 使用流式回调
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // SSE 要求每条消息以 "data: ...\n\n" 格式发送
        const sendSSE = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        const callback = {
          handleLLMNewToken(token: string) {
            sendSSE(JSON.stringify({ type: 'token', content: token }))
          },
          handleLLMEnd() {
            sendSSE(JSON.stringify({ type: 'done' }))
            controller.close()
          },
          handleLLMError(err: Error) {
            console.error('LLM Error:', err)
            sendSSE(JSON.stringify({ type: 'error', content: err.message }))
            controller.error(err)
          },
        }

        // 调用模型并传入回调
        await chainWithHistory.invoke(
          { question: input },
          {
            callbacks: [callback],
            configurable: {
              sessionId,
            },
          }
        )
      },
    })

    // 返回流式响应（兼容 `ai` SDK 的格式）
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: unknown) {
    console.error('API Error:', error)
    return new NextResponse(`data: ${JSON.stringify({ type: 'error', message: (error as Error).message })}\n\n`, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }
}

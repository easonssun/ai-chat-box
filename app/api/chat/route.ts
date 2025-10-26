import { chain } from '@/llm/model'

export async function POST(req: Request) {
  const { input } = await req.json()

  // 使用流式回调
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const callback = {
        handleLLMNewToken(token: string) {
          controller.enqueue(encoder.encode(token))
        },
        handleLLMEnd() {
          controller.close()
        },
        handleLLMError(err: Error) {
          controller.error(err)
        },
      }

      // 调用模型并传入回调
      await chain.invoke(
        { question: input },
        {
          callbacks: [callback],
        }
      )
    },
  })

  // 返回流式响应（兼容 `ai` SDK 的格式）
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

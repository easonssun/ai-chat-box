import { chain } from '@/llm/model'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await chain.invoke({ question: messages })

  console.log(response)

  return Response.json({ response })
}

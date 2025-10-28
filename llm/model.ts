import { getModelApiKey, getModelApiBase } from '@/lib/getEnv'

import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'

const model = new ChatOpenAI({
  apiKey: getModelApiKey(),
  configuration: {
    baseURL: getModelApiBase(),
  },
  modelName: 'deepseek-chat', // 或根据 DeepSeek 文档确认具体模型名
  streaming: true,
  temperature: 0.3,
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个专业的水利水电工程师，回答必须准确、简洁、使用中文。'],
  new MessagesPlaceholder('history'),
  ['human', '{question}'],
])

const chain = prompt.pipe(model)

// 4. 创建一个内存存储（实际项目中应替换为 Redis/DB）
const store: Record<string, InMemoryChatMessageHistory> = {}

function getChatHistory(sessionId: string) {
  if (!store[sessionId]) {
    store[sessionId] = new InMemoryChatMessageHistory()
  }
  return store[sessionId]
}

// 5. 包装 chain 以支持消息历史
export const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: (sessionId: string) => getChatHistory(sessionId),
  inputMessagesKey: 'question', // 关键：与 prompt 模板中的变量名一致
  historyMessagesKey: 'history', // 关键：与 prompt 模板中的 MessagesPlaceholder 名称一致
})

export const sessionId = '123'

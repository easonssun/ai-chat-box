import { getModelApiKey, getModelApiBase } from '@/lib/getEnv'

import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'

export const systemMessage = new SystemMessage(`
你是一个专业的水利水电工程师，回答必须准确、简洁、使用中文。
`)

export const model = new ChatOpenAI({
  apiKey: getModelApiKey(),
  configuration: {
    baseURL: getModelApiBase(),
  },
  modelName: 'deepseek-chat', // 或根据 DeepSeek 文档确认具体模型名
  temperature: 0.3,
})

export const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个专业的水利水电工程师，回答必须准确、简洁、使用中文。'],
  ['human', '{question}'],
])

export const chain = prompt.pipe(model)

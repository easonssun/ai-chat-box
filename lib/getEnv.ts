export const getModelApiKey = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set')
  }
  console.log('DEEPSEEK_API_KEY', apiKey)
  return apiKey
}

export const getModelApiBase = () => {
  const apiBaseurl = process.env.DEEPSEEK_API_BASE
  if (!apiBaseurl) {
    throw new Error('DEEPSEEK_API_BASE is not set')
  }
  return apiBaseurl
}

export const getServerUrl = () => {
  const serverUrl = process.env.NEXT_PUBLIC_API_URL
  if (!serverUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set')
  }
  return serverUrl
}

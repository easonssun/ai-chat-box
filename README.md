# 江河水利智能客服

## 目录介绍

## ai model 目录 `/llm/model.ts`

ai model 目录下存放了 langchain 调用 ai 模型的代码

## api 目录 `/api/chat.ts`

api 目录下存放了 nextjs api 路由代码，用于调用 ai 模型, 包含 ai 的流式输出

## 前端目录 `/app`

前端目录下存放了 nextjs 前端代码，包含了客服页面的实现

`app/chat/page.tsx` 客服页面的实现

## 运行项目

### 安装依赖

需要 node 22 以上版本, 以及 pnpm 包管理器

```bash
pnpm i
```

### 运行项目

```bash
pnpm dev
```

### 设置环境变量

需要设置环境变量 `DEEPSEEK_API_KEY` 为 deepseek 平台的 api key

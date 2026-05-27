# 【谁是凶手】故事生成器

一键生成中英双语侦探推理故事 + AI生图提示词

## 功能特点

- **多模型支持**：Deepseek、智谱GLM、通义千问、Claude、OpenAI Compatible
- **中英双语**：故事正文、嫌疑人陈述、线索、答案全部中英对照
- **AI生图提示词**：同时生成 GPT Image 2 和 NanoBanana Pro 的提示词
- **一键复制**：方便直接粘贴到社区帖子
- **逻辑严密**：AI生成的侦探故事经过逻辑验证

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的API密钥（至少配置一个）：

```env
# 推荐使用 Deepseek（性价比高）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 或者使用智谱GLM
ZHIPU_API_KEY=your_zhipu_api_key_here

# 或者使用通义千问
QWEN_API_KEY=your_qwen_api_key_here

# 或者使用Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用

## 部署到 Vercel（推荐）

### 一键部署

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 创建新项目
3. 导入你 fork 的仓库
4. 在 Environment Variables 中添加你的 API 密钥
5. 点击 Deploy

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 使用方法

1. **选择模型**：根据你的 API 密钥选择合适的模型
   - Deepseek：性价比最高，中文能力强
   - 智谱GLM：国产模型，中文理解优秀
   - 通义千问：阿里云模型，稳定可靠
   - Claude：创意能力强，逻辑严密
   - OpenAI Compatible：兼容OpenAI接口的模型

2. **选择日期**：选择故事的发布日期

3. **输入主题**（可选）：输入你想要的故事主题，如"密室杀人"、"毒杀"等

4. **点击生成**：等待AI生成故事

5. **复制使用**：
   - 点击 "Copy Story" 复制完整故事
   - 点击 "Copy GPT Prompts" 复制 GPT Image 2 提示词
   - 点击 "Copy NanoBanana Prompts" 复制 NanoBanana Pro 提示词

## 项目结构

```
detective-story-generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts      # API路由
│   │   ├── layout.tsx            # 布局文件
│   │   └── page.tsx              # 主页面
│   ├── components/
│   │   └── StoryDisplay.tsx      # 故事展示组件
│   ├── lib/
│   │   ├── ai-client.ts          # AI模型客户端
│   │   ├── models.ts             # 模型配置
│   │   └── prompts.ts            # 提示词模板
│   └── types/
│       └── index.ts              # 类型定义
├── .env.example                  # 环境变量示例
└── README.md                     # 项目说明
```

## API Keys 获取方式

### Deepseek
1. 访问 https://platform.deepseek.com
2. 注册账号并登录
3. 在 API Keys 页面创建新的密钥

### 智谱 GLM
1. 访问 https://open.bigmodel.cn
2. 注册账号并登录
3. 在 API Keys 页面创建新的密钥

### 通义千问
1. 访问 https://dashscope.aliyun.com
2. 注册阿里云账号
3. 开通 DashScope 服务
4. 在 API Keys 页面创建新的密钥

### Claude (Anthropic)
1. 访问 https://console.anthropic.com
2. 注册账号并登录
3. 在 API Keys 页面创建新的密钥

## 技术栈

- **前端**：Next.js 14 + React + Tailwind CSS
- **后端**：Next.js API Routes
- **AI模型**：多模型支持（Deepseek、智谱、通义、Claude、OpenAI）
- **部署**：Vercel

## License

MIT

# VCIC Scoring System - Implementation Guide

## 概述 (Overview)

这个项目将Figma设计严格转换为React + TypeScript + Tailwind CSS实现。所有页面都是移动端优先设计（440px宽度），完全复刻了Figma设计的布局、间距、颜色和字体。

## 已创建的页面 (Created Pages)

### 1. Events Page (`/events`)
- **文件**: `pages/events.tsx`
- **功能**: 浏览所有VCIC活动
- **特性**:
  - 搜索栏过滤活动
  - MBA/Undergraduate标签切换
  - 活动卡片显示状态（live 🟢 / final 🏁）
  - 点击查看计分板按钮

### 2. Judge Selection Page (`/judge-selection`)
- **文件**: `pages/judge-selection.tsx`
- **功能**: 选择评委进行投票
- **特性**:
  - 显示活动名称
  - 2x3网格显示评委卡片
  - 点击评委进入投票页面

### 3. Judge Voting Page (`/judge-voting`)
- **文件**: `pages/judge-voting.tsx`
- **功能**: 评委为团队投票
- **特性**:
  - 返回按钮
  - 显示当前评委身份
  - 三个轮次标签（Due Diligence, Written Deliverables, Partner Meeting）
  - 名次选择（1st/2nd/3rd Place）
  - 团队选择区域
  - 提交投票按钮

### 4. Vote Confirmation Page (`/vote-confirmation`)
- **文件**: `pages/vote-confirmation.tsx`
- **功能**: 确认已提交的投票
- **特性**:
  - 感谢消息
  - 投票摘要（显示每个名次的团队）
  - 团队照片展示
  - "返回投票"和"查看历史投票"按钮

### 5. Previous Votes Page (`/previous-votes`)
- **文件**: `pages/previous-votes.tsx`
- **功能**: 查看历史投票记录
- **特性**:
  - 返回按钮
  - 轮次标签切换查看不同轮次的投票
  - 投票摘要显示
  - 返回投票按钮

### 6. Overall Scoreboard Page (`/scoreboard-overall`)
- **文件**: `pages/scoreboard-overall.tsx`
- **功能**: 显示总体排名
- **特性**:
  - 深蓝色背景（#23538f）
  - 带蓝色边框的白色排名表格
  - 递减字体大小显示排名
  - 底部logo

### 7. Round by Round Scoreboard Page (`/scoreboard-rounds`)
- **文件**: `pages/scoreboard-rounds.tsx`
- **功能**: 按轮次显示分数
- **特性**:
  - 灰色背景（#666666）
  - 三个轮次的分数表格（不同背景色）
  - 计分规则说明
  - 底部logo

## 共享组件 (Shared Components)

### 1. Header (`components/header.tsx`)
- 已存在，蓝色背景（#5883b8）
- VCIC logo

### 2. Footer (`components/ui/footer.tsx`)
- 深灰色背景（#373839）
- 高度65px

### 3. BackButton (`components/ui/back-button.tsx`)
- 带边框的返回按钮
- 显示 "<" 符号
- 可配置链接地址

### 4. JudgeCard (`components/ui/judge-card.tsx`)
- 显示评委信息
- 2列网格布局
- 圆形头像 + 名字

## 设计规范 (Design Specifications)

### 颜色 (Colors)
- **主色调**: `#5883b8` (蓝色 - Header, 按钮)
- **Footer**: `#373839` (深灰色)
- **选中状态**: `#c8ddf6` (浅蓝色)
- **边框**: `#000000` (黑色)
- **背景**: `#f5f5f5` (中性灰 - 未选中按钮)
- **记分板背景**:
  - Overall: `#23538f` (深蓝)
  - Rounds: `#666666` (灰色)
- **轮次背景**:
  - Due Diligence: `#eecdcd` (淡红)
  - Written Deliverables: `#d8d3e7` (淡紫)
  - Partner Meetings: `#dce9d5` (淡绿)

### 尺寸 (Dimensions)
- **移动端宽度**: 440px
- **Header高度**: 120px
- **Footer高度**: 65px
- **按钮圆角**: 5px - 10px
- **卡片间距**: 20px

### 字体 (Typography)
- **标题**: 24px - 28px, bold
- **副标题**: 20px, semibold/medium
- **正文**: 14px - 16px, regular
- **按钮**: 18px - 20px, semibold

## 待完成任务 (TODO)

### 1. 图片资源 (Images)
需要替换以下占位符图片：
- `/public/placeholder-judge.jpg` - 评委头像
- `/public/placeholder-team.jpg` - 团队照片
- `/public/placeholder-logo.jpg` - 大学logo
- `/public/unc-kfbs-logo.png` - UNC KFBS logo（记分板底部）

### 2. 后端集成 (Backend Integration)
需要连接以下API端点：
```typescript
// Events API
GET /api/events - 获取所有活动
GET /api/events/:id - 获取单个活动详情

// Judges API
GET /api/events/:eventId/judges - 获取活动的评委列表

// Teams API
GET /api/events/:eventId/teams - 获取活动的团队列表

// Voting API
POST /api/votes - 提交投票
GET /api/votes/:judgeId - 获取评委的历史投票
PUT /api/votes/:voteId - 更新投票

// Scoreboard API
GET /api/events/:eventId/scoreboard - 获取记分板数据
GET /api/events/:eventId/scoreboard/rounds - 获取分轮次记分板
```

### 3. 状态管理 (State Management)
建议使用React Query进行数据获取和缓存：
```typescript
// 示例：获取活动列表
import { useQuery } from '@tanstack/react-query';

function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      return response.json();
    },
  });
}
```

### 4. 认证 (Authentication)
需要实现：
- 评委登录系统
- 会话管理
- 权限验证（确保评委只能为自己的活动投票）

### 5. 表单验证 (Form Validation)
投票页面需要验证：
- 所有三个名次都已选择
- 不能为同一团队选择多个名次
- 投票时间窗口验证

### 6. 响应式设计 (Responsive Design)
当前为移动端优先（440px），需要考虑：
- 平板端适配（768px+）
- 桌面端适配（1024px+）
- 使用Tailwind的响应式类（sm:, md:, lg:）

### 7. 错误处理 (Error Handling)
添加：
- API错误处理
- 网络错误提示
- 加载状态显示
- 表单验证错误提示

### 8. 无障碍性 (Accessibility)
改进：
- 添加适当的ARIA标签
- 键盘导航支持
- 屏幕阅读器支持
- 颜色对比度检查

### 9. 性能优化 (Performance)
- 图片懒加载
- 代码分割
- 缓存策略
- 优化bundle大小

### 10. 测试 (Testing)
添加：
- 单元测试（Jest + React Testing Library）
- 集成测试
- E2E测试（Playwright/Cypress）

## 开发流程 (Development Workflow)

### 启动开发服务器
```bash
cd vcic
npm run dev
```

### 访问页面
- 主页: http://localhost:3000
- 活动页: http://localhost:3000/events
- 评委选择: http://localhost:3000/judge-selection
- 评委投票: http://localhost:3000/judge-voting
- 投票确认: http://localhost:3000/vote-confirmation
- 历史投票: http://localhost:3000/previous-votes
- 总体记分板: http://localhost:3000/scoreboard-overall
- 分轮记分板: http://localhost:3000/scoreboard-rounds

### 构建生产版本
```bash
npm run build
npm run start
```

## 项目结构 (Project Structure)

```
vcic/
├── components/
│   ├── header.tsx              # Header component (已存在)
│   └── ui/
│       ├── button.tsx          # Button component (shadcn)
│       ├── card.tsx            # Card component (shadcn)
│       ├── tabs.tsx            # Tabs component (shadcn)
│       ├── footer.tsx          # Footer component (新建)
│       ├── back-button.tsx     # Back button component (新建)
│       └── judge-card.tsx      # Judge card component (新建)
├── pages/
│   ├── _app.tsx                # Next.js App wrapper
│   ├── _document.tsx           # Next.js Document wrapper
│   ├── index.tsx               # Homepage (更新)
│   ├── events.tsx              # Events listing page (新建)
│   ├── judge-selection.tsx     # Judge selection page (新建)
│   ├── judge-voting.tsx        # Voting page (新建)
│   ├── vote-confirmation.tsx   # Vote confirmation page (新建)
│   ├── previous-votes.tsx      # Previous votes page (新建)
│   ├── scoreboard-overall.tsx  # Overall scoreboard (新建)
│   ├── scoreboard-rounds.tsx   # Round by round scoreboard (新建)
│   └── api/
│       └── ...                 # API routes
├── public/
│   ├── vcic-header-logo.png    # Header logo (已存在)
│   ├── placeholder-judge.jpg   # Placeholder for judge images
│   ├── placeholder-team.jpg    # Placeholder for team images
│   ├── placeholder-logo.jpg    # Placeholder for university logos
│   └── unc-kfbs-logo.png       # UNC KFBS logo (需要添加)
├── styles/
│   └── globals.css             # Global styles + Tailwind
└── lib/
    ├── utils.ts                # Utility functions
    ├── types.ts                # TypeScript types
    └── googleSheetsClient.ts   # Google Sheets client
```

## 注意事项 (Notes)

1. **严格遵循Figma设计**: 所有间距、颜色、字体大小都严格按照Figma设计实现
2. **移动端优先**: 所有页面都是为440px宽度设计的
3. **占位符数据**: 当前使用mock数据，需要连接实际后端
4. **图片占位符**: 所有图片需要替换为实际资源
5. **无路由守卫**: 需要添加认证和权限检查
6. **无数据持久化**: 投票数据目前不保存，需要连接数据库

## 下一步 (Next Steps)

1. 添加实际图片资源到`/public`目录
2. 实现API路由（或连接现有后端）
3. 集成Google Sheets API（如果使用）
4. 添加认证系统
5. 实现表单验证
6. 添加错误处理和加载状态
7. 进行响应式设计适配
8. 编写测试
9. 性能优化
10. 部署到生产环境

## 技术栈 (Tech Stack)

- **框架**: Next.js 15.5.6 (Pages Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui (Radix UI)
- **数据获取**: React Query (TanStack Query)
- **图片**: Next.js Image组件（优化）
- **API**: Google Sheets API (已配置)

## 支持 (Support)

如有问题，请查看：
- Next.js文档: https://nextjs.org/docs
- Tailwind CSS文档: https://tailwindcss.com/docs
- shadcn/ui文档: https://ui.shadcn.com
- React Query文档: https://tanstack.com/query

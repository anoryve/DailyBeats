# Daily Beats: 家庭日常 AI概念电音专辑 (Daily Beats Family AI Concept Album)

一个基于 Web Audio API 与 AI 创意生成的交互式黑胶电音专辑应用。应用记录了一个温馨家庭从“晨光吐司”、“校门告别”到“格子间律动”、“夕阳重逢”再到“星空安眠”的完整一日，在温暖极简的电子乐中折射出家人的深深牵绊。

---

## 🌟 核心特性 (Key Features)

- **流媒体风格专辑界面 (Streaming-Style Album Interface)**
  - 采用柔和暖色调 (`#faf7f2`) 典雅风设计，融合 Plus Jakarta Sans 与 Playfair Display 字体搭配。
  - 响应式曲目列表、单曲收藏、一键分享与底部悬浮“正在播放”控制栏。

- **精密黑胶唱机与环形实时频谱 (Interactive Vinyl Record & Precision Radial Visualizer)**
  - 拟真黑胶唱片与唱针交互，播放时唱针滑动并伴随盘片旋转。
  - 基于 Web Audio API 的 Canvas 360° 环形音频频谱，精确对齐黑胶唱片外围外圈，随声波强弱实时脉动。

- **动态 SVG 环境氛围粒子 (Dynamic SVG Ambient Particles)**
  - 页面背景拥有柔和的 SVG 氛围粒子，色彩随当前曲目的专属 `visualColor` 缓缓过渡，营造高沉浸感的听觉与视觉体验。

- **Web Audio 音乐合成引擎 (Procedural Web Audio Engine)**
  - 使用原生的 Web Audio API (`AudioContext`, `GainNode`, `AnalyserNode`, `AudioBufferSourceNode`) 实现无缝音频循环、平滑音量控制与进度拉动。

- **章节剧情故事与歌词字幕 (Narrative & Subtitle Display)**
  - 每首单曲附带温情的章节剧情故事与对齐的歌词字幕，随曲目切换平滑展示。

---

## 🛠️ 技术栈 (Tech Stack)

- **前端框架**: React 18, Vite, TypeScript
- **样式与动画**: Tailwind CSS v4, Motion (`motion/react`), Lucide React Icons
- **音频技术**: Web Audio API (AnalyserNode, AudioBufferSourceNode)
- **后端服务**: Node.js, Express, ESBuild
- **AI 引擎**: Google Gemini API (`@google/genai`)

---

## 🚀 本地运行与构建 (Getting Started)

### 1. 安装依赖 (Install Dependencies)
```bash
npm install
```

### 2. 开发模式 (Development)
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 3. 构建与生产部署 (Build & Start)
```bash
npm run build
npm start
```

---

## 📄 许可 (License)

MIT License

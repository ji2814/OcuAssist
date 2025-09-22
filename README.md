# OcuAssist - 眼科辅助诊断系统

OcuAssist 是一个基于 Tauri + React + TypeScript 开发的桌面应用程序，专为眼科医生设计的眼底图像辅助诊断工具。该系统集成了 AI 图像识别、智能诊断建议和病历管理功能。

## 🌟 主要功能

- **📸 眼底图像管理**: 支持多格式眼底图像导入、预览和管理
- **🤖 AI 图像识别**: 自动识别眼底图像中的异常区域和病变特征
- **💬 智能诊断助手**: 基于 AI 的交互式诊断建议和病例分析
- **📋 病历管理**: 完整的患者信息管理和诊断报告生成
- **📊 三视图显示**: 同时展示原图、AI识别结果和诊断信息
- **📄 报告导出**: 支持诊断报告的 PDF 导出功能

## 🚀 快速开始

### 环境要求
- Node.js (推荐 v18 或更高版本)
- pnpm (或 npm/yarn)
- Rust (用于 Tauri 后端)

### 安装依赖
```bash
# 安装前端依赖
pnpm install

# 安装 Tauri CLI (如果尚未安装)
pnpm add -D @tauri-apps/cli
```

### 开发模式
```bash
# 启动开发服务器
pnpm tauri dev
```

### 构建应用
```bash
# 构建生产版本
pnpm tauri build
```

## 📁 项目结构

```
ocuassist/
├── src/                    # React 前端源码
│   ├── components/         # React 组件
│   │   ├── App.tsx        # 主应用组件
│   │   ├── MenuBar/       # 顶部菜单栏
│   │   ├── ThumbnailPanel/ # 缩略图面板
│   │   ├── RecognitionPanel/ # AI识别面板
│   │   └── DiagnosisPanel/   # 诊断面板
│   ├── context/           # React Context 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── src-tauri/             # Tauri 后端源码
│   ├── src/               # Rust 源码
│   ├── icons/             # 应用图标
│   └── tauri.conf.json    # Tauri 配置文件
├── public/                # 静态资源
└── dist/                  # 构建输出目录
```

## 🔧 核心功能模块

### 1. 图像管理模块 (ThumbnailPanel)
- 图像缩略图展示
- 图像导入和删除
- 图像元数据管理

### 2. AI 识别模块 (RecognitionPanel)
- 三视图显示（原图、识别结果、叠加显示）
- 病变区域标注
- 识别结果可视化

### 3. 诊断模块 (DiagnosisPanel)
- AI 诊断建议
- 医生诊断记录
- 交互式 AI 聊天

### 4. 患者管理
- 患者信息录入
- 病历管理
- 诊断报告生成

## 🎯 使用场景

本应用主要面向眼科医生和医疗专业人员，适用于：
- 眼底疾病的辅助诊断
- 病历数字化管理
- 医学教学和研究
- 远程医疗咨询

## 🔒 安全特性

- 本地数据存储，保护患者隐私
- 无需网络连接即可使用核心功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。在贡献之前，请确保：
1. 代码符合项目的编码规范
2. 添加了适当的测试
3. 更新了相关文档

## 🆘 支持

如遇到问题，请：
1. 查看项目的 Issue 列表
2. 创建新的 Issue 描述问题
3. 提供详细的错误信息和复现步骤

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- 所有为这个项目做出贡献的开发者

---

**注意**: 这是一个医疗辅助工具，诊断结果仅供参考，最终诊断应由专业医生确认。

# 部署指南

## Zeabur 部署问题解决方案

### 问题诊断
您遇到的错误 `authentication required` 通常由以下原因导致：

1. **仓库访问权限问题**
2. **GitHub 仓库设置为私有**
3. **Zeabur 未正确授权访问您的 GitHub 账户**

### 解决步骤

#### 方案一：检查仓库权限
1. 确认 GitHub 仓库是否为 **公开仓库**
2. 如果是私有仓库，需要在 Zeabur 中正确配置 GitHub 授权

#### 方案二：重新授权 GitHub
1. 登录 Zeabur 控制台
2. 前往 **Settings** → **Git Integrations**
3. 重新连接 GitHub 账户
4. 确保授权包含目标仓库的访问权限

#### 方案三：使用部署配置文件
项目已包含以下配置文件：
- `zeabur.json` - Zeabur 专用配置
- `vercel.json` - Vercel 备选方案

### 推荐部署流程

1. **推送最新代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configurations"
   git push origin main
   ```

2. **在 Zeabur 中创建新项目**
   - 选择 "Import from GitHub"
   - 选择正确的仓库
   - Zeabur 会自动检测 `zeabur.json` 配置

3. **验证部署设置**
   - 项目类型：Static Site
   - 构建命令：无需构建
   - 输出目录：根目录 (.)

### 备选部署平台

如果 Zeabur 问题持续，可考虑以下平台：

1. **Vercel** (推荐)
   - 已包含 `vercel.json` 配置
   - 支持 GitHub 自动部署
   - 免费额度充足

2. **Netlify**
   - 拖拽部署或 GitHub 集成
   - 自动 HTTPS
   - 表单处理功能

3. **GitHub Pages**
   - 完全免费
   - 直接从仓库部署
   - 适合静态网站

### 项目特点

- ✅ 纯静态 HTML/CSS/JS 项目
- ✅ 无需服务器端构建
- ✅ 支持多页面路由
- ✅ 响应式设计
- ✅ 已优化性能和代码结构

### 故障排除

如果部署后出现问题：

1. **检查控制台错误**
2. **验证文件路径**
3. **确认静态资源加载**
4. **测试 API 端点**（如有）

需要进一步协助，请提供具体的错误信息。
# AI智能助手UI设计优化 - 产品需求文档

## Overview
- **Summary**: 对AI智能助手的两个页面（功能介绍首页和对话聊天页面）进行全面UI优化，重点解决当前内容排版偏左、左右留白失衡问题，采用轻量化医疗健康风格，提升视觉舒适度和用户体验。
- **Purpose**: 修正页面布局缺陷，统一视觉规范，提升医疗健康应用的专业质感和用户交互体验，兼顾中老年用户阅读需求。
- **Target Users**: 糖尿病患者及健康管理用户，包含中老年人群

## Goals
- 修正所有页面内容排版偏左、左右留白失衡问题
- 建立统一的医疗健康风格视觉规范
- 优化AI助手功能介绍首页的信息层级和交互体验
- 优化AI对话聊天页面的聊天气泡布局和交互细节
- 提升中老年用户的阅读舒适度和操作便捷性

## Non-Goals (Out of Scope)
- 不修改后端API接口和数据结构
- 不改变核心业务逻辑
- 不新增或删除功能模块
- 不调整底部导航栏结构

## Background & Context
当前AI智能助手页面存在以下问题：
1. 内容整体排版偏左，右侧大面积空白
2. 卡片、文字、按钮等组件紧贴屏幕边缘
3. 缺乏统一的视觉规范和间距约束
4. 聊天气泡无最大宽度限制，阅读体验不佳
5. 交互反馈不够丰富

## Functional Requirements
- **FR-1**: 全局左右固定24px均等安全留白，所有组件不得紧贴屏幕边缘
- **FR-2**: 卡片内部统一内边距上下16px、左右20px
- **FR-3**: 短按钮自动居中，长按钮铺满有效可视宽度（扣除左右24px边距）
- **FR-4**: 聊天气泡最大宽度限制为页面有效宽度减40px
- **FR-5**: 欢迎气泡内示例问题替换为可点击居中圆角标签组
- **FR-6**: 4个快捷提问按钮整体居中排布，统一样式
- **FR-7**: 输入框左右固定24px页面边距，整体居中对齐
- **FR-8**: 增加AI回复加载动画和轻量化滚动条

## Non-Functional Requirements
- **NFR-1**: 色彩柔和医疗风，主色#2B7BED，背景#F8FAFD
- **NFR-2**: 字体适配中老年阅读，标题16px粗，正文13px常规，行间距1.5
- **NFR-3**: 所有卡片统一8px圆角，弱浅阴影
- **NFR-4**: 全部可点击元素hover轻微缩放+底色变色反馈
- **NFR-5**: 页面加载和交互响应流畅，无卡顿

## Constraints
- **Technical**: HTML/CSS/JavaScript，使用Tailwind CSS
- **Business**: 医疗健康场景，需保持专业柔和质感
- **Dependencies**: 现有项目结构和文件

## Assumptions
- 用户使用手机端访问，需适配移动端布局
- 现有图片资源和图标可用
- 后端API接口保持不变

## Acceptance Criteria

### AC-1: 全局边距约束
- **Given**: 打开AI助手任一页面
- **When**: 观察页面布局
- **Then**: 所有卡片、文字、按钮、输入框、列表组件左右均有24px留白，不得紧贴屏幕边缘
- **Verification**: `human-judgment`

### AC-2: 卡片内边距规范
- **Given**: 查看任何卡片组件
- **When**: 检查卡片内部间距
- **Then**: 卡片内部统一内边距上下16px、左右20px
- **Verification**: `human-judgment`

### AC-3: 按钮样式规范
- **Given**: 查看页面中的按钮
- **When**: 区分不同类型按钮
- **Then**: 主按钮填充蓝色，次要按钮描边，文字按钮无背景；短按钮居中，长按钮铺满有效宽度
- **Verification**: `human-judgment`

### AC-4: 聊天气泡布局
- **Given**: 进入AI对话页面
- **When**: 发送消息或查看历史记录
- **Then**: 气泡最大宽度受限，机器人消息靠左有24px边距，用户消息靠右对称留白
- **Verification**: `human-judgment`

### AC-5: 快捷提问按钮布局
- **Given**: 进入AI对话页面
- **When**: 查看底部快捷提问区
- **Then**: 4个快捷按钮整体居中排布，间距均匀，hover有填充效果
- **Verification**: `human-judgment`

### AC-6: 输入区域布局
- **Given**: 进入AI对话页面
- **When**: 查看底部输入区
- **Then**: 输入框左右24px边距，整体居中对齐，右侧圆形蓝色发送按钮
- **Verification**: `human-judgment`

### AC-7: 交互反馈
- **Given**: 操作页面元素
- **When**: hover或点击可点击元素
- **Then**: 有轻微缩放和底色变色反馈
- **Verification**: `human-judgment`

### AC-8: 加载动画
- **Given**: 发送消息给AI助手
- **When**: AI正在回复
- **Then**: 显示加载动画
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无

## Quality Checklist
- [x] Every goal has at least one acceptance criterion
- [x] Every acceptance criterion has a verification type
- [x] Non-goals are explicitly stated
- [x] Constraints are realistic and complete
- [x] No requirement contradicts another
- [x] Ambiguous user language has been clarified or flagged
# AI聊天界面UI精细化优化 - 产品需求文档

## Overview
- **Summary**: 对AI聊天界面进行精细化优化，解决视觉层级混乱、元素堆叠严重、组件样式不统一、空间利用率低等问题。核心改进包括：收纳顶部冗余元素、移除重复快捷按钮、重构底部输入区为现代胶囊形、统一气泡与卡片样式。
- **Purpose**: 提升AI聊天界面的视觉品质和用户体验，消除"开发Demo感"，打造专业医疗健康风格的聊天界面。
- **Target Users**: 糖尿病患者及健康管理用户，包含中老年人群

## Goals
- 消除顶部元素冗余，整合为紧凑的导航栏
- 移除重复的快捷提问按钮，保持界面简洁
- 重构底部输入区为现代胶囊形设计，发送图标整合入内
- 统一气泡与卡片样式，提升整体视觉一致性
- 增加留白，提升界面呼吸感

## Non-Goals (Out of Scope)
- 不修改后端API接口和数据结构
- 不改变核心业务逻辑
- 不调整底部导航栏结构
- 不修改AI助手首页（aiStart.html）

## Background & Context
当前AI聊天界面存在以下问题：
1. 顶部元素巨大且重复：巨大的圆形机器人头像占用太多垂直空间，且下方聊天气泡里还有小头像，标题栏重复"AI助手"
2. 布局与对齐问题："AI助手 在线"文字紧贴左侧，与下方聊天头像错位
3. 按钮设计简陋：使用浏览器默认极简样式，边框粗糙、没有呼吸感
4. 功能重复：聊天气泡内部已有4个快捷标签，底部又做了一排一模一样的"快速提问"按钮

## Functional Requirements
- **FR-1**: 将顶部大头像卡片整合进导航栏，使用40px小头像
- **FR-2**: 移除底部单独的"快速提问"按钮区域
- **FR-3**: 在输入框上方添加单行横向滚动的标签栏
- **FR-4**: 输入框改为胶囊形（rounded-full），发送按钮整合在输入框内部右侧
- **FR-5**: 发送按钮始终可见，根据输入内容状态变化样式

## Non-Functional Requirements
- **NFR-1**: 胶囊输入框使用现代圆角设计，带微弱阴影和聚焦环
- **NFR-2**: 横向滚动标签栏隐藏滚动条，支持平滑滚动
- **NFR-3**: 气泡和卡片统一使用柔和阴影和现代圆角
- **NFR-4**: 增加元素间留白，提升呼吸感
- **NFR-5**: 输入框聚焦时有流畅的状态过渡动画

## Constraints
- **Technical**: HTML/CSS/JavaScript，使用Tailwind CSS
- **Business**: 医疗健康场景，需保持专业柔和质感
- **Dependencies**: 现有项目结构和文件

## Assumptions
- 用户使用手机端访问，需适配移动端布局
- 现有图片资源和图标可用
- 后端API接口保持不变

## Acceptance Criteria

### AC-1: 顶部导航栏整合
- **Given**: 进入AI对话页面
- **When**: 观察顶部导航
- **Then**: 顶部只有一个紧凑的导航栏，包含小头像(40px)、名称、在线状态和清空按钮，无额外卡片
- **Verification**: `human-judgment`

### AC-2: 无重复快捷按钮
- **Given**: 进入AI对话页面
- **When**: 观察页面布局
- **Then**: 底部没有单独的"快速提问"按钮区域，只有输入框上方的横向滚动标签栏
- **Verification**: `human-judgment`

### AC-3: 横向滚动标签栏
- **Given**: 进入AI对话页面
- **When**: 查看输入框上方
- **Then**: 有单行横向滚动的快捷提问标签，滚动条隐藏
- **Verification**: `human-judgment`

### AC-4: 胶囊形输入框
- **Given**: 进入AI对话页面
- **When**: 查看底部输入区
- **Then**: 输入框为胶囊形(rounded-full)，发送图标整合在输入框内部右侧
- **Verification**: `human-judgment`

### AC-5: 发送按钮状态
- **Given**: 在输入框中输入内容
- **When**: 输入/清除文本
- **Then**: 发送按钮始终可见，有内容时高亮可用，无内容时灰化不可用
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
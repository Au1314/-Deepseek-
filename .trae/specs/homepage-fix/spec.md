# 首页内容加载与显示修复 - 产品需求文档

## Overview
- **Summary**: 修复糖尿病管理助手首页三个动态模块（专业医师团队、健康科普、糖尿病类型）无法完整展示内容的问题
- **Purpose**: 解决 API 意图不匹配、数据防御性检查缺失、CSS 类名不一致以及缺少外壳页面导致的内容显示问题
- **Target Users**: 使用糖尿病管理助手的移动端用户

## Goals
- 修复医师团队模块的意图字符串，确保能正确获取数据
- 添加数据防御性检查，避免 API 响应异常导致页面崩溃
- 统一 CSS 类名，确保样式正确应用
- 创建缺失的 index.html 外壳页面，完整加载首页内容

## Non-Goals (Out of Scope)
- 不修改后端 API 接口和工作流逻辑
- 不改变现有功能的交互逻辑
- 不新增或删除页面模块

## Background & Context
根据分析文档，首页内容通过 `main/main.html` 加载，包含三个动态模块，通过 API 获取数据并渲染。目前存在以下问题导致内容无法完整展示：
1. API 意图字符串不匹配
2. 缺少数据防御性检查
3. CSS 类名不一致
4. 缺少 iframe 外壳页面

## Functional Requirements
- **FR-1**: 修复医师团队模块的意图字符串，从 "获取医生列表" 改为 "获取医生数据"
- **FR-2**: 在三个加载函数中添加数据防御性检查，确保 `data.result` 存在且为数组
- **FR-3**: 统一 CSS 类名，确保动态生成的 HTML 使用正确的样式类
- **FR-4**: 创建 index.html 外壳页面，包含 iframe 和底部导航栏

## Non-Functional Requirements
- **NFR-1**: 所有修改应向后兼容，不破坏现有功能
- **NFR-2**: 代码应遵循现有项目的编码风格和规范

## Constraints
- **Technical**: 项目使用原生 JavaScript + Tailwind CSS，不引入新框架
- **Dependencies**: 依赖现有的 API 接口和工作流

## Assumptions
- API 路径和 API Key 都是正确的（用户已确认）
- 后端工作流对 "获取医生数据" 意图有正确的响应

## Acceptance Criteria

### AC-1: 医师团队模块意图修复
- **Given**: 用户打开首页，医师团队模块显示"加载中..."
- **When**: loadDoctors() 函数调用 API 时使用正确的意图字符串
- **Then**: API 返回正确的医生数据，医师团队卡片正常显示
- **Verification**: `programmatic`

### AC-2: 数据防御性检查
- **Given**: API 返回异常数据（result 为 null 或非数组）
- **When**: loadDoctors()/loadArticles()/loadTypes() 函数处理数据
- **Then**: 显示友好的错误提示，页面不崩溃
- **Verification**: `programmatic`

### AC-3: CSS 样式正确应用
- **Given**: 页面加载完成，动态内容渲染
- **When**: 检查元素样式
- **Then**: 卡片样式正确，布局正常
- **Verification**: `human-judgment`

### AC-4: 外壳页面完整
- **Given**: 用户访问项目根目录
- **When**: index.html 存在且包含 iframe 和导航栏
- **Then**: 首页内容完整加载，底部导航正常工作
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要创建其他页面的外壳（如 scheme.html、lifeadvice.html 等）？

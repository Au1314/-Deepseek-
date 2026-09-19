# 首页内容加载与显示修复 - 实施计划

## [x] Task 1: 修复医师团队模块意图字符串
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 main.js 第 44 行，将意图字符串从 "获取医生列表" 改为 "获取医生数据"
  - 确保与后端工作流期望的意图一致
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证 loadDoctors() 函数调用 fetchSQLWorkflow 时传入的意图字符串为 "获取医生数据"
- **Notes**: 需要确认后端工作流确实使用 "获取医生数据" 作为意图

## [x] Task 2: 添加数据防御性检查
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 loadDoctors()、loadArticles()、loadTypes() 三个函数中添加数据防御性检查
  - 检查 `data && data.result && Array.isArray(data.result)` 后再调用 `.map()`
  - 添加详细的 console 日志记录 API 响应结构
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 模拟 API 返回异常数据（result 为 null），验证页面显示错误提示而非崩溃
  - `programmatic` TR-2.2: 模拟 API 返回异常数据（result 为非数组），验证页面显示错误提示而非崩溃
  - `programmatic` TR-2.3: 验证控制台输出 API 响应数据结构
- **Notes**: 需要确保错误提示友好且不影响用户体验

## [x] Task 3: 统一 CSS 类名
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 分析 main.css 中定义的样式类与 main.js 动态生成的类名差异
  - 更新 main.js 动态生成的 HTML，使用 main.css 中定义的样式类
  - 确保样式正确应用到动态内容
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `human-judgment` TR-3.1: 检查医师团队卡片样式是否正确（渐变背景、圆角、阴影等）
  - `human-judgment` TR-3.2: 检查健康科普文章卡片样式是否正确（白底、圆角、阴影等）
  - `human-judgment` TR-3.3: 检查糖尿病类型卡片样式是否正确（彩色图标、网格布局等）
- **Notes**: 需要保持 Tailwind 工具类与自定义 CSS 的一致性

## [x] Task 4: 创建 index.html 外壳页面
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 创建 index.html 文件，包含 iframe 和底部导航栏
  - 引入必要的样式和脚本文件
  - 配置 iframe 加载 main/main.html 作为默认首页
  - 实现底部导航栏的页面切换功能
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 验证 index.html 存在且结构完整
  - `human-judgment` TR-4.2: 验证 iframe 正确加载首页内容
  - `human-judgment` TR-4.3: 验证底部导航栏五个 Tab 都能正常切换页面
- **Notes**: 需要根据分析文档中的架构图创建外壳页面

## [x] Task 5: 整合测试与验证
- **Priority**: medium
- **Depends On**: Tasks 1-4
- **Description**: 
  - 运行完整的测试流程，验证所有修复是否生效
  - 检查控制台是否有错误信息
  - 确认三个动态模块都能正常加载和显示内容
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-5.1: 打开首页，确认三个动态模块都能正常显示内容
  - `human-judgment` TR-5.2: 检查浏览器控制台是否有错误信息
  - `human-judgment` TR-5.3: 验证底部导航栏切换功能正常
- **Notes**: 需要在实际浏览器环境中测试


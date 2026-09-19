# AI智能助手UI设计优化 - 实现计划

## [x] Task 1: 更新全局样式规范（aiStart.css）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 定义主色#2B7BED，背景#F8FAFD
  - 定义字体规范：标题16px粗，功能标题14px半粗，正文13px常规，辅助小字11px浅灰
  - 定义卡片统一8px圆角，弱浅阴影
  - 定义按钮三类样式：填充主按钮、描边次要按钮、文字按钮
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-7
- **Test Requirements**:
  - `human-judgment` TR-1.1: 检查页面背景色是否为#F8FAFD
  - `human-judgment` TR-1.2: 检查卡片圆角是否为8px，是否有弱浅阴影
  - `human-judgment` TR-1.3: 检查按钮样式是否符合三类规范

## [x] Task 2: 更新AI助手首页布局（aiStart.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 全局左右24px均等留白
  - 顶部AI介绍卡片：收缩上下留白，浅渐变底色，居中展示，内部头像文字不贴左
  - 核心功能区：4项功能改为2列网格卡片，中间16px间隙，卡片内容左右预留内边距
  - 今日健康小贴士：独立醒目居中卡片，关键数值高亮标蓝
  - CTA按钮：铺满页面有效宽度（左右24px边距）
  - 模块之间统一20px上下间距
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-7
- **Test Requirements**:
  - `human-judgment` TR-2.1: 检查页面左右是否有24px均等留白
  - `human-judgment` TR-2.2: 检查功能卡片是否为2列网格居中排布
  - `human-judgment` TR-2.3: 检查CTA按钮是否铺满有效宽度
  - `human-judgment` TR-2.4: 检查模块间距是否统一20px

## [x] Task 3: 更新对话页面布局（userAI.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 顶部导航头部：收缩高度，卡片左右24px边距居中
  - 聊天气泡：最大宽度限制为页面有效宽度减40px，机器人消息靠左有24px边距，用户消息靠右对称留白
  - 欢迎气泡：示例问题替换为可点击居中圆角标签组
  - 底部快捷提问栏：4个按钮居中排布，间距均匀，浅蓝描边圆角样式
  - 底部输入区域：输入框左右24px边距，右侧圆形蓝色发送按钮
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgment` TR-3.1: 检查聊天气泡是否有最大宽度限制
  - `human-judgment` TR-3.2: 检查机器人消息左侧是否有24px边距
  - `human-judgment` TR-3.3: 检查快捷提问按钮是否居中排布
  - `human-judgment` TR-3.4: 检查输入框是否左右24px边距

## [x] Task 4: 更新对话页面样式（userAI.css）
- **Priority**: high
- **Depends On**: Task 1, Task 3
- **Description**: 
  - 定义机器人消息浅蓝#E8F1FF，用户消息浅灰#F1F3F6
  - 定义轻量化滚动条样式
  - 定义消息上下间距12px
  - 定义AI回复加载动画
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgment` TR-4.1: 检查机器人消息背景是否为#E8F1FF
  - `human-judgment` TR-4.2: 检查用户消息背景是否为#F1F3F6
  - `human-judgment` TR-4.3: 检查滚动条是否轻量化
  - `human-judgment` TR-4.4: 检查AI回复是否有加载动画

## [x] Task 5: 更新对话页面交互逻辑（userAI.js）
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 更新欢迎气泡为可点击标签组
  - 更新消息渲染逻辑，适配新的气泡样式和间距
  - 添加AI回复加载动画逻辑
  - 更新快捷提问按钮交互
- **Acceptance Criteria Addressed**: AC-5, AC-8
- **Test Requirements**:
  - `human-judgment` TR-5.1: 检查欢迎气泡内是否为可点击标签组
  - `human-judgment` TR-5.2: 检查点击快捷按钮是否能发送消息
  - `human-judgment` TR-5.3: 检查AI回复时是否显示加载动画

## [x] Task 6: 整体验证与微调
- **Priority**: medium
- **Depends On**: Task 1-5
- **Description**: 
  - 验证所有页面左右留白均等
  - 验证所有组件居中对齐
  - 验证交互反馈效果
  - 微调细节问题
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-7
- **Test Requirements**:
  - `human-judgment` TR-6.1: 整体检查页面是否居中平衡
  - `human-judgment` TR-6.2: 检查所有可点击元素是否有hover反馈
  - `human-judgment` TR-6.3: 检查中老年阅读舒适度
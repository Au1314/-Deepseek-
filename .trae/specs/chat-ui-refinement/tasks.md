# AI聊天界面UI精细化优化 - 实现计划

## [x] Task 1: 重构顶部导航栏（userAI.html）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将顶部大头像卡片整合进现有的导航栏
  - 使用40px小头像，移除单独的卡片区域
  - 导航栏包含：返回按钮、小头像+名称+在线状态、清空按钮
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 检查顶部是否只有一个紧凑的导航栏
  - `human-judgment` TR-1.2: 检查头像大小是否约40px
  - `human-judgment` TR-1.3: 检查是否包含名称、在线状态和清空按钮

## [x] Task 2: 移除底部重复快捷按钮并添加横向滚动标签栏（userAI.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 移除底部单独的"quick-questions"区域
  - 在输入框上方添加单行横向滚动的标签栏
  - 标签栏包含4个快捷提问标签
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-2.1: 检查底部是否没有单独的"快速提问"按钮区域
  - `human-judgment` TR-2.2: 检查输入框上方是否有横向滚动标签栏
  - `human-judgment` TR-2.3: 检查标签栏滚动条是否隐藏

## [x] Task 3: 重构输入框为胶囊形（userAI.html）
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 输入框改为胶囊形（rounded-full）
  - 发送按钮整合在输入框内部右侧
  - 发送按钮始终可见
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-3.1: 检查输入框是否为胶囊形
  - `human-judgment` TR-3.2: 检查发送按钮是否整合在输入框内部右侧
  - `human-judgment` TR-3.3: 检查发送按钮是否始终可见

## [x] Task 4: 更新样式文件（userAI.css）
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 添加胶囊输入框样式（圆角、阴影、聚焦环）
  - 添加横向滚动标签栏样式（隐藏滚动条、平滑滚动）
  - 添加导航栏紧凑头像样式
  - 更新发送按钮样式
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-4.1: 检查输入框是否有微弱阴影和聚焦环
  - `human-judgment` TR-4.2: 检查横向滚动标签栏是否隐藏滚动条
  - `human-judgment` TR-4.3: 检查输入框聚焦时是否有流畅过渡

## [x] Task 5: 更新交互逻辑（userAI.js）
- **Priority**: medium
- **Depends On**: Task 1-4
- **Description**: 
  - 更新发送按钮状态逻辑（始终可见，根据内容状态变化）
  - 更新横向滚动标签点击事件
  - 更新清空聊天后的状态恢复逻辑
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5
- **Test Requirements**:
  - `human-judgment` TR-5.1: 检查发送按钮在有内容时是否高亮可用
  - `human-judgment` TR-5.2: 检查发送按钮在无内容时是否灰化不可用
  - `human-judgment` TR-5.3: 检查点击横向滚动标签是否能发送消息

## [x] Task 6: 整体验证与微调
- **Priority**: medium
- **Depends On**: Task 1-5
- **Description**: 
  - 验证所有页面布局是否符合设计规范
  - 验证交互反馈效果
  - 微调细节问题
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-6.1: 整体检查页面是否简洁现代
  - `human-judgment` TR-6.2: 检查所有交互是否流畅
  - `human-judgment` TR-6.3: 检查界面是否有足够呼吸感
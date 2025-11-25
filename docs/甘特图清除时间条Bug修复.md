# 甘特图清除时间条 - Bug 修复说明

## Bug：清除时间条后其他任务进度条长度变短

### 问题描述

**现象**：
- 清除任务2的时间条后
- 任务1和任务3的进度条长度变短了（看起来像1天）
- 但点击查看详情时，日期数据是正确的
- 实际上任务的日期没有改变，只是显示出了问题

**影响**：
- 严重影响用户体验
- 让用户误以为任务的日期被修改了
- 虽然数据正确，但显示错误

### 问题原因

在 `getDateRange` 函数中，计算日期范围时没有过滤掉没有日期的任务：

```typescript
// 问题代码
const dates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
```

**问题分析**：

1. 当任务的 `startDate` 或 `endDate` 为空字符串时
2. `new Date('')` 会返回 `Invalid Date`
3. `Invalid Date` 的 `getTime()` 返回 `NaN`
4. `Math.min(...[正常时间戳, NaN, 正常时间戳])` 会返回 `NaN`
5. `new Date(NaN)` 创建一个无效日期
6. 导致日期范围计算错误，可能变成很小的范围（如1天）
7. 所有进度条被压缩到这个很小的范围内

**示例**：

```javascript
// 假设有3个任务
const task1 = { startDate: '2024-11-20', endDate: '2024-11-25' }; // 6天
const task2 = { startDate: '', endDate: '' }; // 清除后
const task3 = { startDate: '2024-11-24', endDate: '2024-11-29' }; // 6天

// 问题代码的执行过程
const dates = [
  new Date('2024-11-20'), // 有效
  new Date('2024-11-25'), // 有效
  new Date(''),           // Invalid Date
  new Date(''),           // Invalid Date
  new Date('2024-11-24'), // 有效
  new Date('2024-11-29')  // 有效
];

const timestamps = dates.map(d => d.getTime());
// [1700438400000, 1700870400000, NaN, NaN, 1700784000000, 1701216000000]

const minDate = new Date(Math.min(...timestamps));
// Math.min(1700438400000, 1700870400000, NaN, NaN, 1700784000000, 1701216000000)
// = NaN
// new Date(NaN) = Invalid Date

// 结果：日期范围计算失败，导致显示错误
```

### 修复方案

在计算日期范围之前，过滤掉没有有效日期的任务：

```typescript
// 修复后的代码
// 只考虑有有效日期的任务
const dates = tasks
  .filter(t => t.startDate && t.endDate) // 过滤掉没有日期的任务
  .flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);

// 如果没有有效日期的任务，使用默认范围
if (dates.length === 0) {
  const today = new Date();
  switch (viewMode) {
    case 'week':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
      };
    case 'month':
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
      };
    case 'quarter':
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 6, 1),
        end: new Date(today.getFullYear(), today.getMonth() + 6, 0),
      };
    case 'year':
      return {
        start: new Date(today.getFullYear() - 1, 0, 1),
        end: new Date(today.getFullYear() + 1, 11, 31),
      };
    default:
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
      };
  }
}

const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
```

**修复逻辑**：

1. 使用 `.filter(t => t.startDate && t.endDate)` 过滤掉没有日期的任务
2. 只对有有效日期的任务计算日期范围
3. 如果所有任务都没有日期（`dates.length === 0`），使用默认日期范围
4. 这样可以确保 `Math.min` 和 `Math.max` 只处理有效的时间戳

### 修复效果

修复后的行为：

- ✅ 清除任务2的时间条后，任务2的进度条消失
- ✅ 任务1的进度条长度保持不变（仍然是6天）
- ✅ 任务3的进度条长度保持不变（仍然是6天）
- ✅ 日期范围基于有效日期的任务计算
- ✅ 如果所有任务都没有日期，使用默认日期范围（如周视图显示前7天到后21天）
- ✅ 任务2的背景格子保留
- ✅ 任务2的名称和其他字段保留

### 测试验证

#### 测试场景 1：清除中间任务

1. 创建包含 3 个任务的甘特图：
   - 任务1：2024-11-20 到 2024-11-25（6天）
   - 任务2：2024-11-22 到 2024-11-27（6天）
   - 任务3：2024-11-24 到 2024-11-29（6天）

2. 记录任务1和任务3的进度条长度（目测或截图）

3. 清除任务2的时间条

4. 验证：
   - [ ] 任务2的进度条消失
   - [ ] 任务1的进度条长度不变（仍然是6天）
   - [ ] 任务3的进度条长度不变（仍然是6天）
   - [ ] 任务2的背景格子保留
   - [ ] 日期范围没有变化

5. 重新设置任务2的日期，确认进度条恢复

#### 测试场景 2：清除所有任务

1. 创建包含 2 个任务的甘特图

2. 清除任务1的时间条

3. 清除任务2的时间条

4. 验证：
   - [ ] 两个任务的进度条都消失
   - [ ] 背景格子仍然显示
   - [ ] 显示默认的日期范围（如周视图显示前7天到后21天）
   - [ ] 今天的标记线正常显示

5. 重新设置任务1的日期，确认进度条恢复

#### 测试场景 3：清除第一个任务

1. 创建包含 3 个任务的甘特图

2. 清除任务1的时间条

3. 验证：
   - [ ] 任务1的进度条消失
   - [ ] 任务2和任务3的进度条长度不变
   - [ ] 日期范围基于任务2和任务3计算

#### 测试场景 4：清除最后一个任务

1. 创建包含 3 个任务的甘特图

2. 清除任务3的时间条

3. 验证：
   - [ ] 任务3的进度条消失
   - [ ] 任务1和任务2的进度条长度不变
   - [ ] 日期范围基于任务1和任务2计算

### 影响范围

**影响的功能**：
- 日期范围的计算（`getDateRange` 函数）
- 所有任务的进度条显示
- 时间轴的显示范围

**不影响的功能**：
- 任务数据本身（日期数据正确）
- 筛选功能
- 排序功能
- 分组功能
- 其他右键菜单选项

### 代码变更

**文件**：`apps/client/src/features/editor/components/gantt/gantt-view.tsx`

**位置**：`getDateRange` 函数

**变更行数**：约 +30 行

**变更类型**：Bug 修复

### 相关 Bug

这个 Bug 与之前修复的"清除时间条后背景格子消失"是不同的问题：

| Bug | 现象 | 原因 | 修复 |
|-----|------|------|------|
| 背景格子消失 | 清除后背景格子消失 | 渲染逻辑没有判断日期是否为空 | 添加条件判断 `if (!task.startDate \|\| !task.endDate) return null;` |
| 进度条长度变短 | 清除后其他任务进度条变短 | 日期范围计算包含了无效日期 | 过滤掉没有日期的任务 `.filter(t => t.startDate && t.endDate)` |

两个 Bug 都与清除时间条有关，但原因和修复方法不同。

### 回归测试

修复后需要测试以下功能，确保没有引入新的问题：

- [ ] 添加任务
- [ ] 编辑任务
- [ ] 删除任务
- [ ] 拖拽调整任务时间
- [ ] 拖拽移动任务
- [ ] 切换视图模式（周/月/季/年）
- [ ] 筛选功能
- [ ] 排序功能
- [ ] 分组功能
- [ ] 配置保存
- [ ] 其他右键菜单选项

### 总结

**问题**：清除时间条后，其他任务的进度条长度变短

**原因**：日期范围计算时包含了无效日期（空字符串），导致 `Math.min` 和 `Math.max` 返回 `NaN`

**修复**：过滤掉没有日期的任务，只对有效日期的任务计算日期范围

**状态**：✅ 已修复

**测试**：需要进行完整的测试验证

---

## 相关文档

- [甘特图右键菜单功能说明](./甘特图右键菜单功能说明.md)
- [甘特图右键菜单快速测试](./甘特图右键菜单快速测试.md)
- [甘特图右键菜单Bug修复说明](./甘特图右键菜单Bug修复说明.md)
- [甘特图清除时间条详细测试](./甘特图清除时间条详细测试.md)
- [甘特图清除时间条验证步骤](./甘特图清除时间条验证步骤.md)

---

## Bug 4：清除时间条后编辑任务显示 "Invalid Date"

### 问题描述

**现象**：
- 清除任务的时间条后
- 点击任务打开编辑对话框
- 开始日期和结束日期显示 "Invalid Date"
- 无法点击日期选择器打开日历控件

**影响**：
- 用户无法重新设置任务的日期
- 必须刷新页面才能恢复

### 问题原因

在编辑任务的模态框中，日期输入框的代码：

```typescript
<DatePickerInput
  value={new Date(editingTask.startDate)}  // 问题：当startDate为空字符串时，new Date('') 返回 Invalid Date
  onChange={(date: any) => {
    if (date) {
      const dateObj = date instanceof Date ? date : new Date(date);
      setEditingTask({ ...editingTask, startDate: dateObj.toISOString().split('T')[0] });
    }
  }}
/>
```

**问题分析**：
1. 清除时间条后，`startDate` 和 `endDate` 被设置为空字符串 `''`
2. `new Date('')` 创建一个 `Invalid Date` 对象
3. DatePickerInput 组件接收到 `Invalid Date`，显示为 "Invalid Date"
4. 日历控件无法正常工作

### 修复方案

修改日期输入框的代码，当日期为空时传入 `null`，并添加 `placeholder` 和 `valueFormat`：

```typescript
<DatePickerInput
  value={editingTask.startDate ? new Date(editingTask.startDate) : null}
  onChange={(date: any) => {
    if (date) {
      const dateObj = date instanceof Date ? date : new Date(date);
      setEditingTask({ ...editingTask, startDate: dateObj.toISOString().split('T')[0] });
    } else {
      setEditingTask({ ...editingTask, startDate: '' });
    }
  }}
  placeholder="年/月/日"
  valueFormat="YYYY/MM/DD"
  clearable
/>
```

**修复要点**：
1. 使用三元运算符：`editingTask.startDate ? new Date(editingTask.startDate) : null`
2. 当日期为空时，传入 `null` 而不是 `Invalid Date`
3. 添加 `placeholder="年/月/日"` 显示提示文本
4. 添加 `valueFormat="YYYY/MM/DD"` 指定日期格式
5. 添加 `clearable` 允许清除日期
6. 在 `onChange` 中处理清除操作（`date` 为 `null` 时）

### 修复效果

修复后的行为：
- ✅ 清除时间条后，打开编辑对话框
- ✅ 开始日期和结束日期显示 "年/月/日" 占位符
- ✅ 点击日期输入框，日历控件正常打开
- ✅ 可以选择新的日期
- ✅ 日期格式显示为 "YYYY/MM/DD"（如：2024/11/25）
- ✅ 可以点击清除按钮清除日期

### 测试验证

1. 创建一个任务，设置开始和结束日期
2. 右键点击进度条，选择"清除时间条"
3. 点击任务打开编辑对话框
4. 验证：
   - [ ] 开始日期显示 "年/月/日" 而不是 "Invalid Date"
   - [ ] 结束日期显示 "年/月/日" 而不是 "Invalid Date"
   - [ ] 点击开始日期输入框，日历控件正常打开
   - [ ] 点击结束日期输入框，日历控件正常打开
   - [ ] 选择日期后，显示格式为 "YYYY/MM/DD"
   - [ ] 点击保存，进度条重新出现
   - [ ] 进度条位置和长度正确

### 代码变更

**文件**：`apps/client/src/features/editor/components/gantt/gantt-view.tsx`

**位置**：编辑任务模态框的日期输入部分

**变更内容**：
- 开始日期输入框：修改 `value` 属性，添加 `placeholder`、`valueFormat`、`clearable`
- 结束日期输入框：修改 `value` 属性，添加 `placeholder`、`valueFormat`、`clearable`
- 两个输入框的 `onChange` 都添加了清除日期的处理

**变更行数**：约 +10 行

---

## 更新日志

**2024-11-25**
- 发现并修复清除时间条后其他任务进度条长度变短的问题
- 在 `getDateRange` 函数中添加过滤逻辑
- 添加默认日期范围的处理
- 创建详细的测试场景和验证步骤
- 修复清除时间条后编辑任务显示 "Invalid Date" 的问题
- 添加日期输入框的占位符和格式化

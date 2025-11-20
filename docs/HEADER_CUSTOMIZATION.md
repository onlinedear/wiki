# 顶部导航栏定制

## 修改内容

### 1. 左上角 - 显示工作空间名称 ✅

**修改前**: 显示固定文本 "Docmost"  
**修改后**: 显示工作空间设置中的名称

**位置**: 页面顶部左侧  
**来源**: 工作空间设置 → 常规 → 名称

**修改文件**:
- `apps/client/src/components/layouts/global/app-header.tsx`

**修改内容**:
```typescript
// 添加导入
import { currentUserAtom } from "@/features/user/atoms/current-user-atom.ts";

// 获取工作空间信息
const [currentUser] = useAtom(currentUserAtom);
const workspace = currentUser?.workspace;

// 显示工作空间名称
<Text
  size="lg"
  fw={600}
  style={{ cursor: "pointer", userSelect: "none" }}
  component={Link}
  to="/home"
>
  {workspace?.name || "Docmost"}
</Text>
```

---

### 2. 右上角 - 显示用户头像和名称 ✅

**修改前**: 显示工作空间图标和名称  
**修改后**: 显示当前登录用户的头像和名称

**位置**: 页面顶部右侧  
**来源**: 当前登录用户信息

**修改文件**:
- `apps/client/src/components/layouts/global/top-menu.tsx`

**修改内容**:
```typescript
// 修改前
<CustomAvatar
  avatarUrl={workspace?.logo}
  name={workspace?.name}
  variant="filled"
  size="sm"
  type={AvatarIconType.WORKSPACE_ICON}
/>
<Text fw={500} size="sm" lh={1} mr={3} lineClamp={1}>
  {workspace?.name}
</Text>

// 修改后
<CustomAvatar
  avatarUrl={user?.avatarUrl}
  name={user?.name}
  variant="filled"
  size="sm"
/>
<Text fw={500} size="sm" lh={1} mr={3} lineClamp={1}>
  {user?.name}
</Text>
```

---

## 效果说明

### 左上角（工作空间名称）
- 显示在 Docmost logo 位置
- 点击可返回首页
- 名称来自：设置 → 工作空间 → 常规 → 名称
- 如果未设置，显示默认值 "Docmost"

### 右上角（用户信息）
- 显示当前登录用户的头像
- 显示当前登录用户的名称
- 点击打开下拉菜单
- 菜单中包含：
  - 工作空间设置
  - 管理成员
  - 我的资料
  - 我的偏好设置
  - 主题切换
  - 退出登录

---

## 测试步骤

1. **测试工作空间名称显示**:
   - 刷新浏览器
   - 查看左上角是否显示工作空间名称
   - 进入设置 → 工作空间 → 常规
   - 修改名称并保存
   - 刷新页面，确认左上角名称已更新

2. **测试用户信息显示**:
   - 查看右上角是否显示用户头像和名称
   - 点击头像打开菜单
   - 确认菜单功能正常

---

## 修改统计

- **修改文件**: 2 个
- **新增代码**: ~10 行
- **修改代码**: ~15 行

---

## 完成状态

✅ 左上角显示工作空间名称  
✅ 右上角显示用户头像和名称  
✅ 无 TypeScript 错误  
✅ 可以测试

---

**修改时间**: 2025-11-18  
**修改者**: Kiro AI Assistant

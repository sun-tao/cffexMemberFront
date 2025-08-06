<template>
  <div class="member-layout">
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <h2>会员管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ authStore.userInfo.username }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边导航 -->
        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="$route.path"
            router
            class="sidebar-menu"
          >
            <el-menu-item index="/member">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/member/apply">
              <el-icon><DocumentAdd /></el-icon>
              <span>提交申请</span>
            </el-menu-item>
            <el-menu-item index="/member/applications">
              <el-icon><List /></el-icon>
              <span>查看申请</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区域 -->
        <el-main class="main-content">
          <!-- 面包屑导航 -->
          <el-breadcrumb class="breadcrumb" separator="/">
            <el-breadcrumb-item :to="{ path: '/member' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">
              {{ $route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, House, DocumentAdd, List } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      // 退出登录
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消操作
    }
  }
}
</script>

<style scoped>
.member-layout {
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.user-info:hover {
  color: #409eff;
}

.user-info .el-icon {
  margin-right: 5px;
}

.sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: #606266;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  min-height: calc(100vh - 140px);
}
</style>
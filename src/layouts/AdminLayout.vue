<template>
    <div class="admin-layout">
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <h2>交易所管理系统</h2>
            <el-tag type="success" size="small">管理端</el-tag>
          </div>
          <div class="header-right">
            <!-- 待处理数量提醒 -->
            <el-badge :value="pendingCount" :max="99" class="pending-badge">
              <el-button
                type="primary"
                text
                :icon="Bell"
                @click="$router.push('/admin/pending')"
              >
                待处理任务
              </el-button>
            </el-badge>
            
            <!-- 用户信息 -->
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ authStore.userInfo.username }}
                <span class="user-role">{{ getDepartmentName() }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
  
        <el-container>
          <!-- 侧边导航 -->
          <el-aside width="220px" class="sidebar">
            <el-menu
              :default-active="$route.path"
              router
              class="sidebar-menu"
            >
              <el-menu-item index="/admin">
                <el-icon><House /></el-icon>
                <span>工作台</span>
              </el-menu-item>
              
              <el-menu-item index="/admin/pending">
                <el-icon><Clock /></el-icon>
                <span>待审批任务</span>
                <el-badge
                  v-if="pendingCount > 0"
                  :value="pendingCount"
                  :max="99"
                  class="menu-badge"
                />
              </el-menu-item>
              
              <el-menu-item index="/admin/applications">
                <el-icon><List /></el-icon>
                <span>申请管理</span>
              </el-menu-item>
              
              <el-menu-item index="/admin/history">
                <el-icon><Document /></el-icon>
                <span>审批历史</span>
              </el-menu-item>
              
              <el-menu-item index="/admin/statistics">
                <el-icon><DataAnalysis /></el-icon>
                <span>统计报告</span>
              </el-menu-item>
            </el-menu>
          </el-aside>
  
          <!-- 主内容区域 -->
          <el-main class="main-content">
            <!-- 面包屑导航 -->
            <el-breadcrumb class="breadcrumb" separator="/">
              <el-breadcrumb-item :to="{ path: '/admin' }">工作台</el-breadcrumb-item>
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
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    User,
    ArrowDown,
    House,
    Clock,
    List,
    Document,
    DataAnalysis,
    Bell
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  // 响应式数据
  const pendingCount = ref(0)
  
  // 计算属性
  const getDepartmentName = () => {
    // 根据用户信息返回部门名称
    if (authStore.isTradingStaff) {
      return '交易部'
    } else if (authStore.isClearingStaff) {
      return '结算部'
    }
    return '管理员'
  }
  
  // 页面加载时获取待处理数量
  onMounted(() => {
    fetchPendingCount()
  })
  
  // 获取待处理任务数量
  const fetchPendingCount = async () => {
    try {
      // 这里调用API获取待处理数量
      // const response = await getPendingCount()
      // pendingCount.value = response.count
      
      // 模拟数据
      pendingCount.value = 3
    } catch (error) {
      console.error('获取待处理数量失败:', error)
    }
  }
  
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
    } else if (command === 'profile') {
      ElMessage.info('个人信息功能开发中...')
    }
  }
  </script>
  
  <style scoped>
  .admin-layout {
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
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .header-left h2 {
    margin: 0;
    color: #303133;
    font-weight: 500;
    font-size: 18px;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .pending-badge {
    margin-right: 8px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .user-info:hover {
    color: #409eff;
    background-color: #ecf5ff;
  }
  
  .user-info .el-icon {
    margin-right: 6px;
  }
  
  .user-role {
    margin-left: 8px;
    padding: 2px 8px;
    background-color: #f0f2f5;
    border-radius: 12px;
    font-size: 12px;
    color: #909399;
  }
  
  .sidebar {
    background-color: #f8f9fa;
    border-right: 1px solid #e4e7ed;
  }
  
  .sidebar-menu {
    border-right: none;
    background-color: transparent;
    padding: 12px 0;
  }
  
  .sidebar-menu .el-menu-item {
    color: #606266;
    margin: 0 12px 4px 12px;
    border-radius: 6px;
    position: relative;
  }
  
  .sidebar-menu .el-menu-item:hover {
    background-color: #ecf5ff;
    color: #409eff;
  }
  
  .sidebar-menu .el-menu-item.is-active {
    background-color: #409eff;
    color: #fff;
  }
  
  .menu-badge {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
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
    border-radius: 8px;
    padding: 24px;
    min-height: calc(100vh - 140px);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .header-left h2 {
      display: none;
    }
    
    .sidebar {
      width: 180px !important;
    }
    
    .sidebar-menu .el-menu-item span {
      font-size: 13px;
    }
    
    .user-role {
      display: none;
    }
  }
  </style>
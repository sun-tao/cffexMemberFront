<template>
    <div class="admin-dashboard">
      <!-- 欢迎区域 -->
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-left">
            <h2>管理工作台</h2>
            <p>{{ greeting }}，{{ authStore.userInfo.username }}！</p>
            <div class="quick-stats">
              <span>今日待处理：<strong class="highlight">{{ todayPending }}</strong> 个</span>
              <span>本周已处理：<strong class="success">{{ weekProcessed }}</strong> 个</span>
            </div>
          </div>
          <div class="welcome-right">
            <el-button
              type="primary"
              size="large"
              :icon="Clock"
              @click="$router.push('/admin/pending')"
              v-if="todayPending > 0"
            >
              立即处理 ({{ todayPending }})
            </el-button>
          </div>
        </div>
      </el-card>
  
      <!-- 数据统计 -->
      <el-row class="stats-section" :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card pending" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.pending }}</div>
                <div class="stat-label">待审批</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon up"><TrendCharts /></el-icon>
                  比昨日 +{{ statistics.pendingChange }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card approved" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.approved }}</div>
                <div class="stat-label">已通过</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon up"><TrendCharts /></el-icon>
                  本周 +{{ statistics.weekApproved }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rejected" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.rejected }}</div>
                <div class="stat-label">已拒绝</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon down"><TrendCharts /></el-icon>
                  本周 -{{ statistics.weekRejected }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card total" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Files /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.total }}</div>
                <div class="stat-label">总申请</div>
                <div class="stat-trend">
                  <span class="efficiency">效率 {{ statistics.efficiency }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <el-row :gutter="20">
        <!-- 待处理任务 -->
        <el-col :span="12">
          <el-card class="pending-tasks">
            <template #header>
              <div class="card-header">
                <span>待处理任务</span>
                <el-button
                  type="primary"
                  text
                  @click="$router.push('/admin/pending')"
                >
                  查看全部
                </el-button>
              </div>
            </template>
  
            <div v-if="pendingTasks.length > 0">
              <div
                v-for="task in pendingTasks"
                :key="task.applicationId"
                class="task-item"
                @click="handleTask(task)"
              >
                <div class="task-info">
                  <div class="task-header">
                    <span class="task-id">#{{ task.applicationId }}</span>
                    <el-tag type="warning" size="small">{{ task.currentNode }}</el-tag>
                  </div>
                  <div class="task-name">{{ task.applicantUserName }}</div>
                  <div class="task-time">
                    提交时间：{{ formatDateTime(task.submittedAt) }}
                  </div>
                </div>
                <div class="task-action">
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="handleTask(task)"
                  >
                    立即处理
                  </el-button>
                </div>
              </div>
            </div>
  
            <el-empty v-else description="暂无待处理任务" :image-size="80">
              <el-button type="primary" text>保持关注</el-button>
            </el-empty>
          </el-card>
        </el-col>
  
        <!-- 最近审批记录 -->
        <el-col :span="12">
          <el-card class="recent-approvals">
            <template #header>
              <div class="card-header">
                <span>最近审批</span>
                <el-button
                  type="primary"
                  text
                  @click="$router.push('/admin/history')"
                >
                  查看更多
                </el-button>
              </div>
            </template>
  
            <div v-if="recentApprovals.length > 0">
              <div
                v-for="approval in recentApprovals"
                :key="approval.historyId"
                class="approval-item"
              >
                <div class="approval-info">
                  <div class="approval-header">
                    <span class="approval-member">{{ approval.memberName }}</span>
                    <el-tag
                      :type="approval.result === 'APPROVE' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ approval.result === 'APPROVE' ? '通过' : '拒绝' }}
                    </el-tag>
                  </div>
                  <div class="approval-node">{{ approval.nodeName }}</div>
                  <div class="approval-time">
                    {{ formatDateTime(approval.completedAt) }}
                  </div>
                </div>
              </div>
            </div>
  
            <el-empty v-else description="暂无审批记录" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 快捷操作 -->
      <el-card class="quick-actions">
        <template #header>
          <span>快捷操作</span>
        </template>
  
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="quick-action-item" @click="$router.push('/admin/pending')">
              <el-icon class="action-icon"><Clock /></el-icon>
              <div class="action-text">
                <div class="action-title">待审批任务</div>
                <div class="action-desc">处理待审批的申请</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="quick-action-item" @click="$router.push('/admin/applications')">
              <el-icon class="action-icon"><List /></el-icon>
              <div class="action-text">
                <div class="action-title">申请管理</div>
                <div class="action-desc">查看所有申请记录</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="quick-action-item" @click="$router.push('/admin/history')">
              <el-icon class="action-icon"><Document /></el-icon>
              <div class="action-text">
                <div class="action-title">审批历史</div>
                <div class="action-desc">查看历史审批记录</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="quick-action-item" @click="$router.push('/admin/statistics')">
              <el-icon class="action-icon"><DataAnalysis /></el-icon>
              <div class="action-text">
                <div class="action-title">统计报告</div>
                <div class="action-desc">查看审批统计数据</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Clock,
    CircleCheck,
    CircleClose,
    Files,
    TrendCharts,
    List,
    Document,
    DataAnalysis
  } from '@element-plus/icons-vue'
  
  import { useAuthStore } from '@/stores/auth'
  import { getPendingApplications, getApprovalHistory } from '@/api/admin'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  // 响应式数据
  const loading = ref(false)
  const pendingTasks = ref([])
  const recentApprovals = ref([])
  
  // 计算属性
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  })
  
  const todayPending = computed(() => pendingTasks.value.length)
  const weekProcessed = computed(() => 28) // 模拟数据
  
  // 统计数据
  const statistics = ref({
    pending: 12,
    approved: 156,
    rejected: 23,
    total: 191,
    pendingChange: 3,
    weekApproved: 28,
    weekRejected: 5,
    efficiency: 92
  })
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchDashboardData()
  })
  
  // 获取工作台数据
  const fetchDashboardData = async () => {
    try {
      loading.value = true
      
      // 获取待处理任务
      const pendingResponse = await getPendingApplications({
        page: 1,
        pageSize: 5
      })
      pendingTasks.value = pendingResponse.content || []
      
      // 获取最近审批记录
      const historyResponse = await getApprovalHistory({
        page: 1,
        pageSize: 5
      })
      recentApprovals.value = historyResponse.data.content || []
      
    } catch (error) {
      console.error('获取工作台数据失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 处理任务
  const handleTask = (task) => {
    router.push(`/admin/pending/${task.applicationId}`)
  }
  
  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      const now = new Date()
      const diffTime = now - date
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffHours < 1) {
        return '刚刚'
      } else if (diffHours < 24) {
        return `${diffHours}小时前`
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit'
        })
      }
    } catch {
      return dateTime
    }
  }
  </script>
  
  <style scoped>
  .admin-dashboard {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .welcome-card {
    margin-bottom: 24px;
  }
  
  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
  }
  
  .welcome-left h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
  
  .welcome-left p {
    margin: 0 0 12px 0;
    color: #909399;
    font-size: 16px;
  }
  
  .quick-stats {
    display: flex;
    gap: 24px;
    font-size: 14px;
  }
  
  .quick-stats .highlight {
    color: #e6a23c;
  }
  
  .quick-stats .success {
    color: #67c23a;
  }
  
  .stats-section {
    margin-bottom: 24px;
  }
  
  .stat-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
  }
  
  .stat-card.pending {
    border-left-color: #e6a23c;
  }
  
  .stat-card.approved {
    border-left-color: #67c23a;
  }
  
  .stat-card.rejected {
    border-left-color: #f56c6c;
  }
  
  .stat-card.total {
    border-left-color: #909399;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
  
  .stat-icon {
    margin-right: 16px;
    font-size: 36px;
    opacity: 0.8;
  }
  
  .stat-card.pending .stat-icon {
    color: #e6a23c;
  }
  
  .stat-card.approved .stat-icon {
    color: #67c23a;
  }
  
  .stat-card.rejected .stat-icon {
    color: #f56c6c;
  }
  
  .stat-card.total .stat-icon {
    color: #909399;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-number {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    line-height: 1;
    margin-bottom: 6px;
  }
  
  .stat-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #909399;
  }
  
  .trend-icon {
    margin-right: 4px;
    font-size: 12px;
  }
  
  .trend-icon.up {
    color: #67c23a;
  }
  
  .trend-icon.down {
    color: #f56c6c;
  }
  
  .efficiency {
    color: #409eff;
    font-weight: 500;
  }
  
  .pending-tasks,
  .recent-approvals,
  .quick-actions {
    margin-bottom: 24px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }
  
  .task-item,
  .approval-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .task-item:last-child,
  .approval-item:last-child {
    margin-bottom: 0;
  }
  
  .task-item:hover {
    background-color: #f8f9fa;
    border-color: #409eff;
  }
  
  .task-info,
  .approval-info {
    flex: 1;
  }
  
  .task-header,
  .approval-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .task-id {
    font-weight: 600;
    color: #409eff;
    font-size: 14px;
  }
  
  .task-name,
  .approval-member {
    color: #303133;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .task-time,
  .approval-time {
    color: #909399;
    font-size: 13px;
  }
  
  .approval-node {
    color: #606266;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .quick-action-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 80px;
  }
  
  .quick-action-item:hover {
    background-color: #f8f9fa;
    border-color: #409eff;
    transform: translateY(-2px);
  }
  
  .action-icon {
    font-size: 24px;
    color: #409eff;
    margin-right: 16px;
  }
  
  .action-text {
    flex: 1;
  }
  
  .action-title {
    color: #303133;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .action-desc {
    color: #909399;
    font-size: 13px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .welcome-content {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
    
    .quick-stats {
      flex-direction: column;
      gap: 8px;
    }
    
    .stats-section .el-col {
      margin-bottom: 16px;
    }
    
    .quick-actions .el-col {
      margin-bottom: 16px;
    }
  }
  </style>
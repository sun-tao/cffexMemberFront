<template>
    <div class="member-dashboard">
      <!-- 欢迎区域 -->
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-left">
            <h2>欢迎回来，{{ authStore.getDisplayName }}</h2>
            <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
          </div>
          <div class="welcome-right">
            <el-button
              type="primary"
              size="large"
              :icon="Plus"
              @click="$router.push('/member/apply')"
            >
              提交新申请
            </el-button>
          </div>
        </div>
      </el-card>
  
      <!-- 数据统计 -->
      <el-row class="stats-section" :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card total" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Files /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.total }}</div>
                <div class="stat-label">总申请数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card processing" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.processing }}</div>
                <div class="stat-label">处理中</div>
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
                <div class="stat-number">{{ statistics.rejected + statistics.returned }}</div>
                <div class="stat-label">需处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 最近申请 -->
      <el-card class="recent-applications">
        <template #header>
          <div class="card-header">
            <span>最近申请</span>
            <el-button
              type="primary"
              text
              @click="$router.push('/member/applications')"
            >
              查看全部
            </el-button>
          </div>
        </template>
  
        <div v-if="recentApplications.length > 0">
          <div
            v-for="application in recentApplications"
            :key="application.applicationId"
            class="application-item"
            @click="viewApplication(application)"
          >
            <div class="application-info">
              <div class="application-header">
                <span class="application-id">#{{ application.applicationId }}</span>
                <StatusTag :status="application.status" size="small" />
              </div>
              <div class="application-name">{{ application.memberName }}</div>
              <div class="application-time">
                提交时间：{{ formatDateTime(application.submittedAt) }}
              </div>
            </div>
            <div class="application-action">
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
  
        <el-empty v-else description="暂无申请记录">
          <el-button
            type="primary"
            @click="$router.push('/member/apply')"
          >
            提交第一个申请
          </el-button>
        </el-empty>
      </el-card>
  
      <!-- 快捷操作 -->
      <el-card class="quick-actions">
        <template #header>
          <span>快捷操作</span>
        </template>
  
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="quick-action-item" @click="$router.push('/member/apply')">
              <el-icon class="action-icon"><DocumentAdd /></el-icon>
              <div class="action-text">
                <div class="action-title">提交申请</div>
                <div class="action-desc">提交新的会员申请</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="quick-action-item" @click="$router.push('/member/applications')">
              <el-icon class="action-icon"><List /></el-icon>
              <div class="action-text">
                <div class="action-title">查看申请</div>
                <div class="action-desc">查看所有申请记录</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="quick-action-item" @click="viewProcessingApplications">
              <el-icon class="action-icon"><Clock /></el-icon>
              <div class="action-text">
                <div class="action-title">处理中申请</div>
                <div class="action-desc">查看待审批申请</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
  
      <!-- 系统公告 -->
      <el-card class="announcements">
        <template #header>
          <span>系统公告</span>
        </template>
  
        <div class="announcement-list">
          <div
            v-for="(announcement, index) in announcements"
            :key="index"
            class="announcement-item"
          >
            <div class="announcement-content">
              <div class="announcement-title">{{ announcement.title }}</div>
              <div class="announcement-desc">{{ announcement.content }}</div>
              <div class="announcement-time">{{ announcement.publishTime }}</div>
            </div>
            <el-tag
              v-if="announcement.important"
              type="danger"
              size="small"
            >
              重要
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Plus,
    Files,
    Clock,
    CircleCheck,
    CircleClose,
    ArrowRight,
    DocumentAdd,
    List
  } from '@element-plus/icons-vue'
  
  import StatusTag from '@/components/common/StatusTag.vue'
  import { useAuthStore } from '@/stores/auth'
  import { useApplicationStore } from '@/stores/application'
  import { getApplicationList } from '@/api/application'
  import { APPLICATION_STATUS } from '@/utils/constants'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const applicationStore = useApplicationStore()
  
  // 响应式数据
  const loading = ref(false)
  
  // 计算属性
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  })
  
  const statistics = computed(() => applicationStore.getStatistics())
  const recentApplications = computed(() => {
    return applicationStore.applicationList.slice(0, 5)
  })
  
  // 模拟公告数据
  const announcements = ref([
    {
      title: '系统维护通知',
      content: '系统将于本周六凌晨2:00-4:00进行维护升级，期间可能影响正常使用。',
      publishTime: '2024-08-05 09:00',
      important: true
    },
    {
      title: '申请流程优化',
      content: '为提升用户体验，我们对申请审批流程进行了优化，审批时间将缩短至3个工作日。',
      publishTime: '2024-08-01 14:30',
      important: false
    },
    {
      title: '新功能上线',
      content: '新增申请进度实时提醒功能，您可以及时了解申请状态变化。',
      publishTime: '2024-07-28 10:15',
      important: false
    }
  ])
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchDashboardData()
  })
  
  // 获取仪表板数据
  const fetchDashboardData = async () => {
    try {
      loading.value = true
      
      // 获取最近的申请列表
      const response = await getApplicationList({
        page: 1,
        pageSize: 10
      })
      
      applicationStore.setApplicationList(response)
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 查看申请详情
  const viewApplication = (application) => {
    router.push(`/member/applications/${application.applicationId}`)
  }
  
  // 查看处理中的申请
  const viewProcessingApplications = () => {
    router.push({
      path: '/member/applications',
      query: { status: APPLICATION_STATUS.PROCESSING }
    })
  }
  
  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateTime
    }
  }
  </script>
  
  <style scoped>
  .member-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
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
    margin: 0;
    color: #909399;
    font-size: 16px;
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
  
  .stat-card.total {
    border-left-color: #909399;
  }
  
  .stat-card.processing {
    border-left-color: #e6a23c;
  }
  
  .stat-card.approved {
    border-left-color: #67c23a;
  }
  
  .stat-card.rejected {
    border-left-color: #f56c6c;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
  
  .stat-icon {
    margin-right: 16px;
    font-size: 32px;
    opacity: 0.8;
  }
  
  .stat-card.total .stat-icon {
    color: #909399;
  }
  
  .stat-card.processing .stat-icon {
    color: #e6a23c;
  }
  
  .stat-card.approved .stat-icon {
    color: #67c23a;
  }
  
  .stat-card.rejected .stat-icon {
    color: #f56c6c;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    color: #909399;
    font-size: 14px;
  }
  
  .recent-applications,
  .quick-actions,
  .announcements {
    margin-bottom: 24px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }
  
  .application-item {
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
  
  .application-item:last-child {
    margin-bottom: 0;
  }
  
  .application-item:hover {
    background-color: #f8f9fa;
    border-color: #409eff;
  }
  
  .application-info {
    flex: 1;
  }
  
  .application-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .application-id {
    font-weight: 600;
    color: #409eff;
    font-size: 14px;
  }
  
  .application-name {
    color: #303133;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .application-time {
    color: #909399;
    font-size: 13px;
  }
  
  .application-action {
    display: flex;
    align-items: center;
  }
  
  .arrow-icon {
    color: #c0c4cc;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  .application-item:hover .arrow-icon {
    color: #409eff;
    transform: translateX(4px);
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
  
  .announcement-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .announcement-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #409eff;
  }
  
  .announcement-content {
    flex: 1;
  }
  
  .announcement-title {
    color: #303133;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .announcement-desc {
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .announcement-time {
    color: #909399;
    font-size: 12px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .welcome-content {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
    
    .stats-section .el-col {
      margin-bottom: 16px;
    }
    
    .quick-actions .el-col {
      margin-bottom: 16px;
    }
    
    .announcement-item {
      flex-direction: column;
      gap: 12px;
    }
  }
  </style>
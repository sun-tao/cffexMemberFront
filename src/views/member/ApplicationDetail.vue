<template>
    <div class="application-detail">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="8" animated />
      </div>
  
      <!-- 详情内容 -->
      <div v-else-if="application">
        <!-- 申请状态卡片 -->
        <el-card class="status-card">
          <div class="status-header">
            <div class="status-left">
              <h3>申请编号：#{{ application.applicationId }}</h3>
              <div class="status-info">
                <StatusTag :status="application.status" size="large" />
                <span class="submit-time">
                  提交时间：{{ formatDateTime(application.submittedAt) }}
                </span>
              </div>
            </div>
            <div class="status-right">
              <el-button
                type="primary"
                :icon="Edit"
                @click="$router.push('/member/apply')"
                v-if="canEdit"
              >
                新建申请
              </el-button>
              <el-button
                :icon="Back"
                @click="$router.go(-1)"
              >
                返回列表
              </el-button>
            </div>
          </div>
        </el-card>
  
        <!-- 进度跟踪 -->
        <el-card class="progress-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              申请进度
            </div>
          </template>
          <ProgressTracker
            :status="application.status"
            :submitted-at="application.submittedAt"
            :approval-history="approvalHistory"
          />
        </el-card>
  
        <!-- 申请信息 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Office /></el-icon>
              申请信息
            </div>
          </template>
  
          <div class="info-content">
            <!-- 基本信息 -->
            <el-descriptions
              title="基本信息"
              :column="2"
              border
              class="info-section"
            >
              <el-descriptions-item label="公司名称">
                {{ application.formData?.memberName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="公司简称">
                {{ application.formData?.shortName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="英文名称">
                {{ application.formData?.englishName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="英文简称">
                {{ application.formData?.englishShortName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="会员类型">
                {{ getMemberTypeText(application.formData?.memberType) }}
              </el-descriptions-item>
              <el-descriptions-item label="结算代理机构">
                {{ application.formData?.clearingAgentName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="公司地址" span="2">
                {{ application.formData?.address || '-' }}
              </el-descriptions-item>
            </el-descriptions>
  
            <!-- 联系信息 -->
            <el-descriptions
              title="联系信息"
              :column="3"
              border
              class="info-section"
            >
              <el-descriptions-item label="联系人姓名">
                {{ application.formData?.contact?.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ application.formData?.contact?.phone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱地址">
                {{ application.formData?.contact?.email || '-' }}
              </el-descriptions-item>
            </el-descriptions>
  
            <!-- 公司简介 -->
            <div class="info-section">
              <h4>公司简介</h4>
              <div class="company-intro">
                {{ application.formData?.companyIntro || '-' }}
              </div>
            </div>
          </div>
        </el-card>
  
        <!-- 附件材料 -->
        <el-card class="attachments-card" v-if="attachments.length > 0">
          <template #header>
            <div class="card-header">
              <el-icon><FolderOpened /></el-icon>
              附件材料
            </div>
          </template>
  
          <div class="attachments-list">
            <div
              v-for="attachment in attachments"
              :key="attachment.attachmentId"
              class="attachment-item"
            >
              <div class="attachment-info">
                <el-icon class="file-icon"><Document /></el-icon>
                <div class="file-info">
                  <div class="file-name">{{ attachment.fileName }}</div>
                  <div class="file-meta">
                    上传时间：{{ formatDateTime(attachment.uploadTime) }}
                  </div>
                </div>
              </div>
              <div class="attachment-actions">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Download"
                  @click="downloadAttachment(attachment)"
                >
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
  
        <!-- 审批历史 -->
        <el-card class="approval-card" v-if="approvalHistory.length > 0">
          <template #header>
            <div class="card-header">
              <el-icon><Clock /></el-icon>
              审批历史
            </div>
          </template>
  
          <el-timeline class="approval-timeline">
            <el-timeline-item
              v-for="(item, index) in approvalHistory"
              :key="index"
              :timestamp="formatDateTime(item.createTime)"
              :type="getTimelineType(item.result)"
              placement="top"
              size="large"
            >
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="department">{{ item.department }}</span>
                  <StatusTag :status="item.result" size="small" />
                </div>
                <div class="timeline-comment" v-if="item.comment">
                  {{ item.comment }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
  
      <!-- 错误状态 -->
      <div v-else class="error-wrapper">
        <el-empty description="申请详情不存在或已被删除">
          <el-button type="primary" @click="$router.go(-1)">
            返回列表
          </el-button>
        </el-empty>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    OfficeBuilding,
    FolderOpened,
    Document,
    Download,
    Clock,
    Edit,
    Back,
    TrendCharts
  } from '@element-plus/icons-vue'
  
  import StatusTag from '@/components/common/StatusTag.vue'
  import ProgressTracker from '@/components/member/ProgressTracker.vue'
  import { getApplicationDetail, downloadAttachment as downloadFile } from '@/api/application'
  import { useApplicationStore } from '@/stores/application'
  import { MEMBER_TYPE_TEXT, APPLICATION_STATUS } from '@/utils/constants'
  
  // Props
  const props = defineProps({
    id: {
      type: [String, Number],
      required: true
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  const applicationStore = useApplicationStore()
  
  // 响应式数据
  const loading = ref(false)
  const application = ref(null)
  
  // 计算属性
  const attachments = computed(() => application.value?.attachments || [])
  const approvalHistory = computed(() => application.value?.approvalHistory || [])
  
  // 是否可以编辑（仅在被退回时可以重新提交）
  const canEdit = computed(() => {
    return application.value?.status === APPLICATION_STATUS.RETURNED
  })
  
  // 页面加载时获取详情
  onMounted(() => {
    fetchApplicationDetail()
  })
  
  // 获取申请详情
  const fetchApplicationDetail = async () => {
    try {
      loading.value = true
      
      const applicationId = props.id || route.params.id
      const response = await getApplicationDetail(applicationId)
      
      application.value = response
      applicationStore.setCurrentApplication(response)
      
    } catch (error) {
      console.error('获取申请详情失败:', error)
      ElMessage.error('获取申请详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取会员类型文本
  const getMemberTypeText = (memberType) => {
    return MEMBER_TYPE_TEXT[memberType] || memberType || '-'
  }
  
  // 下载附件
  const downloadAttachment = async (attachment) => {
    try {
      await downloadFile(attachment.attachmentId, attachment.fileName)
      ElMessage.success('下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      ElMessage.error('下载失败')
    }
  }
  
  // 获取时间线类型
  const getTimelineType = (status) => {
    const typeMap = {
      [APPLICATION_STATUS.PROCESSING]: 'warning',
      [APPLICATION_STATUS.APPROVED]: 'success',
      [APPLICATION_STATUS.REJECTED]: 'danger',
      [APPLICATION_STATUS.RETURNED]: 'info'
    }
    return typeMap[status] || 'info'
  }
  
  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
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
  .application-detail {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .loading-wrapper,
  .error-wrapper {
    padding: 40px;
  }
  
  .status-card {
    margin-bottom: 20px;
  }
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .status-left h3 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
  
  .status-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .submit-time {
    color: #909399;
    font-size: 14px;
  }
  
  .status-right {
    display: flex;
    gap: 12px;
  }
  
  .status-card,
  .progress-card,
  .info-card,
  .attachments-card,
  .approval-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }
  
  .card-header .el-icon {
    margin-right: 8px;
    color: #409eff;
  }
  
  .info-content {
    padding: 0;
  }
  
  .info-section {
    margin-bottom: 30px;
  }
  
  .info-section:last-child {
    margin-bottom: 0;
  }
  
  .info-section h4 {
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
  
  .company-intro {
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 4px;
    line-height: 1.6;
    color: #606266;
    white-space: pre-wrap;
  }
  
  .attachments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .attachment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }
  
  .attachment-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .file-icon {
    font-size: 24px;
    color: #409eff;
    margin-right: 12px;
  }
  
  .file-info {
    flex: 1;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .file-meta {
    font-size: 12px;
    color: #909399;
  }
  
  .approval-timeline {
    padding: 20px 0;
  }
  
  .timeline-content {
    padding-left: 16px;
  }
  
  .timeline-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .department {
    font-weight: 600;
    color: #303133;
  }
  
  .timeline-comment {
    padding: 12px;
    background-color: #f0f9ff;
    border-radius: 4px;
    border-left: 3px solid #409eff;
    color: #606266;
    line-height: 1.5;
  }
  
  :deep(.el-descriptions__label) {
    font-weight: 500;
    color: #606266;
  }
  
  :deep(.el-descriptions__content) {
    color: #303133;
  }
  
  :deep(.el-timeline-item__timestamp) {
    color: #909399;
    font-size: 12px;
  }
  </style>
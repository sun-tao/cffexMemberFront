<template>
    <div class="admin-application-detail">
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
                <span v-if="application.currentNode" class="current-node">
                  当前节点：{{ application.currentNode }}
                </span>
              </div>
            </div>
            <div class="status-right">
              <el-button-group>
                <el-button
                  v-if="canApprove"
                  type="success"
                  :icon="Check"
                  @click="handleApprove"
                >
                  通过
                </el-button>
                <el-button
                  v-if="canApprove"
                  type="danger"
                  :icon="Close"
                  @click="handleReject"
                >
                  拒绝
                </el-button>
                <el-button
                  v-if="canApprove"
                  type="warning"
                  :icon="Back"
                  @click="handleReturn"
                >
                  退回
                </el-button>
              </el-button-group>
              <el-button :icon="ArrowLeft" @click="$router.go(-1)">
                返回
              </el-button>
            </div>
          </div>
        </el-card>
  
        <!-- 管理员操作面板 -->
        <el-card class="admin-panel" v-if="canApprove">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              管理操作
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="admin-action">
                <h4>快速审批</h4>
                <p>根据预设规则快速处理申请</p>
                <el-button type="primary" @click="showQuickApproval = true">
                  快速审批
                </el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="admin-action">
                <h4>转交处理</h4>
                <p>将申请转交给其他审批人员</p>
                <el-button type="info" @click="showTransfer = true">
                  转交申请
                </el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="admin-action">
                <h4>申请备注</h4>
                <p>添加内部备注和标记</p>
                <el-button type="warning" @click="showNote = true">
                  添加备注
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
  
        <!-- 进度跟踪 -->
        <el-card class="progress-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              审批进度
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
              <el-button
                size="small"
                text
                type="primary"
                :icon="CopyDocument"
                @click="copyApplicationInfo"
              >
                复制信息
              </el-button>
            </div>
          </template>
  
          <div class="info-tabs">
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane label="基本信息" name="basic">
                <el-descriptions :column="2" border>
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
                    <el-tag :type="getMemberTypeColor(application.formData?.memberType)">
                      {{ getMemberTypeText(application.formData?.memberType) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="结算代理机构">
                    {{ application.formData?.clearingAgentName || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="公司地址" span="2">
                    {{ application.formData?.address || '-' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
  
              <el-tab-pane label="联系信息" name="contact">
                <el-descriptions :column="3" border>
                  <el-descriptions-item label="联系人姓名">
                    {{ application.formData?.contact?.name || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="联系电话">
                    <el-link
                      v-if="application.formData?.contact?.phone"
                      type="primary"
                      :href="`tel:${application.formData.contact.phone}`"
                    >
                      {{ application.formData.contact.phone }}
                    </el-link>
                    <span v-else>-</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="邮箱地址">
                    <el-link
                      v-if="application.formData?.contact?.email"
                      type="primary"
                      :href="`mailto:${application.formData.contact.email}`"
                    >
                      {{ application.formData.contact.email }}
                    </el-link>
                    <span v-else>-</span>
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
  
              <el-tab-pane label="公司简介" name="intro">
                <div class="company-intro">
                  <el-input
                    type="textarea"
                    :model-value="application.formData?.companyIntro || ''"
                    :rows="8"
                    readonly
                    resize="none"
                  />
                </div>
              </el-tab-pane>
  
              <el-tab-pane label="风险评估" name="risk">
                <div class="risk-assessment">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <div class="risk-item">
                        <div class="risk-label">资质完整性</div>
                        <el-progress
                          :percentage="85"
                          color="#67c23a"
                          text-inside
                          stroke-width="20"
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="risk-item">
                        <div class="risk-label">合规性检查</div>
                        <el-progress
                          :percentage="92"
                          color="#409eff"
                          text-inside
                          stroke-width="20"
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="risk-item">
                        <div class="risk-label">综合评分</div>
                        <el-progress
                          :percentage="88"
                          color="#e6a23c"
                          text-inside
                          stroke-width="20"
                        />
                      </div>
                    </el-col>
                  </el-row>
                  
                  <div class="risk-details">
                    <h4>风险提示</h4>
                    <el-alert
                      title="低风险"
                      description="该申请整体风险较低，建议正常审批流程处理。"
                      type="success"
                      :closable="false"
                      show-icon
                    />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
  
        <!-- 附件材料 -->
        <el-card class="attachments-card" v-if="attachments.length > 0">
          <template #header>
            <div class="card-header">
              <el-icon><FolderOpened /></el-icon>
              附件材料
              <el-button
                size="small"
                text
                type="primary"
                :icon="Download"
                @click="downloadAllAttachments"
              >
                批量下载
              </el-button>
            </div>
          </template>
  
          <div class="attachments-grid">
            <div
              v-for="attachment in attachments"
              :key="attachment.attachmentId"
              class="attachment-card"
            >
              <div class="attachment-info">
                <el-icon class="file-icon"><Document /></el-icon>
                <div class="file-details">
                  <div class="file-name">{{ attachment.fileName }}</div>
                  <div class="file-meta" v-if="attachment.uploadTime">
                    上传时间：{{ formatDateTime(attachment.uploadTime) }}
                  </div>
                </div>
              </div>
              <div class="attachment-actions">
                <el-button
                  type="primary"
                  size="small"
                  :icon="View"
                  @click="previewAttachment(attachment)"
                >
                  预览
                </el-button>
                <el-button
                  type="success"
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
                  <span class="operator">{{ item.operator }}</span>
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
  
      <!-- 审批对话框 -->
      <ApprovalDialog
        v-model="showApprovalDialog"
        :application="application"
        :action="currentAction"
        @confirm="handleApprovalConfirm"
      />
  
      <!-- 快速审批对话框 -->
      <QuickApprovalDialog
        v-model="showQuickApproval"
        :application="application"
        @confirm="handleQuickApproval"
      />
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
    Check,
    Close,
    Back,
    ArrowLeft,
    TrendCharts,
    Tools,
    CopyDocument,
    View
  } from '@element-plus/icons-vue'
  
  import StatusTag from '@/components/common/StatusTag.vue'
  import ProgressTracker from '@/components/member/ProgressTracker.vue'
  import ApprovalDialog from '@/components/admin/ApprovalDialog.vue'
  import QuickApprovalDialog from '@/components/admin/QuickApprovalDialog.vue'
  import { getApplicationDetailForAdmin, approveApplication, rejectApplication, returnApplication } from '@/api/admin'
  import { downloadAttachment as downloadFile } from '@/api/application'
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
  
  // 响应式数据
  const loading = ref(false)
  const application = ref(null)
  const activeTab = ref('basic')
  const showApprovalDialog = ref(false)
  const showQuickApproval = ref(false)
  const showTransfer = ref(false)
  const showNote = ref(false)
  const currentAction = ref('')
  
  // 计算属性
  const attachments = computed(() => application.value?.attachments || [])
  const approvalHistory = computed(() => application.value?.approvalHistory || [])
  
  const canApprove = computed(() => {
    return application.value?.status === APPLICATION_STATUS.PROCESSING
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
      const response = await getApplicationDetailForAdmin(applicationId)
      
      // 直接使用返回的数据，request 拦截器已经处理了 response.data
      application.value = response
      
    } catch (error) {
      console.error('获取申请详情失败:', error)
      ElMessage.error('获取申请详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 审批操作
  const handleApprove = () => {
    currentAction.value = 'approve'
    showApprovalDialog.value = true
  }
  
  const handleReject = () => {
    currentAction.value = 'reject'
    showApprovalDialog.value = true
  }
  
  const handleReturn = () => {
    currentAction.value = 'return'
    showApprovalDialog.value = true
  }
  
  // 审批确认
  const handleApprovalConfirm = async (data) => {
    try {
      const applicationId = application.value.applicationId
      
      let response
      switch (currentAction.value) {
        case 'approve':
          response = await approveApplication(applicationId, data)
          break
        case 'reject':
          response = await rejectApplication(applicationId, data)
          break
        case 'return':
          response = await returnApplication(applicationId, data)
          break
      }
  
      ElMessage.success('操作成功')
      showApprovalDialog.value = false
      
      // 刷新页面数据
      fetchApplicationDetail()
      
    } catch (error) {
      console.error('审批操作失败:', error)
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  }
  
  // 快速审批
  const handleQuickApproval = async (data) => {
    try {
      await approveApplication(application.value.applicationId, data)
      ElMessage.success('快速审批成功')
      showQuickApproval.value = false
      fetchApplicationDetail()
    } catch (error) {
      console.error('快速审批失败:', error)
      ElMessage.error('快速审批失败：' + (error.message || '未知错误'))
    }
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
  
  // 预览附件
  const previewAttachment = (attachment) => {
    ElMessage.info('预览功能开发中...')
  }
  
  // 批量下载附件
  const downloadAllAttachments = () => {
    ElMessage.info('批量下载功能开发中...')
  }
  
  // 复制申请信息
  const copyApplicationInfo = () => {
    const info = `
  申请编号: #${application.value.applicationId}
  公司名称: ${application.value.formData?.memberName || '-'}
  会员类型: ${getMemberTypeText(application.value.formData?.memberType)}
  提交时间: ${formatDateTime(application.value.submittedAt)}
  申请状态: ${application.value.status}
    `.trim()
    
    navigator.clipboard.writeText(info).then(() => {
      ElMessage.success('申请信息已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  }
  
  // 获取会员类型文本
  const getMemberTypeText = (memberType) => {
    return MEMBER_TYPE_TEXT[memberType] || memberType || '-'
  }
  
  // 获取会员类型颜色
  const getMemberTypeColor = (memberType) => {
    return memberType === 'trading' ? 'primary' : 'success'
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
  .admin-application-detail {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .loading-wrapper,
  .error-wrapper {
    padding: 40px;
  }
  
  .status-card,
  .admin-panel,
  .progress-card,
  .info-card,
  .attachments-card,
  .approval-card {
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
    flex-wrap: wrap;
  }
  
  .submit-time,
  .current-node {
    color: #909399;
    font-size: 14px;
  }
  
  .current-node {
    padding: 2px 8px;
    background-color: #f0f9ff;
    border-radius: 12px;
    color: #409eff;
  }
  
  .status-right {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .admin-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .admin-panel :deep(.el-card__header) {
    background-color: rgba(255, 255, 255, 0.1);
    border-bottom-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .admin-panel :deep(.el-card__body) {
    background-color: transparent;
  }
  
  .admin-action {
    text-align: center;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }
  
  .admin-action h4 {
    margin: 0 0 8px 0;
    color: white;
    font-size: 16px;
  }
  
  .admin-action p {
    margin: 0 0 16px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }
  
  .card-header .el-icon {
    margin-right: 8px;
    color: #409eff;
  }
  
  .info-tabs {
    margin-top: 16px;
  }
  
  .company-intro {
    margin-top: 16px;
  }
  
  .risk-assessment {
    padding: 20px 0;
  }
  
  .risk-item {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .risk-label {
    margin-bottom: 12px;
    font-weight: 500;
    color: #303133;
  }
  
  .risk-details {
    margin-top: 30px;
  }
  
  .risk-details h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
  }
  
  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .attachment-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 16px;
    background-color: #fafafa;
    transition: all 0.3s ease;
  }
  
  .attachment-card:hover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }
  
  .attachment-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .file-icon {
    font-size: 24px;
    color: #409eff;
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .file-details {
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
    word-break: break-all;
  }
  
  .file-meta {
    font-size: 12px;
    color: #909399;
  }
  
  .attachment-actions {
    display: flex;
    gap: 8px;
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
    flex-wrap: wrap;
  }
  
  .department {
    font-weight: 600;
    color: #303133;
  }
  
  .operator {
    color: #909399;
    font-size: 13px;
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
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tab-pane) {
    padding-top: 20px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .status-header {
      flex-direction: column;
      gap: 16px;
    }
    
    .status-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .status-right {
      width: 100%;
      justify-content: flex-start;
    }
    
    .attachments-grid {
      grid-template-columns: 1fr;
    }
    
    .timeline-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .admin-panel .el-row .el-col {
      margin-bottom: 16px;
    }
  }
  </style>
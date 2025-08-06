<template>
    <el-dialog
      v-model="visible"
      title="审批记录详情"
      width="600px"
      :before-close="handleClose"
    >
      <div class="history-detail" v-if="history">
        <!-- 基本信息 -->
        <el-card class="info-section">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录ID">
              {{ history.historyId }}
            </el-descriptions-item>
            <el-descriptions-item label="申请编号">
              <el-link
                type="primary"
                @click="viewApplication"
              >
                #{{ history.applicationId }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="会员名称">
              {{ history.memberName }}
            </el-descriptions-item>
            <el-descriptions-item label="审批节点">
              <el-tag type="info" size="small">
                {{ history.nodeName }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审批结果">
              <el-tag
                :type="history.result === 'APPROVE' ? 'success' : 'danger'"
                size="small"
              >
                {{ history.result === 'APPROVE' ? '通过' : '拒绝' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作人">
              {{ history.operator || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="完成时间" span="2">
              {{ formatDateTime(history.completedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
  
        <!-- 审批意见 -->
        <el-card class="comment-section">
          <template #header>
            <span>审批意见</span>
          </template>
          <div class="comment-content">
            <div v-if="history.comment" class="comment-text">
              {{ history.comment }}
            </div>
            <div v-else class="no-comment">
              <el-text type="info">未填写审批意见</el-text>
            </div>
          </div>
        </el-card>
  
        <!-- 时间信息 -->
        <el-card class="time-section">
          <template #header>
            <span>时间信息</span>
          </template>
          <el-timeline>
            <el-timeline-item
              timestamp="完成审批"
              :color="history.result === 'APPROVE' ? '#67c23a' : '#f56c6c'"
              size="large"
            >
              <div class="timeline-content">
                <p><strong>{{ formatDateTime(history.completedAt) }}</strong></p>
                <p>{{ history.operator }} {{ history.result === 'APPROVE' ? '通过' : '拒绝' }}了该申请</p>
              </div>
            </el-timeline-item>
            <el-timeline-item
              timestamp="开始处理"
              color="#409eff"
            >
              <div class="timeline-content">
                <p>{{ getStartTime() }}</p>
                <p>申请进入{{ history.nodeName }}审批环节</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
  
        <!-- 处理统计 -->
        <el-card class="stats-section">
          <template #header>
            <span>处理统计</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ getProcessingTime() }}</div>
                <div class="stat-label">处理耗时</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ history.result === 'APPROVE' ? '高效' : '谨慎' }}</div>
                <div class="stat-label">处理评价</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ getPriorityLevel() }}</div>
                <div class="stat-label">优先级</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
          <el-button
            type="primary"
            @click="viewApplication"
          >
            查看申请详情
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    history: {
      type: Object,
      default: () => ({})
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue'])
  
  const router = useRouter()
  
  // 计算属性
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  // 方法
  const handleClose = () => {
    visible.value = false
  }
  
  const viewApplication = () => {
    if (props.history?.applicationId) {
      router.push(`/admin/applications/${props.history.applicationId}`)
      handleClose()
    }
  }
  
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return dateTime
    }
  }
  
  const getStartTime = () => {
    if (!props.history?.completedAt) return '-'
    
    try {
      const completedTime = new Date(props.history.completedAt)
      const startTime = new Date(completedTime.getTime() - 2 * 60 * 60 * 1000) // 假设处理耗时2小时
      return formatDateTime(startTime)
    } catch {
      return '-'
    }
  }
  
  const getProcessingTime = () => {
    if (!props.history?.completedAt) return '-'
    
    try {
      // 模拟处理耗时计算
      const completedTime = new Date(props.history.completedAt)
      const now = new Date()
      const diffDays = Math.floor((now - completedTime) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 1) {
        return '2小时'
      } else {
        return '1天'
      }
    } catch {
      return '-'
    }
  }
  
  const getPriorityLevel = () => {
    if (!props.history?.completedAt) return '普通'
    
    try {
      const completedTime = new Date(props.history.completedAt)
      const now = new Date()
      const diffDays = Math.floor((now - completedTime) / (1000 * 60 * 60 * 24))
      
      if (diffDays > 7) {
        return '低'
      } else if (diffDays > 3) {
        return '普通'
      } else {
        return '高'
      }
    } catch {
      return '普通'
    }
  }
  </script>
  
  <style scoped>
  .history-detail {
    padding: 8px 0;
  }
  
  .info-section,
  .comment-section,
  .time-section,
  .stats-section {
    margin-bottom: 20px;
  }
  
  .info-section:last-child,
  .comment-section:last-child,
  .time-section:last-child,
  .stats-section:last-child {
    margin-bottom: 0;
  }
  
  .comment-content {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #409eff;
  }
  
  .comment-text {
    color: #303133;
    line-height: 1.6;
    font-size: 14px;
  }
  
  .no-comment {
    text-align: center;
    padding: 20px;
  }
  
  .timeline-content p {
    margin: 4px 0;
  }
  
  .timeline-content p:first-child {
    font-weight: 600;
    color: #303133;
  }
  
  .timeline-content p:last-child {
    color: #909399;
    font-size: 14px;
  }
  
  .stat-item {
    text-align: center;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }
  
  .stat-label {
    color: #909399;
    font-size: 13px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  :deep(.el-card__header) {
    padding: 12px 20px;
    font-weight: 600;
    color: #303133;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-descriptions__label) {
    font-weight: 500;
  }
  
  :deep(.el-timeline-item__timestamp) {
    color: #909399;
    font-size: 13px;
    font-weight: 500;
  }
  </style>
<template>
    <el-dialog
      v-model="visible"
      title="快速审批"
      width="600px"
      :before-close="handleClose"
    >
      <div class="quick-approval-dialog">
        <!-- 申请摘要 -->
        <div class="application-summary">
          <h4>申请摘要</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="summary-item">
                <label>申请编号：</label>
                <span>#{{ application?.applicationId }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="summary-item">
                <label>申请人：</label>
                <span>{{ application?.formData?.memberName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="summary-item">
                <label>会员类型：</label>
                <span>{{ getMemberTypeText(application?.formData?.memberType) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="summary-item">
                <label>提交时间：</label>
                <span>{{ formatDateTime(application?.submittedAt) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
  
        <!-- 自动检查结果 -->
        <div class="auto-check-results">
          <h4>自动检查结果</h4>
          <div class="check-list">
            <div class="check-item" v-for="check in autoChecks" :key="check.name">
              <div class="check-content">
                <el-icon
                  :class="['check-icon', check.status === 'pass' ? 'pass' : 'warning']"
                >
                  <CircleCheck v-if="check.status === 'pass'" />
                  <Warning v-else />
                </el-icon>
                <div class="check-info">
                  <div class="check-name">{{ check.name }}</div>
                  <div class="check-desc">{{ check.description }}</div>
                </div>
              </div>
              <div class="check-result">
                <el-tag
                  :type="check.status === 'pass' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ check.status === 'pass' ? '通过' : '需关注' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 风险评估 -->
        <div class="risk-assessment">
          <h4>风险评估</h4>
          <div class="risk-score">
            <el-progress
              :percentage="riskScore"
              :color="getRiskColor(riskScore)"
              :stroke-width="20"
              text-inside
            >
              <template #default="{ percentage }">
                <span class="risk-text">{{ getRiskLevel(percentage) }}</span>
              </template>
            </el-progress>
            <div class="risk-description">
              {{ getRiskDescription(riskScore) }}
            </div>
          </div>
        </div>
  
        <!-- 推荐操作 -->
        <div class="recommendation">
          <h4>推荐操作</h4>
          <el-alert
            :title="recommendation.title"
            :description="recommendation.description"
            :type="recommendation.type"
            :closable="false"
            show-icon
          />
        </div>
  
        <!-- 快速审批选项 -->
        <div class="quick-options">
          <el-form :model="form" label-width="100px">
            <el-form-item label="审批结果">
              <el-radio-group v-model="form.action">
                <el-radio label="approve">
                  <el-icon><CircleCheck /></el-icon>
                  通过申请
                </el-radio>
                <el-radio label="conditional">
                  <el-icon><Warning /></el-icon>
                  条件通过
                </el-radio>
                <el-radio label="defer">
                  <el-icon><Clock /></el-icon>
                  延后处理
                </el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item 
              label="审批意见" 
              v-if="form.action !== 'approve'"
            >
              <el-input
                v-model="form.comment"
                type="textarea"
                :rows="3"
                placeholder="请输入详细的审批意见..."
                show-word-limit
                maxlength="300"
              />
            </el-form-item>
  
            <el-form-item 
              label="标准意见"
              v-if="form.action !== 'approve'"
            >
              <div class="standard-comments">
                <el-tag
                  v-for="comment in getStandardComments(form.action)"
                  :key="comment"
                  class="comment-tag"
                  @click="form.comment = comment"
                  :type="form.comment === comment ? 'primary' : 'info'"
                >
                  {{ comment }}
                </el-tag>
              </div>
            </el-form-item>
  
            <el-form-item 
              label="处理优先级"
              v-if="form.action === 'defer'"
            >
              <el-select v-model="form.priority" placeholder="选择优先级">
                <el-option label="高优先级" value="high" />
                <el-option label="普通优先级" value="normal" />
                <el-option label="低优先级" value="low" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleConfirm"
          >
            {{ getConfirmText() }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch, reactive } from 'vue'
  import {
    CircleCheck,
    Warning,
    Clock
  } from '@element-plus/icons-vue'
  import { MEMBER_TYPE_TEXT } from '@/utils/constants'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    application: {
      type: Object,
      default: () => ({})
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'confirm'])
  
  // 响应式数据
  const submitting = ref(false)
  const form = reactive({
    action: 'approve',
    comment: '',
    priority: 'normal'
  })
  
  // 计算属性
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  // 模拟自动检查数据
  const autoChecks = ref([
    {
      name: '资质完整性检查',
      description: '营业执照、经营许可证等必要文件已上传',
      status: 'pass'
    },
    {
      name: '信息一致性检查',
      description: '申请信息与上传文件内容一致',
      status: 'pass'
    },
    {
      name: '黑名单检查',
      description: '申请人不在监管黑名单中',
      status: 'pass'
    },
    {
      name: '重复申请检查',
      description: '检测到类似的历史申请记录',
      status: 'warning'
    }
  ])
  
  // 风险评分（模拟数据）
  const riskScore = ref(88)
  
  // 推荐操作
  const recommendation = computed(() => {
    if (riskScore.value >= 85) {
      return {
        title: '推荐通过',
        description: '该申请各项指标良好，建议直接通过审批。',
        type: 'success'
      }
    } else if (riskScore.value >= 70) {
      return {
        title: '建议条件通过',
        description: '申请基本符合要求，但存在一些需要关注的问题，建议条件通过。',
        type: 'warning'
      }
    } else {
      return {
        title: '建议延后处理',
        description: '申请存在较多问题，建议延后处理或要求补充材料。',
        type: 'error'
      }
    }
  })
  
  // 监听弹窗显示状态
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      // 重置表单
      form.action = 'approve'
      form.comment = ''
      form.priority = 'normal'
    }
  })
  
  // 方法
  const handleClose = () => {
    visible.value = false
  }
  
  const handleConfirm = async () => {
    try {
      submitting.value = true
      
      const data = {
        comment: form.comment || getDefaultComment(),
        action: form.action,
        priority: form.priority
      }
      
      emit('confirm', data)
      
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
  
  const getConfirmText = () => {
    const textMap = {
      approve: '确认通过',
      conditional: '条件通过',
      defer: '延后处理'
    }
    return textMap[form.action] || '确认'
  }
  
  const getDefaultComment = () => {
    const commentMap = {
      approve: '经快速审批系统检查，该申请符合入会条件，建议通过。',
      conditional: '申请基本符合要求，条件通过。',
      defer: '申请需要进一步审查，延后处理。'
    }
    return commentMap[form.action] || ''
  }
  
  const getStandardComments = (action) => {
    const commentsMap = {
      conditional: [
        '请在30日内补充完善相关资质证明。',
        '条件通过，需定期报告业务开展情况。',
        '暂时通过，后续需接受合规检查。'
      ],
      defer: [
        '需要进一步核实申请人资质情况。',
        '等待监管部门相关政策明确后处理。',
        '申请材料需要补充完善。'
      ]
    }
    return commentsMap[action] || []
  }
  
  const getRiskColor = (score) => {
    if (score >= 85) return '#67c23a'
    if (score >= 70) return '#e6a23c'
    return '#f56c6c'
  }
  
  const getRiskLevel = (score) => {
    if (score >= 85) return '低风险'
    if (score >= 70) return '中风险'
    return '高风险'
  }
  
  const getRiskDescription = (score) => {
    if (score >= 85) return '申请整体风险较低，各项指标良好'
    if (score >= 70) return '申请存在一定风险，需要关注部分指标'
    return '申请风险较高，建议谨慎处理'
  }
  
  const getMemberTypeText = (memberType) => {
    return MEMBER_TYPE_TEXT[memberType] || memberType || '-'
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
        minute: '2-digit'
      })
    } catch {
      return dateTime
    }
  }
  </script>
  
  <style scoped>
  .quick-approval-dialog {
    padding: 8px 0;
  }
  
  .application-summary,
  .auto-check-results,
  .risk-assessment,
  .recommendation,
  .quick-options {
    margin-bottom: 24px;
  }
  
  .application-summary h4,
  .auto-check-results h4,
  .risk-assessment h4,
  .recommendation h4,
  .quick-options h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 8px;
  }
  
  .summary-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .summary-item label {
    color: #606266;
    font-weight: 500;
    margin-right: 8px;
    min-width: 80px;
  }
  
  .summary-item span {
    color: #303133;
  }
  
  .check-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .check-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid transparent;
  }
  
  .check-item:has(.check-icon.pass) {
    border-left-color: #67c23a;
  }
  
  .check-item:has(.check-icon.warning) {
    border-left-color: #e6a23c;
  }
  
  .check-content {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .check-icon {
    font-size: 20px;
    margin-right: 12px;
  }
  
  .check-icon.pass {
    color: #67c23a;
  }
  
  .check-icon.warning {
    color: #e6a23c;
  }
  
  .check-info {
    flex: 1;
  }
  
  .check-name {
    color: #303133;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .check-desc {
    color: #909399;
    font-size: 13px;
  }
  
  .risk-score {
    text-align: center;
  }
  
  .risk-text {
    font-weight: 600;
    font-size: 14px;
  }
  
  .risk-description {
    margin-top: 12px;
    color: #606266;
    font-size: 14px;
  }
  
  .standard-comments {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  
  .comment-tag {
    cursor: pointer;
    transition: all 0.3s;
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .comment-tag:hover {
    transform: translateY(-1px);
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  :deep(.el-radio) {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    height: auto;
    line-height: 1.5;
  }
  
  :deep(.el-radio__label) {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  :deep(.el-progress-bar__outer) {
    border-radius: 10px;
  }
  
  :deep(.el-progress-bar__inner) {
    border-radius: 10px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .check-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .check-result {
      align-self: flex-end;
    }
  }
  </style>
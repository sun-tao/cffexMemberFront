<template>
    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleClose"
    >
      <div class="batch-approval-dialog">
        <!-- 申请列表 -->
        <div class="applications-list">
          <h4>待处理申请 ({{ applications.length }}个)</h4>
          <div class="list-content">
            <div
              v-for="app in applications"
              :key="app.applicationId"
              class="application-item"
            >
              <div class="app-info">
                <span class="app-id">#{{ app.applicationId }}</span>
                <span class="app-name">{{ app.applicantUserName }}</span>
              </div>
              <el-tag type="warning" size="small">
                {{ app.currentNode }}
              </el-tag>
            </div>
          </div>
        </div>
  
        <!-- 批量操作表单 -->
        <div class="batch-form">
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="100px"
            label-position="top"
          >
            <el-form-item 
              :label="commentLabel" 
              prop="comment"
              :required="action === 'reject'"
            >
              <el-input
                v-model="form.comment"
                type="textarea"
                :rows="4"
                :placeholder="commentPlaceholder"
                show-word-limit
                maxlength="500"
              />
            </el-form-item>
            
            <!-- 预定义意见 -->
            <el-form-item label="常用意见" v-if="quickComments.length > 0">
              <div class="quick-comments">
                <el-tag
                  v-for="comment in quickComments"
                  :key="comment"
                  class="comment-tag"
                  @click="selectComment(comment)"
                  :type="form.comment === comment ? 'primary' : 'info'"
                >
                  {{ comment }}
                </el-tag>
              </div>
            </el-form-item>
          </el-form>
        </div>
  
        <!-- 操作提醒 -->
        <el-alert
          :title="alertTitle"
          :description="alertDescription"
          :type="alertType"
          :closable="false"
          show-icon
        />
      </div>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            :type="action === 'approve' ? 'success' : 'danger'"
            :loading="submitting"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch, reactive } from 'vue'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    applications: {
      type: Array,
      default: () => []
    },
    action: {
      type: String,
      default: 'approve',
      validator: (value) => ['approve', 'reject'].includes(value)
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'confirm'])
  
  // 响应式数据
  const formRef = ref()
  const submitting = ref(false)
  const form = reactive({
    comment: ''
  })
  
  // 计算属性
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const dialogTitle = computed(() => {
    const actionText = props.action === 'approve' ? '批量通过' : '批量拒绝'
    return `${actionText} (${props.applications.length}个申请)`
  })
  
  const commentLabel = computed(() => {
    return props.action === 'approve' ? '批量审批意见' : '批量拒绝原因'
  })
  
  const commentPlaceholder = computed(() => {
    return props.action === 'approve' 
      ? '请输入统一的审批意见（可选）...' 
      : '请输入统一的拒绝原因...'
  })
  
  const confirmButtonText = computed(() => {
    const actionText = props.action === 'approve' ? '确认批量通过' : '确认批量拒绝'
    return `${actionText} (${props.applications.length}个)`
  })
  
  const alertTitle = computed(() => {
    return props.action === 'approve' ? '批量通过确认' : '批量拒绝确认'
  })
  
  const alertDescription = computed(() => {
    const actionText = props.action === 'approve' ? '通过' : '拒绝'
    return `您即将${actionText} ${props.applications.length} 个申请，此操作不可撤销，请确认无误后提交。`
  })
  
  const alertType = computed(() => {
    return props.action === 'approve' ? 'success' : 'warning'
  })
  
  const quickComments = computed(() => {
    const comments = {
      approve: [
        '经审核，以上申请均符合入会条件，批准通过。',
        '材料齐全，资质合格，统一批准入会。',
        '审核无误，同意批量通过。'
      ],
      reject: [
        '申请材料均不符合要求，统一拒绝。',
        '资质条件不达标，需重新申请。',
        '业务范围与会员类型不匹配，拒绝申请。'
      ]
    }
    return comments[props.action] || []
  })
  
  const formRules = computed(() => {
    if (props.action === 'approve') {
      return {} // 批量通过时意见可选
    }
    
    return {
      comment: [
        { required: true, message: '请输入拒绝原因', trigger: 'blur' },
        { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' }
      ]
    }
  })
  
  // 监听弹窗显示状态
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      // 重置表单
      form.comment = ''
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    }
  })
  
  // 方法
  const handleClose = () => {
    visible.value = false
  }
  
  const selectComment = (comment) => {
    form.comment = comment
  }
  
  const handleConfirm = async () => {
    try {
      // 表单验证
      if (formRef.value && props.action === 'reject') {
        const isValid = await formRef.value.validate().catch(() => false)
        if (!isValid) return
      }
  
      submitting.value = true
      
      // 触发确认事件
      emit('confirm', {
        comment: form.comment.trim(),
        action: props.action,
        applicationIds: props.applications.map(app => app.applicationId)
      })
      
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .batch-approval-dialog {
    padding: 8px 0;
  }
  
  .applications-list {
    margin-bottom: 24px;
  }
  
  .applications-list h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
  
  .list-content {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 8px;
  }
  
  .application-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 4px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .application-item:last-child {
    margin-bottom: 0;
  }
  
  .app-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .app-id {
    font-weight: 600;
    color: #409eff;
    font-size: 13px;
  }
  
  .app-name {
    color: #303133;
    font-size: 14px;
  }
  
  .batch-form {
    margin-bottom: 20px;
  }
  
  .quick-comments {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
  
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
  
  :deep(.el-textarea__inner) {
    resize: none;
  }
  
  :deep(.el-alert) {
    margin-top: 16px;
  }
  
  /* 滚动条样式 */
  .list-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .list-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .list-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .list-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  </style>
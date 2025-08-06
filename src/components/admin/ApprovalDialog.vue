<template>
    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="500px"
      :before-close="handleClose"
    >
      <div class="approval-dialog">
        <!-- 申请信息 -->
        <div class="application-info">
          <h4>申请信息</h4>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="申请编号">
              #{{ application?.applicationId }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">
              {{ application?.applicantUserName }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ formatDateTime(application?.submittedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
  
        <!-- 审批表单 -->
        <div class="approval-form">
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="80px"
            label-position="top"
          >
            <el-form-item 
              :label="commentLabel" 
              prop="comment"
              :required="action !== 'approve'"
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
            
            <!-- 预定义意见快捷选择 -->
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
      </div>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
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
    application: {
      type: Object,
      default: () => ({})
    },
    action: {
      type: String,
      default: 'approve',
      validator: (value) => ['approve', 'reject', 'return'].includes(value)
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
    const titles = {
      approve: '审批通过',
      reject: '审批拒绝',
      return: '退回修改'
    }
    return titles[props.action] || '审批操作'
  })
  
  const commentLabel = computed(() => {
    const labels = {
      approve: '审批意见',
      reject: '拒绝原因',
      return: '退回原因'
    }
    return labels[props.action] || '意见'
  })
  
  const commentPlaceholder = computed(() => {
    const placeholders = {
      approve: '请输入审批意见（可选）...',
      reject: '请详细说明拒绝原因...',
      return: '请说明需要修改的内容...'
    }
    return placeholders[props.action] || '请输入意见...'
  })
  
  const confirmButtonText = computed(() => {
    const texts = {
      approve: '确认通过',
      reject: '确认拒绝',
      return: '确认退回'
    }
    return texts[props.action] || '确认'
  })
  
  const quickComments = computed(() => {
    const comments = {
      approve: [
        '符合入会条件，审批通过。',
        '材料齐全，资质合格，同意入会。',
        '经审核，该申请符合要求。'
      ],
      reject: [
        '申请材料不完整，请补充相关证明文件。',
        '资质条件不符合入会要求。',
        '业务范围与会员类型不匹配。',
        '公司地址信息需要进一步核实。'
      ],
      return: [
        '请补充营业执照副本。',
        '联系人信息需要更新。',
        '公司简介需要更详细说明。',
        '请提供最新的财务报告。'
      ]
    }
    return comments[props.action] || []
  })
  
  // 表单验证规则
  const formRules = computed(() => {
    if (props.action === 'approve') {
      return {} // 通过时意见可选
    }
    
    return {
      comment: [
        { required: true, message: '请输入' + commentLabel.value, trigger: 'blur' },
        { min: 5, message: commentLabel.value + '至少5个字符', trigger: 'blur' }
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
      if (formRef.value && props.action !== 'approve') {
        const isValid = await formRef.value.validate().catch(() => false)
        if (!isValid) return
      }
  
      submitting.value = true
      
      // 触发确认事件
      emit('confirm', {
        comment: form.comment.trim(),
        action: props.action,
        applicationId: props.application?.applicationId
      })
      
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
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
  .approval-dialog {
    padding: 8px 0;
  }
  
  .application-info {
    margin-bottom: 24px;
  }
  
  .application-info h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
  
  .approval-form {
    margin-bottom: 16px;
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
  </style>
<template>
    <div class="application-submit">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>会员入会申请</h3>
            <p class="header-desc">请填写完整的申请信息并上传相关证明材料</p>
          </div>
        </template>
  
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="140px"
          label-position="right"
          size="default"
        >
          <!-- 基本信息 -->
          <el-divider content-position="left">
            <el-icon><OfficeBuilding /></el-icon>
            基本信息
          </el-divider>
  
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公司名称" prop="memberName">
                <el-input
                  v-model="formData.memberName"
                  placeholder="请输入公司全称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公司简称" prop="shortName">
                <el-input
                  v-model="formData.shortName"
                  placeholder="请输入公司简称"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="英文名称" prop="englishName">
                <el-input
                  v-model="formData.englishName"
                  placeholder="请输入英文全称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="英文简称" prop="englishShortName">
                <el-input
                  v-model="formData.englishShortName"
                  placeholder="请输入英文简称"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会员类型" prop="memberType">
                <el-select
                  v-model="formData.memberType"
                  placeholder="请选择会员类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(text, value) in MEMBER_TYPE_TEXT"
                    :key="value"
                    :label="text"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结算代理机构" prop="clearingAgentName">
                <el-input
                  v-model="formData.clearingAgentName"
                  placeholder="请输入结算代理机构名称"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="公司地址" prop="address">
            <el-input
              v-model="formData.address"
              placeholder="请输入详细的公司地址"
              clearable
            />
          </el-form-item>
  
          <!-- 联系信息 -->
          <el-divider content-position="left">
            <el-icon><User /></el-icon>
            联系信息
          </el-divider>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="联系人姓名" prop="contact.name">
                <el-input
                  v-model="formData.contact.name"
                  placeholder="请输入联系人姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="contact.phone">
                <el-input
                  v-model="formData.contact.phone"
                  placeholder="请输入手机号码"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="邮箱地址" prop="contact.email">
                <el-input
                  v-model="formData.contact.email"
                  placeholder="请输入邮箱地址"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <!-- 公司简介 -->
          <el-divider content-position="left">
            <el-icon><Document /></el-icon>
            公司简介
          </el-divider>
  
          <el-form-item label="公司简介" prop="companyIntro">
            <el-input
              v-model="formData.companyIntro"
              type="textarea"
              :rows="4"
              placeholder="请简要介绍公司的业务范围、发展历程、核心优势等（10-1000字）"
              show-word-limit
              maxlength="1000"
            />
          </el-form-item>
  
          <!-- 证明材料 -->
          <el-divider content-position="left">
            <el-icon><FolderOpened /></el-icon>
            证明材料
          </el-divider>
  
          <el-form-item label="资质证明文件" required>
            <FileUpload
              ref="fileUploadRef"
              v-model="uploadedFiles"
              @upload-success="handleUploadSuccess"
              @upload-error="handleUploadError"
            />
          </el-form-item>
  
          <!-- 提交按钮 -->
          <el-form-item>
            <div class="submit-buttons">
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                @click="handleSubmit"
              >
                <el-icon><Check /></el-icon>
                提交申请
              </el-button>
              <el-button
                size="large"
                @click="handleReset"
              >
                <el-icon><RefreshLeft /></el-icon>
                重置表单
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    OfficeBuilding,
    User,
    Document,
    FolderOpened,
    Check,
    RefreshLeft
  } from '@element-plus/icons-vue'
  
  import FileUpload from '@/components/common/FileUpload.vue'
  import { submitApplication } from '@/api/application'
  import { useApplicationStore } from '@/stores/application'
  import { formRules } from '@/utils/validate'
  import { MEMBER_TYPE_TEXT } from '@/utils/constants'
  
  const router = useRouter()
  const applicationStore = useApplicationStore()
  
  // 响应式数据
  const formRef = ref()
  const fileUploadRef = ref()
  const submitting = ref(false)
  const uploadedFiles = ref([])
  
  // 表单数据
  const formData = reactive({
    memberName: '',
    shortName: '',
    englishName: '',
    englishShortName: '',
    memberType: '',
    clearingAgentName: '',
    address: '',
    contact: {
      name: '',
      phone: '',
      email: ''
    },
    companyIntro: ''
  })
  
  // 页面加载时的初始化
  onMounted(() => {
    // 清空之前的提交状态
    applicationStore.submitLoading = false
  })
  
  // 文件上传成功处理
  const handleUploadSuccess = (file) => {
    console.log('文件上传成功:', file)
  }
  
  // 文件上传错误处理
  const handleUploadError = (error) => {
    console.error('文件上传失败:', error)
  }
  
  // 提交申请
  const handleSubmit = async () => {
    try {
      // 表单验证
      if (!formRef.value) return
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid) return
  
      // 检查是否上传了文件
      if (uploadedFiles.value.length === 0) {
        ElMessage.warning('请至少上传一个资质证明文件')
        return
      }
  
      // 确认提交
      await ElMessageBox.confirm(
        '确定要提交申请吗？提交后将无法修改。',
        '确认提交',
        {
          confirmButtonText: '确定提交',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
  
      submitting.value = true
  
      // 准备提交数据
      const submitData = {
        formData: { ...formData },
        attachments: {
          qualificationCertificate: fileUploadRef.value?.getUploadedFileIds() || []
        }
      }
  
      // 调用API提交申请
      await submitApplication(submitData)
  
      ElMessage.success('申请提交成功！')
      
      // 跳转到申请列表页面
      router.push('/member/applications')
  
    } catch (error) {
      if (error !== 'cancel') {
        console.error('提交申请失败:', error)
        ElMessage.error('提交申请失败：' + (error.message || '未知错误'))
      }
    } finally {
      submitting.value = false
    }
  }
  
  // 重置表单
  const handleReset = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要重置表单吗？所有已填写的内容和上传的文件都将清空。',
        '确认重置',
        {
          confirmButtonText: '确定重置',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
  
      // 重置表单
      if (formRef.value) {
        formRef.value.resetFields()
      }
  
      // 清空上传的文件
      if (fileUploadRef.value) {
        fileUploadRef.value.clearAll()
      }
  
      ElMessage.success('表单已重置')
    } catch {
      // 用户取消操作
    }
  }
  </script>
  
  <style scoped>
  .application-submit {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .card-header {
    text-align: center;
  }
  
  .card-header h3 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }
  
  .header-desc {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
  
  .el-divider {
    margin: 30px 0 20px 0;
  }
  
  .el-divider .el-icon {
    margin-right: 8px;
    color: #409eff;
  }
  
  .submit-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
  }
  
  .submit-buttons .el-button {
    min-width: 120px;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
  }
  
  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  }
  
  :deep(.el-textarea__inner:hover) {
    box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
  }
  </style>
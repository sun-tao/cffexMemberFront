<template>
    <div class="file-upload">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="fileList"
        :accept="acceptTypes"
        multiple
      >
        <template #trigger>
          <el-button type="primary" :icon="Upload">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            支持上传 PDF, Word, Excel, 图片等格式文件，单个文件不超过 10MB
          </div>
        </template>
      </el-upload>
      
      <!-- 上传进度 -->
      <div v-if="uploading" class="upload-progress">
        <el-progress :percentage="uploadProgress" :status="progressStatus"></el-progress>
        <p class="progress-text">{{ progressText }}</p>
      </div>
      
      <!-- 已上传文件列表 -->
      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <h4>已上传文件：</h4>
        <div class="file-item" v-for="file in uploadedFiles" :key="file.id">
          <el-icon class="file-icon"><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <el-button 
            type="danger" 
            size="small" 
            :icon="Delete"
            @click="removeUploadedFile(file)"
            circle
          ></el-button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Upload, Document, Delete } from '@element-plus/icons-vue'
  import { uploadFile, deleteUploadedFile } from '@/api/application'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    acceptTypes: {
      type: String,
      default: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif'
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])
  
  // 响应式数据
  const uploadRef = ref()
  const fileList = ref([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const progressStatus = ref('')
  const progressText = ref('')
  const uploadedFiles = ref([...props.modelValue])
  
  // 计算属性
  const acceptTypes = computed(() => props.acceptTypes)
  
  // 监听外部传入的文件列表变化
  watch(() => props.modelValue, (newValue) => {
    uploadedFiles.value = [...newValue]
  }, { deep: true })
  
  // 文件选择处理
  const handleFileChange = async (file, fileListParam) => {
    // 验证文件大小
    if (file.raw.size > props.maxSize) {
      ElMessage.error(`文件大小不能超过 ${Math.floor(props.maxSize / 1024 / 1024)}MB`)
      fileList.value = fileListParam.filter(f => f.uid !== file.uid)
      return
    }
    
    // 开始上传
    await uploadSingleFile(file)
  }
  
  // 上传单个文件
  const uploadSingleFile = async (file) => {
    try {
      uploading.value = true
      uploadProgress.value = 0
      progressStatus.value = 'active'
      progressText.value = `正在上传 ${file.name}...`
      
      const response = await uploadFile(file.raw, (progress) => {
        uploadProgress.value = progress
      })
      
      // 上传成功
      progressStatus.value = 'success'
      progressText.value = `${file.name} 上传成功`
      
      // 添加到已上传文件列表
      const uploadedFile = {
        id: response.fileId,
        name: file.name,
        url: response.url
      }
      
      uploadedFiles.value.push(uploadedFile)
      emit('update:modelValue', uploadedFiles.value)
      emit('upload-success', uploadedFile)
      
      ElMessage.success('文件上传成功')
      
      // 清除上传组件中的文件
      setTimeout(() => {
        fileList.value = []
        uploadRef.value?.clearFiles()
      }, 1000)
      
    } catch (error) {
      progressStatus.value = 'exception'
      progressText.value = `${file.name} 上传失败`
      emit('upload-error', error)
      ElMessage.error('文件上传失败：' + (error.message || '未知错误'))
    } finally {
      setTimeout(() => {
        uploading.value = false
        uploadProgress.value = 0
        progressText.value = ''
      }, 2000)
    }
  }
  
  // 移除待上传文件
  const handleFileRemove = (file, fileListParam) => {
    fileList.value = fileListParam
  }
  
  // 移除已上传文件
  const removeUploadedFile = async (file) => {
    try {
      await deleteUploadedFile(file.id)
      
      uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== file.id)
      emit('update:modelValue', uploadedFiles.value)
      
      ElMessage.success('文件删除成功')
    } catch (error) {
      ElMessage.error('文件删除失败：' + (error.message || '未知错误'))
    }
  }
  
  // 清空所有文件
  const clearAll = () => {
    fileList.value = []
    uploadedFiles.value = []
    uploadRef.value?.clearFiles()
    emit('update:modelValue', [])
  }
  
  // 获取已上传文件的ID列表
  const getUploadedFileIds = () => {
    return uploadedFiles.value.map(file => file.id)
  }
  
  // 暴露方法
  defineExpose({
    clearAll,
    getUploadedFileIds
  })
  </script>
  
  <style scoped>
  .file-upload {
    width: 100%;
  }
  
  .upload-progress {
    margin-top: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }
  
  .progress-text {
    margin: 10px 0 0 0;
    font-size: 14px;
    color: #606266;
  }
  
  .uploaded-files {
    margin-top: 20px;
    padding: 15px;
    background-color: #f0f9ff;
    border-radius: 4px;
    border: 1px solid #b3d8ff;
  }
  
  .uploaded-files h4 {
    margin: 0 0 15px 0;
    color: #409eff;
    font-size: 14px;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .file-item:last-child {
    border-bottom: none;
  }
  
  .file-icon {
    color: #409eff;
    margin-right: 8px;
    font-size: 16px;
  }
  
  .file-name {
    flex: 1;
    color: #303133;
    font-size: 14px;
  }
  
  .el-upload__tip {
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 5px;
  }
  </style>
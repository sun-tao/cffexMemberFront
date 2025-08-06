<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="@/assets/logo.png" alt="中金所Logo" class="login-logo">
          <h2>中金所会员申请与审批系统</h2>
          <p>请登录您的账户</p>
        </div>
        
        <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="userType">
          <el-select
            v-model="loginForm.userType"
            placeholder="请选择用户类型"
            style="width: 100%"
          >
            <el-option label="会员用户" value="member" />
            <el-option label="交易部员工" value="trading" />
            <el-option label="结算部员工" value="clearing" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 测试账号提示 -->
      <div class="test-accounts">
        <el-alert
          title="测试账号"
          type="info"
          :closable="false"
          show-icon
        >
          <p><strong>会员用户：</strong>用户名: member / 密码: 123456</p>
          <p><strong>交易部员工：</strong>用户名: trading / 密码: 123456</p>
          <p><strong>结算部员工：</strong>用户名: clearing / 密码: 123456</p>
        </el-alert>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loginFormRef = ref()
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  userType: 'member'
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    if (!loginFormRef.value) return
    const isValid = await loginFormRef.value.validate().catch(() => false)
    if (!isValid) return

    loading.value = true

    // 调用store中的登录方法（已对接后端）
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      userType: loginForm.userType
    })

    ElMessage.success('登录成功')

    // 根据用户类型跳转到不同页面
    if (loginForm.userType === 'member') {
      router.push('/member')
    } else {
      router.push('/admin') // 管理员页面后续添加
    }

  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

  
  <style scoped>
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #2980b9 0%, #FFFFFF 100%);
    padding: 20px;
  }

  .login-logo {
    width: 186px;
    height: 120px;
    margin: 0 auto 16px;
    display: block;
    object-fit: contain;
}
  
  .login-card {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 40px 32px;
    backdrop-filter: blur(10px);
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .login-header h2 {
    color: #303133;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .login-header p {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
  
  .login-form {
    margin-bottom: 24px;
  }
  
  .login-form .el-form-item {
    margin-bottom: 24px;
  }
  
  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  .login-footer {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
  
  .login-footer p {
    color: #c0c4cc;
    font-size: 12px;
    margin: 0;
  }
  
  /* 响应式设计 */
  @media (max-width: 480px) {
    .login-card {
      padding: 24px 20px;
    }
    
    .login-header h2 {
      font-size: 20px;
    }
  }
  </style>
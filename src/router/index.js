import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/member',
    component: () => import('@/layouts/MemberLayout.vue'),
    meta: { requiresAuth: true, userType: 'member' },
    children: [
      {
        path: '',
        name: 'MemberDashboard',
        component: () => import('@/views/member/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'apply',
        name: 'MemberApply',
        component: () => import('@/views/member/ApplicationSubmit.vue'),
        meta: { title: '提交申请' }
      },
      {
        path: 'applications',
        name: 'MemberApplications',
        component: () => import('@/views/member/ApplicationList.vue'),
        meta: { title: '查看申请' }
      },
      {
        path: 'applications/:id',
        name: 'MemberApplicationDetail',
        component: () => import('@/views/member/ApplicationDetail.vue'),
        meta: { title: '申请详情' },
        props: true
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, userType: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'pending',
        name: 'AdminPending',
        component: () => import('@/views/admin/PendingApplications.vue'),
        meta: { title: '待审批任务' }
      },
      {
        path: 'applications',
        name: 'AdminApplications',
        component: () => import('@/views/admin/ApplicationManagement.vue'),
        meta: { title: '申请管理' }
      },
      {
        path: 'applications/:id',
        name: 'AdminApplicationDetail',
        component: () => import('@/views/admin/ApplicationDetail.vue'),
        meta: { title: '申请详情' },
        props: true
      },
      {
        path: 'history',
        name: 'AdminHistory',
        component: () => import('@/views/admin/ApprovalHistory.vue'),
        meta: { title: '审批历史' }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/Statistics.vue'),
        meta: { title: '统计报告' }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查用户类型权限
  if (to.meta.userType) {
    const userType = to.meta.userType
    
    if (userType === 'member' && !authStore.isMember) {
      next('/login')
      return
    }
    
    if (userType === 'admin' && !authStore.isAdmin) {
      next('/login')
      return
    }
  }
  
  // 如果已登录且访问登录页，重定向到对应的首页
  if (to.path === '/login' && authStore.isLoggedIn) {
    if (authStore.isMember) {
      next('/member')
    } else if (authStore.isAdmin) {
      next('/admin')
    }
    return
  }
  
  next()
})

export default router
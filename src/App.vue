<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 可以在这里添加全局的初始化逻辑
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 样式覆盖 */
.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.el-table {
  font-size: 14px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 响应式辅助类 */
@media (max-width: 768px) {
  .hidden-xs-only {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .hidden-sm-and-up {
    display: none !important;
  }
}

/* 工具类 */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
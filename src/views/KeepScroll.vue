<template>
    <div>
      <h1>keep-alive 记录滚动位置</h1>
      <p v-for="i in 100" :key="i">{{i}}我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容</p>
    </div>
  </template>
  
  <script lang="ts">
  import useKeepScroll from '@/hooks/useKeepScroll'
  
  export default {
    name: 'KeepScroll',
    setup() {
      // 在setup函数中使用useKeepScroll
      useKeepScroll()
  
      // 返回你的组件需要的任何数据或方法
      return {
        // 返回的数据和方法
      }
    }
  }
  </script>
  
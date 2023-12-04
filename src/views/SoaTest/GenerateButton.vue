<template>
    <div class="form-group row" style="margin-top: 30px">
      <div class="form-group row">
        <div class="centered-buttons">
          <button
            id="ClearSession"
            class="btn btn-info mx-2"
            @click="clearSession"
          >
            Clear Session
          </button>
          <button id="Generate" class="btn btn-success mx-2" @click="generate">
            Generate
          </button>
          <button @click="navigateToYamlRoute" class="btn btn-primary mx-2">To YAML</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";

  export default {
    setup(props, { attrs, emit }) {
        const router = useRouter();
      const clearSession = async () => {
        // 在这里处理 Clear Session 按钮的点击事件
        console.log("Clear Session 按钮被点击 " + now_ip);
        let now_ip = window.bench_now_ip;
        try {
          const response = await axios.get(`http://${now_ip}:16000/api/clear`); // 替换为您的 API 地址
          console.log("Response:", response.data);
          // 在这里处理响应数据，可以将数据存储到响应式变量中，以便在模板中使用
        } catch (error) {
          console.error("Error:", error);
          // 在这里处理错误
        }
        // 进行相关操作
      };
  
      const generate = async () => {
        // 在这里处理 Generate 按钮的点击事件
        let now_ip = window.bench_now_ip;
        console.log("Generate 按钮被点击 " + now_ip);
        try {
          const response = await axios.get(`http://${now_ip}:16000/api/generate`); // 替换为您的 API 地址
          console.log("Response:", response.data);
          // 在这里处理响应数据，可以将数据存储到响应式变量中，以便在模板中使用
        } catch (error) {
          console.error("Error:", error);
          // 在这里处理错误
        }
        // 进行相关操作
      };
      const navigateToYamlRoute = () => {
  // 使用路由实例导航到"./yaml"路由
  router.push("./yaml");
};

  
      return {
        clearSession,
        generate,
        navigateToYamlRoute,
      };
    },
  };
  </script>
  
  <style scoped>
  /* 在这里添加您的样式 */
  </style>
  
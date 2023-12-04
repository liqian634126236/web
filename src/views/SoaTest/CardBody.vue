<template>
    <div class="card container" style="margin-top: 30px; width: 100%">
      <div class="card-body parentSlideDiv">
        <div
          id="member-card-body"
          class="form-group col-sm-12 bordered-div slidingDiv"
        ></div>
      </div>
    </div>
  </template>
  <style>
  .flat-div {
    margin: 0;
    padding: 0;
  }
  .flex-container {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
  }
  .center-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  
  <script>
  import { ref, onMounted } from "vue";
  import "../../../css/cardbody.css";
  
  export default {
    setup() {
      onMounted(() => {
        // 在组件渲染后执行 JavaScript 文件中的操作
        import("../../../js/cardbody.js").then((module) => {
          // 在模块加载完成后可以执行相关操作
          // 例如，处理 member-card-body 元素
          const memberCardBody = document.getElementById("member-card-body");
          if (memberCardBody) {
            console.log(memberCardBody.id);
          }
        });
      });
    },
  };
  </script>
  
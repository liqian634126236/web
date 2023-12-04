<template>
  <div class="yaml-editor">
    <div class="centered-container">
      <h2 class="debate-topic">ATP Yaml Editor</h2>
    </div>
    <textarea ref="textarea"></textarea>
    <div class="centered-container">
      <!-- <transition name="fade"> -->
      <button @click="autoFix" type="button" class="styled-button">
        Auto Fix
      </button>
      <!-- </transition> -->
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 24px; /* 设置字体大小 */
  color: #333; /* 设置字体颜色 */
  background-color: #f0f0f0; /* 设置背景颜色 */
  padding: 10px; /* 设置内边距 */
  border-radius: 15px; /* 设置圆角 */
  text-align: center; /* 水平居中 */
  line-height: 5vh; /* 垂直居中 */
  margin: 10; /* 去掉默认外边距 */
  position: relative;
  top: 20%;
  bottom: 20%;
  display: inline-block;
  transform: translateY(-30%);
  transition: font-size 0.5s;
}
h2:hover {
  font-size: 30px; /* 鼠标悬停时的字体大小 */
}
.debate-topic {
  animation: coolAnimation 5s infinite alternate;
}

@keyframes coolAnimation {
  0% {
    color: #09b2e5;
  }
  30% {
    color: #09e568;
  }
  50% {
    color: #e5b509;
  }
  70% {
    color: #ff0400;
  }
  100% {
    color: #09b2e5;
  }
}
.yaml-editor {
  height: 100%;
  position: relative;
}
.yaml-editor > .CodeMirror {
  height: auto;
  height: 300px;
}
.yaml-editor > .CodeMirror-scroll {
  min-height: 300px;
}
.yaml-editor > .cm-s-rubyblue span.cm-string {
  color: #f08047;
}

.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10vh;
}
.centered-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.styled-button {
  padding: 10px 20px;
  background-color: #10b3d0;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 定义按钮在被按下时的样式 */
  transition: background-color 0.3s;
}

.styled-button:hover {
  /* 定义按钮在鼠标悬停时的样式 */
  background-color: #0074b3;
}

.styled-button:active {
  /* 定义按钮在被按下时的样式 */
  background-color: #005580;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
/* 基本样式 */
#textarea-style {
  width: 100%; /* 宽度占满父容器 */
  height: 1200px; /* 高度 */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.3s; /* 添加过渡效果，以平滑改变边框颜色 */

  /* 默认状态下的边框颜色 */
  border-color: #ccc;
}

/* 鼠标悬停样式 */
#textarea-style:hover {
  background-color: #f5f5f5; /* 鼠标悬停时的背景颜色 */
  border-color: #999; /* 鼠标悬停时的边框颜色 */
}

/* 聚焦样式 */
#textarea-style:focus {
  border-color: #007bff; /* 聚焦时的边框颜色 */
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.5); /* 聚焦时的阴影效果 */
  outline: none; /* 移除默认的聚焦样式 */
}
.hoverable-textarea {
  width: 400px;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.3s; /* 添加过渡效果，以平滑改变边框颜色 */

  /* 默认状态下的边框颜色 */
  border-color: #ccc;
}

/* 鼠标悬停时的样式 */
.hoverable-textarea:hover {
  background-color: #f5f5f5; /* 鼠标悬停时的背景颜色 */
  border-color: #007bff; /* 鼠标悬停时的边框颜色 */
}

.slide-div {
  width: 30vh;
  height: 10vh;
  transition: width 4s, height 2s;
}

.slide-div:hover {
  width: 90vh;
  height: 30vh;
}
</style>

<script>
import { ref, onMounted, watch, onActivated } from "vue";
import { onBeforeRouteLeave } from 'vue-router'
import CodeMirror from "codemirror";
import "codemirror/addon/lint/lint.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/yaml/yaml";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/yaml-lint";
import useKeepScroll from '@/hooks/useKeepScroll.ts'
import jsyaml from "js-yaml";
window.jsyaml = jsyaml;
export default {
  name: "YamlEditor",
  props: ["value"],
  setup(props, { emit, refs }) {
    useKeepScroll()
    var yamlEditor = ref(null);
    const errorMessage = ref("");

    const initCodeMirror = () => {
      const options = {
        lineNumbers: true,
        mode: "text/x-yaml",
        gutters: ["CodeMirror-lint-markers"],
        theme: "monokai",
        lint: {
          getAnnotations: customLintFunction,
        },
        width: "500px", // 设置编辑器的宽度
        height: "300px", // 设置编辑器的高度
      };
      yamlEditor.value = CodeMirror.fromTextArea(
        document.querySelector(".yaml-editor textarea"),
        options
      );
      const CodeMirror_element = document.querySelector(".CodeMirror");
      CodeMirror_element.style.height = "600px";
      CodeMirror_element.style.width = "80%";
      CodeMirror_element.style.margin = "0 auto";
      yamlEditor.value.setValue(props.value || "");

      yamlEditor.value.on("change", (cm) => {
        if (cm) {
          emit("changed", cm.getValue());
          emit("update:value", cm.getValue());
        }
      });
    };

    const customLintFunction = (yamlContent) => {
      let lintResults = [];
      try {
        let lines = yamlContent.split("\n");

        for (let index = 0; index < lines.length; index++) {
          let currentLine = lines[index];
          let keyValueMatch = /^(.*?):(\s*)(.*)$/.exec(currentLine);

          if (keyValueMatch) {
            let key = keyValueMatch[1];
            let value = keyValueMatch[3].trim();

            // 计算键的空格数量
            let keyIndentation = /^(\s*)/.exec(key)[1].length;

            if (!value) {
              // 检查下一行是否是键的空格数量加两个空格
              if (index < lines.length - 1) {
                let nextLine = lines[index + 1];
                let nextIndentation = /^(\s*)/.exec(nextLine)[1].length;
                if (
                  nextIndentation !== keyIndentation + 2 &&
                  nextIndentation >= keyIndentation
                ) {
                  try {
                    lintResults.push({
                      message: `Indentation required in line ${index + 2}`,
                      severity: "error",
                      from: { line: index + 1, ch: 0 },
                      to: { line: index + 1, ch: 0 },
                    });
                  } catch (e) {
                    console.log(e);
                  }
                }
              }
            } else {
              // 如果有值，检查键值之间是否有空格
              if (keyValueMatch[2].length === 0) {
                try {
                  lintResults.push({
                    message: `Missing space between key and value in line ${
                      index + 1
                    }`,
                    severity: "error",
                    from: { line: index, ch: 0 },
                    to: { line: index, ch: 0 },
                  });
                } catch (e) {
                  console.log(e);
                }
              }
            }
          }
        }

        return lintResults;
      } catch (e) {
        errorMessage.value = e.message;
        return [];
      };
    };

    const autoFix = () => {
      // 获取当前编辑器内容
      let currentContent = yamlEditor.value.getValue();

      // 分割文本为行数组
      let lines = currentContent.split("\n");

      // 用于存储修复后的内容
      let fixedContent = "";

      // 用于跟踪当前缩进级别
      let currentIndentation = 0;

      for (let index = 0; index < lines.length; index++) {
        let currentLine = lines[index];
        let keyValueMatch = /^(.*?):(\s*)(.*)$/.exec(currentLine);

        if (keyValueMatch) {
          let key = keyValueMatch[1];
          let value = keyValueMatch[3].trim();

          // 计算键的空格数量
          let keyIndentation = /^(\s*)/.exec(key)[1].length;
          if (value) {
            // 检查并修复键值之间的空格
            if (keyValueMatch[2].length === 0) {
              // 添加一个空格
              if (index === lines.length - 1) {
                fixedContent += `${key}: ${value}`;
                continue;
              } else {
                fixedContent += `${key}: ${value}\n`;
              }
            } else {
              // 保持原样
              if (index === lines.length - 1) {
                fixedContent += `${currentLine}`;
                continue;
              } else {
                fixedContent += `${currentLine}\n`;
              }
            }
          } else {
            // 更新当前缩进级别
            if (index === lines.length - 1) {
              fixedContent += `${currentLine}`;
              continue;
            } else {
              fixedContent += `${currentLine}\n`;
            }
            currentIndentation = /^(\s*)/.exec(currentLine)[1].length;
            // 检查下一行是否有缩进问题
            if (index < lines.length - 1) {
              let nextLine = lines[index + 1];
              let nextIndentation = /^(\s*)/.exec(nextLine)[1].length;

              // 如果下一行的缩进级别与当前行不匹配，则修复缩进
              if (
                nextIndentation !== currentIndentation + 2 &&
                nextIndentation >= currentIndentation
              ) {
                // 添加适当数量的缩进
                lines[index + 1] =
                  " ".repeat(currentIndentation + 2) + nextLine.trim();
              }
            }
          }
        } else {
          // 对于非键值行，保持原样
          if (index === lines.length - 1) {
            fixedContent += `${currentLine}`;
            continue;
          } else {
            fixedContent += `${currentLine}\n`;
          }
        }
      }
      //   将修复后的内容设置回编辑器
      let minLines = 50; // 最少的行数
      let line_n = fixedContent.split("\n");
      while (line_n.length < minLines) {
        line_n.push(""); // 添加空行
      }
      fixedContent = line_n.join("\n");
      //   yamlEditor.value.setOption("lint", false);
      yamlEditor.value.setValue(fixedContent);
      //   yamlEditor.value.setOption("lint", {
      //     getAnnotations: customLintFunction,
      //   });
    };

    onMounted(() => {
      initCodeMirror();
      useKeepScroll(".CodeMirror-scroll")
    });

    // watch(
    //   () => props.value,
    //   (newValue) => {
    //     const editorValue = yamlEditor.value.getValue();
    //     if (newValue !== editorValue) {
    //       yamlEditor.value.setValue(newValue);
    //     }
    //   }
    // );

    return {
      yamlEditor,
      errorMessage,
      autoFix,
    };
  },
};
</script>

<template>
    <div>
      <el-button @click="showModal = true" v-if="!noNeedInitFlag"
        >填写soa配置信息</el-button
      >
      <el-dialog v-model="showModal" title="填写信息" @closed="closeModal">
        <el-form :model="formData" ref="form" :rules="rules">
          <el-form-item label="台架IP" prop="IP">
            <el-input
              v-model="formData.IP"
              @input="updateIp"
              placeholder="请输入台架IP，例如：10.110.xxx.xxx"
              class="col-sm-12"
            />
          </el-form-item>
          <el-form-item label="MPU版本" prop="mpuVersion">
            <el-input
              v-model="formData.mpuVersion"
              placeholder="请输入MPU版本信息，例如：0.6.4"
            />
          </el-form-item>
          <el-form-item label="网口环境变量" prop="netInterface">
            <el-input
              v-model="formData.netInterface"
              placeholder="请输入SOA使用网口名，例如：vlan.100"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showModal = false">取消</el-button>
          <el-button type="primary" @click="saveData">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <style>
  /* 添加样式 */
  </style>
  
  <script>
  import { ref, onMounted } from "vue";
  import {
    ElDialog,
    ElInput,
    ElButton,
    ElForm,
    ElFormItem,
    ElMessage,
  } from "element-plus";
  import axios from "axios";
  
  export default {
    components: {
      ElDialog,
      ElButton,
      ElForm,
      ElFormItem,
      ElInput,
    },
    props: ["initialIp"],
    setup(props, { emit, refs }) {
      const showModal = ref(false);
      const ip = ref(props.initialIp || "");
      const formData = ref({
        IP: "",
        mpuVersion: "",
        netInterface: "",
      });
  
      const rules = {
        IP: [{ required: true, message: "台架IP不能为空", trigger: "blur" }],
        mpuVersion: [
          { required: true, message: "MPU版本不能为空", trigger: "blur" },
        ],
        netInterface: [
          { required: true, message: "网口环境变量不能为空", trigger: "blur" },
        ],
      };
  
      // const { emit } = defineEmits(["update-ip"]);
      const initialIp = ref(props.initialIp);
      var noNeedInitFlag = ref(false);
  
      const validateForm = (formData, rules) => {
        return Promise.allSettled(
          Object.keys(formData).map((key) => {
            return Promise.allSettled(
              rules[key].map((rule) => {
                return new Promise((resolve, reject) => {
                  if (rule.required && !formData[key]) {
                    reject(rule.message);
                  } else {
                    resolve();
                  }
                });
              })
            ).then((results) =>
              results.every((result) => result.status === "fulfilled")
            );
          })
        ).then((fieldResults) => {
          const isValid = fieldResults.every((result) => result.value === true);
          return isValid;
        });
      };
  
      const saveData = async () => {
        validateForm(formData.value, rules)
          .then(async (valid) => {
            try {
              if (!noNeedInitFlag.value) {
                await axios.post(
                  `http://${formData.value.IP}:16001/api/change_version`,
                  formData.value,
                  {
                    timeout: 20000,
                  }
                );
                await axios.post(
                  `http://${formData.value.IP}:16001/api/init`,
                  formData.value,
                  {
                    timeout: 20000,
                  }
                );
              }
  
              if (valid) {
                emit("update-ip", formData.value.IP);
                closeModal();
                noNeedInitFlag.value = true;
              } else {
                console.log("表单验证失败");
              }
            } catch (error) {
              console.error("Error:", error);
              ElMessage.error("保存失败，请检查IP是否正确");
            }
          })
          .catch((error) => {
            console.error("表单验证出错", error);
          });
      };
      function closeModal() {
        showModal.value = false;
      }
  
      onMounted(() => {
        // 检查是否存在JSON文件
        readJSONFile("atp_web_env.json", async (error, jsonData) => {
          if (!error && jsonData) {
            formData.value.IP = initialIp.value || jsonData.ip || "";
            formData.value.mpuVersion = jsonData.mpuVersion || "";
            formData.value.netInterface = jsonData.netInterface || "";
            console.log("formData.value.IP: " + jsonData.noNeedInitFlag);
            noNeedInitFlag.value = jsonData.noNeedInitFlag || false;
            showModal.value = !noNeedInitFlag.value;
            await saveData();
          } else {
            showModal.value = true;
          }
        });
      });
  
      const readJSONFile = (filePath, callback) => {
        fetch(filePath)
          .then((response) => {
            if (!response.ok) {
              throw new Error("无法加载文件");
            }
            return response.json();
          })
          .then((data) => {
            callback(null, data);
          })
          .catch((error) => {
            callback(error, null);
          });
      };
  
      const updateIp = (value) => {
        formData.value.IP = value;
      };
  
      return {
        showModal,
        ip,
        formData,
        rules,
        saveData,
        updateIp,
        closeModal,
        validateForm,
        noNeedInitFlag,
      };
    },
  };
  </script>
  
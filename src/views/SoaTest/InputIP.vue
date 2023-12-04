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
          <el-select
            v-model="formData.mpuVersion"
            placeholder="请选择MPU版本"
            class="col-sm-12"
          >
            <el-option
              v-for="item in selectMpuVersion"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="网口环境变量" prop="netInterface">
          <el-select
            v-model="formData.netInterface"
            placeholder="请选择网口环境变量"
            multiple
            class="col-sm-12"
          >
            <el-option
              v-for="item in selectNetInterface"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="info" @click="get_init_data">初始化</el-button>
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
import { ref, onMounted } from 'vue'
import {
  ElDialog,
  ElInput,
  ElButton,
  ElForm,
  ElFormItem,
  ElMessage,
  ElSelect,
  ElOption
} from 'element-plus'
import axios from 'axios'

export default {
  components: {
    ElDialog,
    ElButton,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption
  },
  props: ['initialIp'],
  setup (props, { emit, refs }) {
    const showModal = ref(true)
    const ip = ref(props.initialIp || '')
    const formData = ref({
      IP: '',
      mpuVersion: '',
      netInterface: ''
    })

    const rules = {
      IP: [{ required: true, message: '台架IP不能为空', trigger: 'blur' }],
      mpuVersion: [
        { required: true, message: 'MPU版本不能为空', trigger: 'blur' }
      ],
      netInterface: [
        { required: true, message: '网口环境变量不能为空', trigger: 'blur' }
      ]
    }

    // const { emit } = defineEmits(["update-ip"]);
    const initialIp = ref(props.initialIp)
    var noNeedInitFlag = ref(false)
    var selectNetInterface = ref([])
    var selectMpuVersion = ref([])
    var selectIP = ref('')
    var mountFlag = ref(true)

    const validateForm = (formData, rules) => {
      return Promise.allSettled(
        Object.keys(formData).map(key => {
          return Promise.allSettled(
            rules[key].map(rule => {
              return new Promise((resolve, reject) => {
                if (rule.required && !formData[key]) {
                  reject(rule.message)
                } else {
                  resolve()
                }
              })
            })
          ).then(results =>
            results.every(result => result.status === 'fulfilled')
          )
        })
      ).then(fieldResults => {
        const isValid = fieldResults.every(result => result.value === true)
        return isValid
      })
    }

    const saveData = async () => {
      validateForm(formData.value, rules)
        .then(async valid => {
          try {
            if (!noNeedInitFlag.value) {
              await axios.post(
                `http://${formData.value.IP}:16001/api/change_version`,
                formData.value,
                {
                  timeout: 20000
                }
              )
              await axios.post(
                `http://${formData.value.IP}:16001/api/init`,
                formData.value,
                {
                  timeout: 20000
                }
              )
            }

            if (valid) {
              emit('update-ip', formData.value.IP)
              closeModal()
              noNeedInitFlag.value = true
              mountFlag.value = false
              showModal.value = !noNeedInitFlag.value
            } else {
              console.log('表单验证失败')
            }
          } catch (error) {
            console.error('Error:', error)
            ElMessage.error('保存失败，请检查IP是否正确')
          }
        })
        .catch(error => {
          console.error('表单验证出错', error)
        })
    }
    function closeModal () {
      showModal.value = false
    }
    const readJSONFile = async filePath => {
      try {
        const response = await fetch(filePath)

        if (!response.ok) {
          throw new Error('无法加载文件')
        }

        const data = await response.json()
        return data
      } catch (error) {
        throw error
      }
    }

    const get_init_data = async () => {
      const read_nuc_ip_url =
        'http://' + formData.value.IP + ':15999/api/read_nuc_ip'
      const read_port_url =
        'http://' + formData.value.IP + ':15999/api/read_port'
      const read_soa_ver_url =
        'http://' + formData.value.IP + ':15999/api/read_soa_ver'
      var nuc_ip_url_res = await axios.post(
        read_nuc_ip_url,
        {},
        { timeout: 3000 }
      )
      var netInterface_url_res = await axios.post(
        read_port_url,
        {},
        {
          timeout: 3000
        }
      )
      var mpuVersion_url_res = await axios.post(
        read_soa_ver_url,
        {},
        {
          timeout: 3000
        }
      )
      console.log(nuc_ip_url_res.data)
      console.log(netInterface_url_res.data)
      console.log(mpuVersion_url_res.data)
      selectIP.value = nuc_ip_url_res.data.nuc_ip || ''
      formData.value.IP = selectIP.value
      selectNetInterface.value = netInterface_url_res.data.net_port || []
      //   formData.value.netInterface = selectNetInterface.value;
      selectMpuVersion.value = mpuVersion_url_res.data.soa_version || []
      //   formData.value.mpuVersion = selectMpuVersion.value
      noNeedInitFlag.value = false
      showModal.value = !noNeedInitFlag.value
      //   await saveData();
    }
    onMounted(async () => {
      let i = 5
      while (i > 0) {
        i = i - 1
        try {
          let jsonData = await readJSONFile('atp_web_env.json')
          formData.value.IP = formData.value.IP || jsonData.ip || ''
          await get_init_data()
          break
        } catch (error) {
          console.log('get_init_data error: ' + error)
        }
      }
    })

    const updateIp = value => {
      formData.value.IP = value
    }

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
      get_init_data,
      selectNetInterface,
      selectMpuVersion,
      selectIP,
      mountFlag
    }
  }
}
</script>

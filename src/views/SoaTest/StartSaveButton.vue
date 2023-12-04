<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <button
    class="styled-button btn btn-info btn-sm"
    type="button"
    @click="showStartedList"
    style="margin-top: 20px"
  >
    Refresh Started Mock Service List
  </button>
  <el-select
    v-model="selectedServices"
    multiple
    filterable
    v-if="showSelect"
    style="margin-top: 20px"
    :popper-class="'checkbox-select'"
  >
    <el-option
      v-for="service in startServiceList"
      :key="service"
      :label="service"
      :value="service"
      :show-checkbox="true"
    ></el-option>
  </el-select>
  <button
    class="styled-button btn btn-info btn-sm"
    type="button"
    @click="StopSelectedServices"
    style="margin-top: 20px"
    :disabled="StopServiceFlag"
  >
    Stop Selected Services
  </button>
  <button
    type="button"
    class="col-form-label col-sm-12 centered-buttons btn btn-info btn-sm"
    @click="toggleButtons"
    style="margin-top: 20px"
  >
    {{ SwitchMessage }}
  </button>
  <div
    v-if="showGroup1"
    class="row col-sm-12 center-container"
    style="margin-top: 20px"
  >
    <div
      v-for="(button, index) in filteredServerButtons"
      :key="index"
      class="col-form-label col-sm-6 center-container"
    >
      <button
        :disabled="button.disabled"
        v-if="button.flag"
        type="button"
        @click="triggerCustomEvent(button)"
        class="btn btn-info btn-sm styled-button"
      >
        {{ button.text }}
      </button>
    </div>
  </div>
  <div v-else class="row col-sm-12 center-container" style="margin-top: 20px">
    <div
      v-for="(button, index) in filteredClientButtons"
      :key="index"
      class="col-form-label col-sm-6 center-container"
    >
      <button
        :disabled="button.disabled"
        v-if="button.flag"
        type="button"
        @click="triggerCustomEvent(button)"
        class="btn btn-info btn-sm styled-button"
      >
        {{ button.text }}
      </button>
    </div>
  </div>
  <div>
    <button
      @click="openModal"
      type="button"
      class="col-form-label col-sm-12 centered-buttons btn btn-info btn-sm"
    >
      Open Subscriptions Windows
    </button>

    <el-dialog
      v-model="modalVisible"
      title="Real Time Subscriptions"
      @closed="closeModal"
      :append-to-body="true"
    >
      <div v-html="subscribe_output_str" class="formatted-json"></div>
      <!-- {{ subscribe_output_str }} -->
      <!-- </pre
              > -->
    </el-dialog>
  </div>
</template>
<style>
.checkbox-select .el-select-dropdown {
  width: auto;
  max-height: 200px; /* 控制下拉列表的最大高度 */
  overflow-y: auto;
}
.flex-container {
  display: flex;
  align-items: center; /* 垂直居中对齐按钮和 <el-select> */
  margin-top: 20px;
}
.centered-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 5vh; /* 让容器高度占满视口，以垂直居中按钮 */
}
.formatted-json {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
}
.styled-button {
  font-size: 12px; /* 调整字体大小，可以根据需要调整值 */
  padding: 3px 6px; /* 调整内边距，以控制按钮的高度和宽度 */
  border: 1px solid #ccc; /* 添加边框，可以根据需要调整样式 */
  border-radius: 5px; /* 添加圆角 */
  background-color: #0b9eb8; /* 背景颜色 */
  color: rgb(255, 255, 255); /* 文本颜色 */
  margin: 0;
  white-space: nowrap; /* Prevent text from wrapping */
}
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>

<script>
import {
  defineComponent,
  ref,
  watchEffect,
  onMounted,
  defineProps,
  watch,
  computed
} from 'vue'
import axios from 'axios'
import lodash from 'lodash'
import { ElDialog, ElMessage } from 'element-plus'

export default defineComponent({
  props: {
    oc: { type: Number, required: false, default: 0 }
  },
  components: {
    // ElDialog, // 注册 el-dialog 组件
  },
  setup (props, { attrs, emit }) {
    const innerCounter = ref(0)
    const startButton = ref(0)
    const message = ref('')
    let items = ref([])
    let tempV = ref(0)
    var startList = ref([])
    var send_members_dict = ref({})
    var startInstanceList = ref([])
    var subscribe_flag = ref({})
    var subscribe_output = ref({})
    var subscribe_output_str = ref('')
    var send_now_data_dict = ref({})

    async function sleep(ms) {
      await new Promise((resolve) => setTimeout(resolve, ms));
      return true
    }
    function removeNullOrNaN (obj) {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        const filteredArray = obj
          .filter(item => item !== null && !Number.isNaN(item))
          .map(item => removeNullOrNaN(item))

        return filteredArray.length > 0 ? filteredArray : [] // 返回 null 而不是 undefined
      }

      const newObj = {}
      for (const key in obj) {
        if (obj[key] !== null && !Number.isNaN(obj[key])) {
          newObj[key] = removeNullOrNaN(obj[key])
        }
      }
      return Object.keys(newObj).length > 0 ? newObj : {} // 返回 null 而不是 undefined
    }

    const triggerCustomEvent = async button => {
      let now_ip = window.bench_now_ip
      let data = {}
      let selectedService = ref(document.getElementById('selectedService'))
      let instanceName = lodash.cloneDeep(window.instance_name)
      let ins_block = ''
      let input_msg_notify = {}
      if (instanceName) {
        ins_block = ':(' + instanceName + ')'
      } else {
        ins_block = ''
      }
      let ins_block_nokuohao = ''
      if (instanceName) {
        ins_block_nokuohao = ':' + instanceName
      } else {
        ins_block_nokuohao = ''
      }
      let inst_service_name = selectedService.value.value + ins_block_nokuohao
      let RPC_item = document.getElementById('RPC')
      let NowRPC = RPC_item.options[RPC_item.selectedIndex]?.textContent
      if (NowRPC !== '') {
        data['current_rpc'] = lodash.cloneDeep(NowRPC)
      }
      if (NowRPC) {
        send_now_data_dict.value = {
          ...lodash.cloneDeep(
            window.rpc_member_dict[NowRPC + ins_block]['input']
          ),
          ...lodash.cloneDeep(
            window.rpc_member_dict[NowRPC + ins_block]['output']
          )
        }
        input_msg_notify = lodash.cloneDeep(
          window.rpc_member_dict[NowRPC + ins_block]['input']
        )
      }
      console.log(JSON.stringify(send_now_data_dict.value))
      innerCounter.value++
      emit('startEvent')
      startButton.value++
      window.startButtonValue = startButton.value
      console.log('innerCounter:' + innerCounter.value)
      console.log('startButton:' + startButton.value)
      console.log('parent outerCounter:' + props.oc)

      send_members_dict.value[startButton.value] = lodash.cloneDeep(
        window.members_dict['members']
      )

      if (NowRPC) {
        console.info(
          'Input Message: ' +
            JSON.stringify(window.rpc_member_dict[NowRPC + ins_block]['input'])
        )
        console.info(
          'Output Message: ' +
            JSON.stringify(window.rpc_member_dict[NowRPC + ins_block]['output'])
        )
      }
      data['service_name'] =
        selectedService.value.value
      console.log(startList.value)
      console.log('Instance name: ' + instanceName)
      data['members'] = JSON.parse(
        JSON.stringify(removeNullOrNaN(send_now_data_dict.value))
      )
      data['instance'] = instanceName

      if (button.text == 'Start/Update') {
        if (
          selectedService.value.value &&
          selectedService.value.value !== undefined
        ) {
          if (
            !startList.value.includes(
              selectedService.value.value + ins_block
            )
          ) {
            startList.value.push(
              selectedService.value.value + ins_block
            )
            window.startList.push(
              selectedService.value.value + ins_block
            )
          }
        }
        console.log(data)
        console.log(now_ip)
        button.disabled = true
        try {
          //   const formData = new FormData();
          //   for (let key in data) {
          //     formData.append(key, data[key]);
          //   }
          //   console.log(formData);
          const response = await axios.post(
            `http://${now_ip}:16000/api/updateserver`,
            data
            // {
            //   headers: {
            //     "Content-Type": "application/x-www-form-urlencoded",
            //   },
            // }
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
          let RPC = document.getElementById('RPC')
        let rpcE = RPC.options[RPC.selectedIndex]?.textContent
        server_buttons.value[inst_service_name+":"+rpcE][1].flag = true
        server_buttons.value[inst_service_name+":"+rpcE][3].flag = true
        server_buttons.value[inst_service_name+":"+rpcE][4].flag = true
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      } else if (button.text == 'Stop') {
        console.log(data)
        if (
            selectedService.value.value &&
          selectedService.value.value !== undefined
        ) {
          if (
            startList.value.includes(
              selectedService.value.value + ins_block
            )
          ) {
            startList.value = startList.value.filter(
              item =>
                item !==
                selectedService.value.value +
                  ins_block
            )
            window.startList = window.startList.filter(
              item =>
                item !==
                selectedService.value.value +
                  ins_block
            )
          }
          button.disabled = true
          data['selected_services'] = [
            selectedService.value.value + ins_block_nokuohao
          ]
          try {
            const response = await axios.post(
              `http://${now_ip}:16000/api/stopserver`,
              data
            )
            console.log(JSON.stringify(response.data, null, 4))
            // alert(JSON.stringify(response.data, null, 4));
            ElMessage({
              message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
              type: 'success',
              duration: 25000, // 设置显示时间，单位是毫秒
              showClose: true,
            dangerouslyUseHTMLString: true
            })
            let RPC = document.getElementById('RPC')
        let rpcE = RPC.options[RPC.selectedIndex]?.textContent
            server_buttons.value[inst_service_name+":"+rpcE][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcE][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcE][4].flag = false
          } catch (error) {
            console.error('Error:', error)
          }
        }
        button.disabled = false
      } else if (button.text == 'Notify Once') {
        let RPC = document.getElementById('RPC')
        let rpcE = RPC.options[RPC.selectedIndex]?.textContent
        button.disabled = true
        server_buttons.value[inst_service_name+":"+rpcE][4].disabled = true
        data['target'] = 'notify_once'
        data["notify_msg"] = input_msg_notify
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/switch_notify`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 2000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
        server_buttons.value[inst_service_name+":"+rpcE][4].disabled = false
        console.log(10)
      } else if (button.text == 'Notify Cycle') {
        let RPC = document.getElementById('RPC')
        let rpcE = RPC.options[RPC.selectedIndex]?.textContent
        button.disabled = true
        server_buttons.value[inst_service_name+":"+rpcE][3].disabled = true
        data['target'] = 'notify_cycle'
        data["notify_msg"] = input_msg_notify
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/switch_notify`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 2000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
        server_buttons.value[inst_service_name+":"+rpcE][3].disabled = false
        console.log(11)
      } else if (button.text == 'Save') {
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16010/api/saveserver`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      } else if (button.text == 'Request Sync') {
        data['req_action'] = 'request_sync'
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/make_request`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      } else if (button.text == 'Get Field') {
        data['req_action'] = 'get_field'
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/make_request`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true,
            iconClass: 'el-icon-info'
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      } else if (button.text == 'Transmit') {
        data['req_action'] = 'transmit'
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/make_request`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      } else if (button.text == 'Subscribe') {
        data['req_action'] = 'subscribe'
        console.log(now_ip)
        button.disabled = true
        try {
          let response = await fetch(
            'http://' + now_ip + ':16000/api/make_request',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            }
          )
          console.log(response)

          if (!response.ok) {
            ElMessage({
              message: 'Subscribe Fail',
              type: 'error',
              duration: 25000, // 设置显示时间，单位是毫秒
              showClose: true,
            })
            console.error(response)
          } else {
            ElMessage({
              message: 'Subscribe Success',
              type: 'success',
              duration: 25000, // 设置显示时间，单位是毫秒
              showClose: true,
            })
          }
          button.disabled = false

          const reader = response.body.getReader()
          const textDecoder = new TextDecoder()
          subscribe_flag.value[NowRPC + ins_block] = true
          while (subscribe_flag.value[NowRPC + ins_block]) {
            const { done, value } = await reader.read()

            if (done) {
              console.log('Stream ended')
              subscribe_flag.value[NowRPC + ins_block] = false
              break
            }

            const chunkText = textDecoder.decode(value)
            subscribe_output.value[NowRPC + ins_block] =
              escapeJSONStringForHTML(chunkText)
            subscribe_output_str.value = JSON.stringify(
              subscribe_output.value,
              null,
              4
            )
            console.log('Received chunk:', chunkText)
          }
          if (subscribe_flag.value[NowRPC + ins_block] == false) {
            delete subscribe_output.value[NowRPC + ins_block]
            subscribe_output_str.value = JSON.stringify(
              subscribe_output.value,
              null,
              4
            )
          }
        } catch (error) {
          console.error(error)
        }
      } else if (button.text == 'Unsubscribe') {
        subscribe_flag.value[NowRPC + ins_block] = false
        delete subscribe_output.value[NowRPC + ins_block]
        subscribe_output_str.value = JSON.stringify(
          subscribe_output.value,
          null,
          4
        )
        data['req_action'] = 'unsubscribe'
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/make_request`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          console.log(response)

          if (response.status > 300) {
            ElMessage({
              message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
              type: 'error',
              duration: 25000, // 设置显示时间，单位是毫秒
              showClose: true,
            dangerouslyUseHTMLString: true
            })
          } else {
            ElMessage({
              message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
              type: 'success',
              duration: 25000, // 设置显示时间，单位是毫秒
              showClose: true,
            dangerouslyUseHTMLString: true
            })
          }
        } catch (error) {
          ElMessage({
            message: JSON.stringify(error.response.data, null, 4),
            type: 'error',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
          })
        }
        button.disabled = false
      } else if (button.text == 'Set Field') {
        data['req_action'] = 'set_field'
        console.log(data)
        button.disabled = true
        try {
          const response = await axios.post(
            `http://${now_ip}:16000/api/make_request`,
            data
          )
          console.log(JSON.stringify(response.data, null, 4))
          //   alert(JSON.stringify(response.data, null, 4));
          ElMessage({
            message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
            type: 'success',
            duration: 25000, // 设置显示时间，单位是毫秒
            showClose: true,
            dangerouslyUseHTMLString: true
          })
        } catch (error) {
          console.error('Error:', error)
        }
        button.disabled = false
      }
    }
    function prettyPrintArrayVertical (arr) {
      let result = ''
      for (const item of arr) {
        result += `${item}\n`
      }
      return result
    }
    var selectedServices = ref([])
    var showSelect = ref(false)
    var startServiceList = ref([])
    var StopServiceFlag = ref(false)
    async function showStartedList () {
      try {
        let now_ip = window.bench_now_ip
        let url = 'http://' + now_ip + ':16000/api/started_service_list'
        let response = await axios.get(url)
        startServiceList.value = response.data.servicelist
        showSelect.value = true // 显示 <el-select>
      } catch (error) {
        console.error(error)
      }
    }
    async function StopSelectedServices () {
      let now_ip = window.bench_now_ip
      let url = 'http://' + now_ip + ':16000/api/stopserver'
      let data = {}
      data['selected_services'] = selectedServices.value
      console.log(data)
      let servicesToStop = selectedServices.value
      StopServiceFlag.value = true
      try {
        const response = await axios.post(url, data)
        console.log(JSON.stringify(response.data, null, 4))
        // alert(JSON.stringify(response.data, null, 4));
        ElMessage({
          message: '<pre>' + JSON.stringify(response.data, null, 4) + '</pre>',
          type: 'success',
          duration: 25000, // 设置显示时间，单位是毫秒
          showClose: true,
          dangerouslyUseHTMLString: true
        })
        // for (let i = 0;i<response.data.rpcList.length;i++){
        //     if (response.data.rpcList[i] in server_buttons.value){
        //   let rpcE = response.data.rpcList[i]
        //   server_buttons.value[rpcE][1].flag = false
        //   server_buttons.value[rpcE][3].flag = false
        //   server_buttons.value[rpcE][4].flag = false}
        // }
      } catch (error) {
        console.error('Error:', error)
      }
      startServiceList.value = startServiceList.value.filter(
        service => !servicesToStop.includes(service)
      )
      StopServiceFlag.value = false
      // 清空选中的服务
      selectedServices.value = []
    }
    const modalVisible = ref(false)

    // Simulated dynamic data update
    // setInterval(() => {
    //   console.log(subscribe_output.value);
    // }, 1000);

    function openModal () {
      modalVisible.value = true
      console.log('open')
    }

    function closeModal () {
      modalVisible.value = false
    }
    function escapeJSONStringForHTML (jsonString, indentLevel = 4) {
      // 替换\n为HTML换行标签
      const spaces = '  '.repeat(indentLevel) // 每层级缩进两个空格
      const lines = jsonString.split('\n') // 拆分字符串为行数组

      // 处理每一行并添加缩进
      const indentedLines = lines.map(line => {
        const indentedLine = line.replace(/"/g, '&quot;') // 替换"为HTML实体编码
        return `${spaces}${indentedLine}`
      })

      // 将行重新组合成字符串，用<br>标签分隔
      const indentedAndEscapedString = indentedLines.join('<br>')

      return '<br>' + indentedAndEscapedString
    }

    const SwitchMessage = ref('Switch(Now is Server)')
    const showGroup1 = ref(true)
    const RPC = ref(null) // Define RPC as a ref without an initial value
    const get_field = ref(false)
    const set_field = ref(false)
    const subscribe = ref(false)
    const request_sync = ref(false)
    const transmit = ref(false)
    const unsubscribe = ref(false)
    const apply = ref(false)
    const stop = ref(false)
    const save = ref(false)
    const notify_once = ref(true)
    const notify_cycle = ref(true)
    var client_buttons = ref({})

    var server_buttons = ref({})

    const toggleButtons = () => {
      // 切换showGroup1的值
      showGroup1.value = !showGroup1.value

      // 根据showGroup1的值更新SwitchMessage的文本
      SwitchMessage.value = showGroup1.value
        ? 'Switch(Now is Server)'
        : 'Switch(Now is Client)'

      // 获取RPC相关数据（这部分逻辑需要根据你的实际情况调整）
      const RPC_item = document.getElementById('RPC')
      const NowRPC = RPC_item.options[RPC_item.selectedIndex]?.textContent

      // 输出日志信息（这部分逻辑需要根据你的实际情况调整）
      console.log('RPC Type' + JSON.stringify(window.rpcType))
      console.info(
        'Input Message: ' + JSON.stringify(window.selectedInputValues)
      )
      console.info(
        'Output Message: ' + JSON.stringify(window.selectedOutputValues)
      )
      console.info('Now bench ip is ' + window.bench_now_ip)
      console.info('selectedRPC: ' + NowRPC)
      console.info('instance_name: ' + window.instance_name)
    }
    

    const handleRPCClick = async () => {
      // 获取选择的RPC选项的文本
      let selectedService = ref(document.getElementById('selectedService'))
      let instanceName = lodash.cloneDeep(window.instance_name)
      let ins_block_nokuohao = ''
      if (instanceName) {
        ins_block_nokuohao = ':' + instanceName
      } else {
        ins_block_nokuohao = ''
      }
      let inst_service_name = selectedService.value.value + ins_block_nokuohao
      const rpcEXT = RPC.value.options[RPC.value.selectedIndex]?.textContent
      console.info(rpcEXT)
      console.info('window.rpcType:' + window.rpcType)
      let RPCtype = window.rpcType[rpcEXT]
      console.info(rpcEXT+":rpcType:"+RPCtype)
      let startTime = Date.now()
      while (!RPCtype && Date.now() - startTime < 1000) {
        // 使用 setTimeout 来等待一段时间后再继续检查
        await new Promise(resolve => setTimeout(resolve, 100))

        // 重新获取 RPCtype 的值
        RPCtype = window.rpcType[rpcEXT]
      }
      if (client_buttons.value[inst_service_name+":"+rpcEXT] == undefined) {
        client_buttons.value[inst_service_name+":"+rpcEXT] = [
          { text: 'Request Sync', flag: false, disabled: false },
          { text: 'Get Field', flag: false, disabled: false },
          { text: 'Transmit', flag: false, disabled: false },
          { text: 'Subscribe', flag: false, disabled: false },
          { text: 'Set Field', flag: false, disabled: false },
          { text: 'Unsubscribe', flag: false, disabled: false }
        ]

        server_buttons.value[inst_service_name+":"+rpcEXT] = [
          { text: 'Start/Update', flag: false, disabled: false },
          { text: 'Stop', flag: false, disabled: false },
          { text: 'Save', flag: false, disabled: false },
          { text: 'Notify Once', flag: false, disabled: false },
          { text: 'Notify Cycle', flag: false, disabled: false }
        ]
      }

      // 根据RPCtype的值设置响应式数据
      if (RPCtype !== undefined && RPCtype === 'FIELD_READONLY') {
        request_sync.value = false
        get_field.value = true
        transmit.value = false
        subscribe.value = true
        set_field.value = false
        unsubscribe.value = true
        apply.value = true
        stop.value = true
        save.value = false
        notify_once.value = true
        notify_cycle.value = true
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      } else if (RPCtype !== undefined && RPCtype === 'FIELD_WRITABLE') {
        request_sync.value = false
        get_field.value = true
        transmit.value = true
        subscribe.value = true
        set_field.value = true
        unsubscribe.value = true
        apply.value = true
        stop.value = true
        save.value = false
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      } else if (RPCtype !== undefined && RPCtype === 'FIELD_READONLY_NOSUB') {
        request_sync.value = false
        get_field.value = true
        transmit.value = false
        subscribe.value = false
        set_field.value = false
        unsubscribe.value = false
        apply.value = true
        stop.value = true
        save.value = false
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      } else if (RPCtype !== undefined && RPCtype === 'FIELD_WRITEABLE_NOSUB') {
        request_sync.value = false
        get_field.value = true
        transmit.value = true
        subscribe.value = false
        set_field.value = true
        unsubscribe.value = false
        apply.value = true
        stop.value = true
        save.value = false
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      } else if (RPCtype !== undefined && RPCtype === 'METHOD') {
        request_sync.value = true
        get_field.value = false
        transmit.value = true
        subscribe.value = false
        set_field.value = false
        unsubscribe.value = false
        apply.value = true
        stop.value = true
        save.value = false
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      } else {
        request_sync.value = false
        get_field.value = false
        transmit.value = false
        subscribe.value = true
        set_field.value = false
        unsubscribe.value = true
        apply.value = true
        stop.value = true
        save.value = false
        client_buttons.value[inst_service_name+":"+rpcEXT][0].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][3].flag = true
        client_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
        client_buttons.value[inst_service_name+":"+rpcEXT][5].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][0].flag = true
        server_buttons.value[inst_service_name+":"+rpcEXT][1].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][2].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][3].flag = false
        server_buttons.value[inst_service_name+":"+rpcEXT][4].flag = false
      }
    }

    // Add an event listener for RPC change
    const selectElement = ref(null)
    const selectedIndex = ref(-1)
    var RPCtext = ref('')
    onMounted(() => {
      RPC.value = document.getElementById('RPC') // Set the RPC value here
      if (RPC.value) {
        RPC.value.addEventListener('change', handleRPCClick)
      }
      selectElement.value = document.getElementById('RPC')
    })

    var previousState = {} // 用于记录以前的状态
    var inst_service_name_rpc = ref("")

    setInterval(() => {
      const selectedIndex = selectElement.value?.selectedIndex
      let NowRPC = selectElement.value?.options[selectedIndex]?.textContent
      console.log(NowRPC)
      if (NowRPC == undefined) {
        RPCtext.value = ''
      } else {
        RPCtext.value = NowRPC
      }
      let selectedService = ref(document.getElementById('selectedService'))
      let instanceName = lodash.cloneDeep(window.instance_name)
      let ins_block_nokuohao = ''
      if (instanceName) {
        ins_block_nokuohao = ':' + instanceName
      } else {
        ins_block_nokuohao = ''
      }
      if (selectedService.value){
      inst_service_name_rpc.value = selectedService.value.value + ins_block_nokuohao+":"+RPCtext.value}
      else{
        inst_service_name_rpc.value = ""
      }
    }, 500) // 每秒检查一次

    const filteredClientButtons = computed(() => {
      // 计算属性的值是基于其他响应式变量的
      return client_buttons.value[inst_service_name_rpc.value]?.filter(button => button.flag)
      
    })
    const filteredServerButtons = computed(() => {
      // 计算属性的值是基于其他响应式变量的
      return server_buttons.value[inst_service_name_rpc.value]?.filter(button => button.flag)
    })

    return {
      innerCounter,
      startButton,
      triggerCustomEvent,
      message,
      items,
      tempV,
      startList,
      showStartedList,
      startInstanceList,
      prettyPrintArrayVertical,
      subscribe_output,
      modalVisible,
      openModal,
      closeModal,
      subscribe_output_str,
      escapeJSONStringForHTML,
      SwitchMessage,
      showGroup1,
      RPC,
      get_field,
      set_field,
      subscribe,
      request_sync,
      transmit,
      unsubscribe,
      apply,
      stop,
      save,
      notify_once,
      notify_cycle,
      client_buttons,
      server_buttons,
      toggleButtons,
      handleRPCClick,
      selectedServices,
      showSelect,
      startServiceList,
      StopSelectedServices,
      StopServiceFlag,
      selectElement,
      selectedIndex,
      previousState,
      filteredClientButtons,
      filteredServerButtons,
      sleep,
      RPCtext,
      inst_service_name_rpc
    }
  }
})
</script>

<template>
    <div class="form-group row">
      <GetIP @update-ip="handleUpdateIp" class="col-sm-7 flex-container" />
    </div>
    <label
      for="inputEmail"
      class="col-sm-3 col-form-label"
      style="margin-top: 20px"
      >Service Name</label
    >
    <div class="col-sm-9" style="margin-top: 20px">
    <el-select v-model="selectServiceNow" filterable clearable placeholder="请选择服务名" id="selectedService" @change="handleServiceChange">
        <el-option
          v-for="item in serviceOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </div>
  </template>
  <style>

.el-select {
  width: 100%; /* 设置宽度 */
}

  .center-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .flat-div {
    margin: 0;
    padding: 0;
    /* padding是贴着左 */
  }
  .flex-container {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    margin: 0;
  }
  .centered-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 4vh; /* 让容器高度占满视口，以垂直居中按钮 */
  }
  
  /* 给按钮之间添加一些间距 */
  .centered-buttons button {
    margin: 0 10px;
  }
  .txtCenter {
    text-align: center;
  }
  .txtLeft {
    text-align: left;
  }
  
  /* 右对齐文本样式 */
  .txtRight {
    text-align: right;
  }
  .divRight {
    margin-left: 0px; /* 添加适当的左边距 */
  }
  .divLeft {
    margin-right: 100px; /* 添加适当的右边距 */
  }
  .select-container {
    position: relative;
    display: inline-block;
  }
  
  /* 样式化选择框 */
  .select-container select {
    /* padding: 5px;
              font-size: 16px; */
    position: relative;
    z-index: 0; /* 使得 select 在上层 */
    font-weight: 200px; /* 设置高度 */
  }
  
  /* 样式化输入框 */
  .select-container input {
    /* padding: 5px;
              font-size: 16px; */
    position: absolute;
    top: 0;
    /* left: 0; */
    width: 80%;
    /* height: 100%; */
    box-sizing: border-box1;
    z-index: 1; /* 使得 input 在下层 */
  }
  </style>
  
  <script>
  import {
    ref,
    watchEffect,
    onMounted,
    watch,
    onBeforeMount,
    provide,
    computed
  } from 'vue'
  import GetIP from './InputIP.vue'
  import axios from 'axios'
  import { useStore } from 'vuex'
  import {
    ElDialog,
    ElInput,
    ElButton,
    ElForm,
    ElFormItem,
    ElMessage
  } from 'element-plus'
  
  // 异步请求获取service options
  
  export default {
    name: 'ServiceInfoComponent',
    components: {
      GetIP
    },
    setup (props, { attrs, emit }) {
      var serviceOptions = ref([])
      var serviceInfo = ref({})
      const childIp = ref('')
      var service_list = []
      var temp = ref('')
      var selectServiceNow = ref('')
      var selectedService = ref(document.createElement('select'))
      selectedService.value.className = 'form-control custom-select'
      const rpcOptions = ref([])
  
      const getSrvList = async () => {
        selectedService = ref(document.createElement('select'))
        selectedService.value.className = 'form-control custom-select'
        const url = 'http://' + childIp.value + ':16000/api/servicelist'
        try {
          console.log('getSrvList: ' + url)
          const response = await axios.get(url, { timeout: 1000 })
          console.log(response.data.servicelist)
          service_list = response.data.servicelist
          service_list.sort(function (a, b) {
            return a.localeCompare(b)
          })
          serviceOptions.value = service_list
          for (let i = 0; i < service_list.length; i++) {
            let option = document.createElement('option')
            option.value = i + 1
            option.textContent = service_list[i]
            selectedService.value.appendChild(option)
          }
  
          return response.data.servicelist
        } catch (error) {
          console.error('Error bench ip: ' + childIp.value)
          ElMessage.error('Error bench ip: ' + childIp.value)
        }
      }
  
      async function sleep (ms) {
        await new Promise(resolve => setTimeout(resolve, ms))
        return true
      }
  
      const handleUpdateIp = async newIp => {
        await sleep(1500)
        service_list = []
        serviceOptions.value = []
        childIp.value = newIp
        window.bench_now_ip = childIp.value
  
        await getSrvList()
        console.log('childIp.value: ' + childIp.value)
      }
      function getRPCOptionsForService (data, serviceValue) {
        // 根据不同的服务值返回对应的RPC选项列表
        // 这里返回一个示例选项列表，你需要根据实际情况进行修改
        let options = []
        let i = 0
  
        for (let item of data['RPC']) {
          i++
          options.push({
            value: item,
            label: item
          })
        }
        return options
      }
  
      const handleServiceChange = async () => {
        let selectedServiceName = selectServiceNow.value
        try {
          let RPC = ref(document.getElementById('RPC'))
          const data = await fetchServiceInfo(selectedServiceName)
          window.data = data
          RPC.value.innerHTML = ''
          // 更新RPC选项列表
          rpcOptions.value = getRPCOptionsForService(data, selectedServiceName)
          rpcOptions.value.forEach(option => {
            let optionElement = document.createElement('option')
            optionElement.value = option.value
            optionElement.textContent = option.label
            optionElement.selected = false
            RPC.value.appendChild(optionElement)
          })
          RPC.value.selectedIndex = -1
        } catch (error) {
          console.error('Error fetching service info:', error)
        }
        fetchModeInfo(selectedServiceName)
      }
      async function fetchServiceInfo (serviceName) {
        const url = `http://${childIp.value}:16000/api/serviceinfo?servicename=${serviceName}`
        const response = await axios.get(url)
        return response.data
      }
      const rpcElement = ref(null) // 初始化为 null
  
      const store = useStore()
      const ModeInfo = computed(() => store.state.ModeInfo)
      const ModeList = computed(() => store.state.ModeList)
      const setModeInfo = value => store.commit('setModeInfo', value)
      const setModeList = value => store.commit('setModeList', value)
      function fetchModeInfo (serviceName) {
        let tempdict = ModeInfo.value
        tempdict[serviceName] = ['Hello:' + serviceName, 'Hi:' + serviceName]
        setModeInfo(tempdict)
        setModeList(tempdict[serviceName])
      }
  
      return {
        selectedService,
        serviceOptions,
        serviceInfo,
        getSrvList,
        handleUpdateIp,
        handleServiceChange,
        temp,
        sleep,
        rpcElement,
        fetchModeInfo,
        ModeInfo,
        ModeList,
        selectServiceNow
      }
    }
  }
  </script>
  
<template>
  <div>
    <div class="container col-sm-10" style="width: 70%; margin-left: 0">
      <div class="col text-center">
        <h2 class="debate-topic">Soa Test</h2>
      </div>
      <form>
        <div class="card" style="margin-top: 40px">
          <div class="card-body">
            <h5 class="card-title"></h5>
            <div class="form-group row" style="margin-top: 20px">
              <div class="form-group row col-sm-8" style="margin-top: 20px">
                <SelectService class="col-sm-12" />

                <label
                  for="inputState"
                  class="col-sm-3 col-form-label"
                  style="margin-top: 20px"
                  >Instance</label
                >
                <div class="col-sm-9">
                  <!-- <input
                    class="form-control"
                    style="margin-top: 20px"
                    id="instance"
                    placeholder="如果服务需要实例名，请先填写实例名再选RPC"
                  /> -->
                  <el-input v-model="instanceInput" id="instance" style="margin-top: 20px" placeholder="如果服务需要实例名，请先填写实例名再选RPC" clearable />
                </div>
                <label
                  for="inputState"
                  class="col-sm-3 col-form-label"
                  style="margin-top: 20px"
                  >RPC</label
                >
                <div class="col-sm-9" style="margin-top: 20px">
                  <select id="RPC" class="form-control custom-select"></select>
                </div>
              </div>
              <div class="col-sm-4"><SatSavButton /></div>
            </div>
          </div>
        </div>
      </form>
      <CardBody />
      <Generate />
    </div>
    <!-- <div class="container col-sm-5" style="width: 40%; margin-left: 0; margin-top: 100px"><MutilSelect></MutilSelect></div> -->
  </div>
</template>
<style>
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
.debate-topic {
  animation: coolAnimation 5s infinite alternate;
}
h2:hover {
  font-size: 30px; /* 鼠标悬停时的字体大小 */
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
</style>

<script lang="ts">
import useKeepScroll from '@/hooks/useKeepScroll'
// import 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.1/jquery.min.js'
// import '../../../js/bootstrap.min.js'
import '../../../css/bootstrap.css'
// import 'https://code.jquery.com/jquery-3.5.1.slim.min.js'
// // import 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js'
// import 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js'
// // import 'https://unpkg.com/vue@3.2.20/dist/vue.global.min.js'
// import 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../../css/styles.css'
import '../../../css/cardbody.css'
import SatSavButton from './StartSaveButton.vue'
import SelectService from './SelectService.vue'
import Generate from './GenerateButton.vue'
import CardBody from './CardBody.vue'
// import MutilSelect from './MutilSelect.vue'
import {
  ref,
  watchEffect,
  onMounted,
  watch,
  onBeforeMount,
  provide,
  computed
} from 'vue'
export default {
  name: 'SoaTest',
  components: {
    SatSavButton,
    SelectService,
    Generate,
    CardBody,
    // MutilSelect,
  },
  setup(props, { attrs, emit }) {
    // 在setup函数中使用useKeepScroll
    var instanceInput = ref('')
    useKeepScroll()
    const importExternalScript = async (url) => {
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  });
};
    function addIntelligentCustomer(
      originEnv: string,
      region: string,
      systemCode: string
    ) {
      const intelligentCustomerServiceScript = document.createElement('script')
      const envSuffix = originEnv === 'prod' ? '' : `-${originEnv}`
      intelligentCustomerServiceScript.setAttribute(
        'src',
        `https://page-gateway${envSuffix}.nioint.com/intelligentCustomerService`
      )
      document.head.appendChild(intelligentCustomerServiceScript)
      intelligentCustomerServiceScript.onload = () => {
        ;(window as any).__INTELLIGENT_CUSTOMER_SERVICE.initByConfig({
          env: originEnv,
          region: 'cn',
          systemCode: systemCode,
          businessName: 'NioBot客服'
        })
      }
    }
    onMounted(async () => {
        await importExternalScript('https://cdn.bootcdn.net/ajax/libs/jquery/3.6.1/jquery.min.js');
  await importExternalScript('https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js');
  await importExternalScript('https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js');
  await importExternalScript('https://code.jquery.com/jquery-3.5.1.slim.min.js');
  await importExternalScript('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
      addIntelligentCustomer('stg', 'cn', 'niobot')
    })

    // 返回你的组件需要的任何数据或方法
    return {
      // 返回的数据和方法
      instanceInput,
      importExternalScript
    }
  }
}
</script>

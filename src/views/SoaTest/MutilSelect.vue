<template>
  <div>
    <div>
      <h1>上框</h1>
      <el-select
        v-model="selectedOptions"
        multiple
        clearable
        placeholder="请选择选项"
        style="width: 300px"
      >
        <el-option
          v-for="option in ModeList"
          :key="option"
          :label="option"
          :value="option"
        ></el-option>
      </el-select>
      <el-button @click="moveOptions">传递选项</el-button>
    </div>

    <div>
      <h1>下框</h1>
      <el-select v-model="downOptions" multiple clearable style="width: 300px">
        <el-option
          v-for="option in transferredOptions"
          :key="option"
          :label="option"
          :value="option"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { ref, inject, onBeforeMount, onMounted, computed } from 'vue'
import { ElSelect, ElOption, ElButton } from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import { useStore } from 'vuex'

export default {
  components: {
    ElSelect,
    ElOption,
    ElButton
  },
  setup () {
    const selectedOptions = ref([])
    const transferredOptions = ref([])
    const downOptions = ref([])

    const moveOptions = () => {
      transferredOptions.value = selectedOptions.value.slice()
      downOptions.value = selectedOptions.value.slice()
      selectedOptions.value = []
      console.log(ModeList.value)
    }
    const store = useStore()
    const ModeInfo = computed(() => store.state.ModeInfo)
    const ModeList = computed(() => store.state.ModeList)

    return {
      selectedOptions,
      transferredOptions,
      downOptions,
      moveOptions,
      ModeList,
      ModeInfo
    }
  }
}
</script>

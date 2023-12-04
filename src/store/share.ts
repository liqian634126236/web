import { createStore } from "vuex";
export default createStore({
    state: {
        ModeList: [],
        ModeInfo: {}
    },
    mutations: {
      setModeList(state, newValue) {
        state.ModeList = newValue;
      },
        setModeInfo(state, newValue) {
            state.ModeInfo = newValue;
        },
    },
  });
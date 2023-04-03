import axios from 'axios'
// import { map } from 'core-js/core/array'
import { registerRuntimeCompiler } from 'vue'
import { createStore } from 'vuex'

export default createStore({
  state: {
    counter: 0,
    colorCode: 'blue',
    players : Map
  },
  mutations: {
    decreaseCounter(state, randomNumber){
      state.counter-= randomNumber
    },
    increaseCounter(state, randomNumber){
      state.counter += randomNumber
    },
    setColorCode(state, newValue){
      state.colorCode = newValue
    }
  },
  actions: {
    decreaseCounter({commit}){
      axios('https://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new').then(response => {commit('decreaseCounter',response.data)})
    },
    increaseCounter({commit}){
      axios('https://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new').then(response => {commit('increaseCounter',response.data)})
    },
    setColorCode({commit}, newValue){
      commit('setColorCode')
    }
  },
  getters: {
    counterSquared(state){
      return state.counter * state.counter
    }
  },
  modules: {
  }
})

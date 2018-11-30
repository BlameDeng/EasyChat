import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import { AV } from '@/utils/leancloud.js'
export default new Vuex.Store({
    state: {
        user: null
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        }
    },
    actions: {
        async login({ commit }, data) {
            return await AV.User.logIn(data.username, data.password)
        },
        async signUp({ commit }, data) {
            return await AV.User.signUp(data.username, data.password)
        }
    }
})
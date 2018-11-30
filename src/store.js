import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import { AV, Leancloud } from '@/utils/leancloud.js'
const UserInfo = new Leancloud('UserInfo')


export default new Vuex.Store({
    state: {
        user: null,
        userInfo: null
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        },
        setUserInfo(state, payload) {
            state.userInfo = payload
        }
    },
    actions: {
        async login({ commit }, data) {
            return await AV.User.logIn(data.username, data.password)
        },
        async signUp({ commit }, data) {
            return await AV.User.signUp(data.username, data.password)
        },
        async createUserInfo({ commit }, data) {
            return UserInfo.create(data)
        },
        async getUserInfo({ commit }, data) {
            return await UserInfo.query('uid', data.uid)
        }
    }
})
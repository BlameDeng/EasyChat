import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import { AV, Leancloud } from '@/utils/leancloud.js'
const UserInfo = new Leancloud('UserInfo')

export default new Vuex.Store({
    state: {
        user: null,
        userInfo: null,
        client: null,
        conversations: null,
        currentConversationId: '',
        chatTarget: null
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        },
        setUserInfo(state, payload) {
            state.userInfo = payload
        },
        addFriendInfo(state,payload){
            state.userInfo.friends.push(payload)
        },
        setClient(state, payload) {
            state.client = payload
        },
        setConversations(state, payload) {
            state.conversations = payload
        },
        updateConversation(state, payload) {
            state.conversations = state.conversations || []
            state.conversations.forEach((item, index) => {
                if (item.id === payload.id) {
                    state.conversations.splice(index, 1, payload)
                }
            })
        },
        setCurrentConversationId(state, payload) {
            state.currentConversationId = payload
        },
        setChatTarget(state, payload) {
            state.chatTarget = payload
        }
    },
    actions: {
        async login({ commit }, data) {
            return await AV.User.logIn(data.username, data.password)
        },
        async signUp({ commit }, data) {
            return await AV.User.signUp(data.username, data.password)
        },
        async logout({ commit }) {
            return await AV.User.logOut()
        },
        async createUserInfo({ commit }, data) {
            return UserInfo.create(data)
        },
        async getUserInfo({ commit }, data) {
            return await UserInfo.query('uid', data.uid)
        },
        async updateInfo({ commit }, data) {
            let { nickyname, avatar, id } = data
            return await UserInfo.update({ nickyname, avatar }, id)
        },
        async addFriends({ commit }, data) {
            let { friends, id } = data
            return await UserInfo.update({ friends }, id)
        }
    }
})
<template>
    <div class="contract">
        <div class="nav">
            <div class="title">
                <div class="chat">联系人</div>
                <div class="icon-wrapper" title="发起群聊">
                    <x-icon name="close" class="icon" @click="selectVisible=true"></x-icon>
                </div>
            </div>
            <template v-if="friendsList&&friendsList.length">
                <div class="card" v-for="friend in friendsList" :key="friend.uid" @click="currentUid=friend.uid">
                    <img :src="friend.avatar">
                    <div class="content">
                        <div class="name">
                            <span class="nickyname">{{friend.nickyname}}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="content">
            <div class="friend" v-if="currentFriend">
                <div class="detail">
                    <div class="name">
                        {{currentFriend.nickyname}}
                    </div>
                    <img :src="currentFriend.avatar">
                </div>
                <div class="action">
                    <div class="button" role="button" @click="onSend">发消息</div>
                </div>
            </div>
            <div class="bg" v-else>
                <x-icon name="logo-copy" class="icon"></x-icon>
            </div>
        </div>
        <transition name="fade">
            <div class="mask" v-if="selectVisible"></div>
        </transition>
        <transition name="fade">
            <div class="select" v-if="selectVisible">
                <div class="friends" v-if="friendsList&&friendsList.length">
                    <span>请勾选需要添加的联系人</span>
                    <div class="card" v-for="friend in friendsList" :key="friend.uid" @click="currentUid=friend.uid">
                        <img :src="friend.avatar">
                        <div class="content">
                            <div class="name">
                                <span class="nickyname">{{friend.nickyname}}</span>
                            </div>
                        </div>
                        <div class="check" @click="onCheck(friend.uid)" :class="{checked:selectedUids&&selectedUids.indexOf(friend.uid)>-1}">
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>
                <div class="selected">
                    <x-input placeholder="请输入群聊名称" v-model.trim="name" style="width:90%;margin-left:5px;"></x-input>
                    <br>
                    <span>已添加{{(selectedUids&&selectedUids.length)||0}}位联系人</span>
                    <template v-if="selectedFriends&&selectedFriends.length">
                        <div class="card" v-for="friend in selectedFriends" :key="friend.uid">
                            <img :src="friend.avatar">
                            <div class="content">
                                <div class="name">
                                    <span class="nickyname">{{friend.nickyname}}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class="btns">
                        <div class="button" :class="{disabled:!selectedUids||selectedUids.length<2}" @click="submit">确定</div>
                        <div class="button cancle" @click="selectVisible=false">取消</div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import xInput from '@/components/input/input.vue'
    import { mapState, mapActions, mapMutations } from 'vuex'
    export default {
        name: 'Contract',
        components: { xIcon, xInput },
        data() {
            return {
                currentUid: '',
                selectVisible: false,
                selectedUids: null,
                name: ''
            }
        },
        computed: {
            ...mapState({
                userInfo: state => state.userInfo,
                friendsList: state => state.friendsList,
                conversations: state => state.conversations,
                client: state => state.client
            }),
            ids() {
                if (!this.userInfo) {
                    return null
                } else {
                    return this.userInfo.friends
                }
            },
            currentFriend() {
                if (!this.currentUid || !this.friendsList || !this.friendsList.length) {
                    return null
                } else {
                    return this.friendsList.find(friend => friend.uid === this.currentUid)
                }
            },
            selectedFriends() {
                if (!this.selectedUids || !this.selectedUids.length || !this.friendsList || !this.friendsList.length) {
                    return null
                } else {
                    let list = []
                    this.friendsList.forEach(friend => {
                        if (this.selectedUids.indexOf(friend.uid) > -1) {
                            list.push(friend)
                        }
                    })
                    return list
                }
            }
        },
        watch: {
            selectVisible(val) {
                if (!val) {
                    this.name = ''
                }
            }
        },
        mounted() {
            this.getFriendsList({ ids: this.ids })
                .then(res => {
                    let list = []
                    res.forEach(info => {
                        let { nickyname, avatar, uid } = info[0].attributes
                        list.push({ nickyname, avatar, uid })
                    })
                    this.setFriendsList(list)
                })
        },
        methods: {
            ...mapMutations(['setFriendsList', 'setCurrentConversationId', 'setChatTarget', 'addConversation']),
            ...mapActions(['getFriendsList']),
            async onSend() {
                //找到对应的会话（单聊）
                if (!this.conversations || !this.conversations.length) {
                    await this.createConversation()
                    this.$router.push('/user/conversation')
                    return
                }
                let id = ''
                this.conversations.forEach(con => {
                    let ids = con.members
                    if (ids.length !== 2) { return }
                    if (ids.indexOf(this.currentUid) > -1) {
                        id = con.id
                    }
                })
                if (id) {
                    this.setChatTarget(this.currentFriend)
                    this.setCurrentConversationId(id)
                    this.$router.push('/user/conversation')
                } else {
                    await this.createConversation()
                    this.$router.push('/user/conversation')
                    return
                }
            },
            async createConversation() {
                let single = await this.client.createConversation({
                    members: [this.currentUid],
                    name: '',
                    unique: true
                })
                if (!this.conversations.find(con => con.id === single.id)) {
                    this.addConversation(single)
                }
                this.setChatTarget(this.currentFriend)
                this.setCurrentConversationId(single.id)
            },
            onCheck(uid) {
                this.selectedUids = this.selectedUids || []
                let index = this.selectedUids.indexOf(uid)
                if (index === -1) {
                    this.selectedUids.push(uid)
                } else {
                    this.selectedUids.splice(index, 1)
                }
            },
            async submit() {
                if (!this.selectedUids || this.selectedUids.length < 2) { return }
                let name = this.name
                if (!name) {
                    name = this.selectedFriends.reduce((prev, current) => {
                        return prev + current.nickyname + '、'
                    }, '')
                    name = name.substring(0, name.length - 1)
                }
                let multiple = await this.client.createConversation({
                    members: this.selectedUids,
                    name: name,
                    unique: true
                })
                if (!this.conversations.find(con => con.id === multiple.id)) {
                    this.addConversation(multiple)
                }
            }
        }
    }
</script>
<style scoped lang="scss">
    $p:#4587f0;
    $hover:#72abfc;
    .contract {
        height: 100%;
        flex-grow: 1;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
        >.nav {
            width: 260px;
            height: 100%;
            background: rgb(245, 245, 245);
            flex-shrink: 0;
            >.title {
                width: 255px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                >.chat {
                    font-size: 16px;
                    cursor: default;
                    user-select: none;
                }
                >.icon-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 5px;
                    background: rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    border-radius: 2px;
                    >.icon {
                        width: 16px;
                        height: 16px;
                        transform: rotateZ(-45deg);
                        color: rgba(0, 0, 0, 0.45);
                    }
                    &:hover {
                        background: rgba(0, 0, 0, 0.1);
                        >.icon {
                            color: rgba(0, 0, 0, 0.65);
                        }
                    }
                }
            }
            >.card {
                height: 60px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                cursor: pointer;
                padding: 0 10px;
                position: relative;
                &:hover {
                    background-color: rgba(0, 0, 0, 0.08);
                }
                &.selected {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                >img {
                    width: 44px;
                    height: 44px;
                    border-radius: 2px;
                    margin-right: 10px;
                }
                >.content {
                    >.name {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        >.nickyname {
                            display: block;
                            width: 142px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-size: 16px;
                            color: rgba(0, 0, 0, 0.85);
                        }
                    }
                }
            }
        }
        >.content {
            flex-grow: 1;
            height: 100%;
            position: relative;
            >.friend {
                width: 300px;
                height: 300px;
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                >.detail {
                    width: 100%;
                    height: 200px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    >.name {
                        width: 210px;
                        word-break: break-all;
                        font-size: 16px;
                        color: rgba(0, 0, 0, 0.85);
                        cursor: default;
                    }
                    >img {
                        width: 80px;
                        height: 80px;
                        border-radius: 2px;
                    }
                }
                >.action {
                    width: 100%;
                    height: 100px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    >.button {
                        cursor: pointer;
                        width: 150px;
                        height: 28px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 2px;
                        background: $p;
                        color: rgba(255, 255, 255, 0.85);
                        user-select: none;
                        &:hover {
                            background: $hover;
                        }
                    }
                }
            }
            >.bg {
                width: 100%;
                height: 100%;
                position: relative;
                background: rgb(250, 250, 250);
                >.icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translateX(-50%) translateY(-50%);
                    width: 60px;
                    height: 60px;
                }
            }
        }
        >.mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.05);
        }
        >.select {
            position: absolute;
            top: 15%;
            left: 280px;
            height: 70%;
            width: 500px;
            background: #fff;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            >.friends {
                width: 50%;
                height: 100%;
                overflow-y: scroll;
                padding: 10px 0;
                >span {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                    cursor: default;
                    user-select: none;
                    padding-left: 5px;
                    padding-bottom: 10px;
                }
                >.card {
                    height: 40px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    cursor: pointer;
                    padding: 0 5px;
                    position: relative;
                    &:hover {
                        background-color: rgba(0, 0, 0, 0.08);
                    }
                    &.selected {
                        background-color: rgba(0, 0, 0, 0.1);
                    }
                    >img {
                        width: 30px;
                        height: 30px;
                        border-radius: 2px;
                        margin-right: 5px;
                    }
                    >.content {
                        >.name {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            >.nickyname {
                                display: block;
                                width: 142px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                font-size: 16px;
                                color: rgba(0, 0, 0, 0.85);
                            }
                        }
                    }
                    >.check {
                        width: 20px;
                        height: 20px;
                        border: 1px solid rgba(0, 0, 0, 0.15);
                        border-radius: 50%;
                        >.dot {
                            width: 13px;
                            height: 7px;
                            border: 1px solid;
                            border-top-color: transparent;
                            border-right-color: transparent;
                            border-bottom-color: transparent;
                            border-left-color: transparent;
                            transform: rotateZ(-45deg) translateY(4px);
                        }
                        &.checked {
                            border-color: $p;
                            background: $p;
                            >.dot {
                                border-bottom-color: #fff;
                                border-left-color: #fff;
                            }
                        }
                    }
                }
            }
            >.selected {
                width: 50%;
                height: 100%;
                overflow-y: scroll;
                padding: 10px 0;
                position: relative;
                >span {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                    cursor: default;
                    user-select: none;
                    padding-left: 5px;
                    padding-bottom: 10px;
                }
                >.card {
                    height: 40px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    cursor: pointer;
                    padding: 0 5px;
                    position: relative;
                    &:hover {
                        background-color: rgba(0, 0, 0, 0.08);
                    }
                    &.selected {
                        background-color: rgba(0, 0, 0, 0.1);
                    }
                    >img {
                        width: 30px;
                        height: 30px;
                        border-radius: 2px;
                        margin-right: 5px;
                    }
                    >.content {
                        >.name {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            >.nickyname {
                                display: block;
                                width: 142px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                font-size: 16px;
                                color: rgba(0, 0, 0, 0.85);
                            }
                        }
                    }
                }
                >.btns {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    padding-bottom: 10px;
                    padding-right: 5px;
                    >.button {
                        cursor: pointer;
                        width: 70px;
                        height: 28px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 2px;
                        background: $p;
                        color: rgba(255, 255, 255, 0.85);
                        user-select: none;
                        &:hover {
                            background: $hover;
                        }
                        &.cancle {
                            background: #fff;
                            border: 1px solid rgba(0, 0, 0, 0.15);
                            border-radius: 2px;
                            color: rgba(0, 0, 0, 0.45);
                            margin-left: 5px;
                            &:hover {
                                background: rgba(0, 0, 0, 0.05);
                            }
                        }
                        &.disabled {
                            background: #c4e1ff;
                            &:hover {
                                background: #c4e1ff;
                            }
                        }
                    }
                }
            }
        }
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s linear;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
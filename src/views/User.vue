<template>
    <div class="user">
        <main>
            <ul class="sider">
                <li class="user-info" ref="user">
                    <img v-if="userInfo&&userInfo.avatar" :src="userInfo.avatar" @click="dialogVisible=true">
                    <!-- <transition name="fade">
                        <div class="profile" ref="profile" v-show="profileVisible">
                            <div class="info">
                                <div class="name" v-if="user||userInfo">{{(userInfo&&userInfo.nickyname)||(user&&user.username)}}</div>
                                <img v-if="userInfo&&userInfo.avatar" :src="userInfo.avatar">
                            </div>
                            <div class="action">
                                <x-icon name="menu" class="icon" title="设置" @click="onSetting"></x-icon>
                            </div>
                        </div>
                    </transition> -->
                </li>
                <li class="conversation">
                    <x-icon name="conversation" class="icon" :class="{active:currentTab==='conversation'}" @click="currentTab='conversation'"></x-icon>
                </li>
                <li class="contract">
                    <x-icon name="contract" class="icon" :class="{active:currentTab==='contract'}" @click="currentTab='contract'"></x-icon>
                </li>
                <li class="setting">
                    <x-icon name="menu" class="icon" @click="optionsVisible=true"></x-icon>
                </li>
                <transition name="fade">
                    <li class="options" v-show="optionsVisible">
                        <div @click="dialogVisible=true">修改资料</div>
                        <div @click="onLogout">退出登录</div>
                    </li>
                </transition>
            </ul>
            <div class="nav">
                <!-- <button @click="xxx">xxx</button>
                <button @click="yyy">yyy</button>
                <button @click="send">send</button> -->
                <e-nav></e-nav>
            </div>
            <div class="content">
                <e-conversation></e-conversation>
            </div>
        </main>
        <transition name="fade">
            <div class="dialog" v-if="dialogVisible">
                <div class="form">
                    <x-icon name="close" class="close" @click="dialogVisible=false"></x-icon>
                    <div class="avatar" id="avatar">
                        <span>头像：</span>
                        <img v-if="userInfo&&userInfo.avatar" :src="avatar||userInfo.avatar">
                        <div class="button" role="button" id="button">上传新头像</div>
                        <x-upload container-id="avatar" browse-id="button" bucket-name="chatavatar" :unique="user.username" @uploaded="uploaded($event)"></x-upload>
                    </div>
                    <div class="nickyname">
                        <span>昵称：</span>
                        <x-input class="input" v-model.trim="nickyname"></x-input>
                    </div>
                    <div class="button" role="button" @click="onSaveInfo">保&nbsp;存</div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import xUpload from '@/components/upload/upload.vue'
    import xIcon from '@/components/icon/icon.vue'
    import xInput from '@/components/input/input.vue'
    import eNav from '@/components/nav/nav.vue'
    import eConversation from '@/components/conversation.vue'
    import { mapMutations, mapState, mapActions } from 'vuex'
    import realtime from '@/utils/realtime.js'
    import { TextMessage, Event } from 'leancloud-realtime'
    export default {
        name: 'User',
        mixins: [],
        inject: ['eventBus'],
        components: { xUpload, xIcon, xInput, eNav, eConversation },
        props: {},
        data() {
            return {
                profileVisible: false,
                dialogVisible: false,
                optionsVisible: false,
                currentTab: 'conversation',
                nickyname: '',
                avatar: ''
            }
        },
        computed: {
            ...mapState({
                user: state => state.user,
                userInfo: state => state.userInfo,
                client: state => state.client
            })
        },
        watch: {
            profileVisible(val) {
                if (val) {
                    document.addEventListener('click', this.listenDocument)
                } else {
                    document.removeEventListener('click', this.listenDocument)
                }
            },
            dialogVisible(val) {
                if (val) {
                    this.nickyname = this.userInfo.nickyname
                    this.avatar = this.userInfo.avatar
                }
            },
            optionsVisible(val) {
                if (val) {
                    document.addEventListener('click', this.handleOptionsVisible)
                } else {
                    document.removeEventListener('click', this.handleOptionsVisible)
                }
            }
        },
        created() {
            this.getUserInfo({ uid: this.user.id })
                .then(res => {
                    if (res.length) {
                        let info = { id: res[0].id, ...res[0].attributes }
                        this.setUserInfo(info)
                    } else {
                        this.createUserInfo({
                            uid: this.user.id,
                            nickyname: this.user.username,
                            avatar: 'https://chatavatar.oss-cn-hangzhou.aliyuncs.com/avatar.png?x-oss-process=style/avatar',
                            friends: [],
                            groups: [],
                            rooms: []
                        }).then(res => {
                            let info = { id: res.id, ...res.attributes }
                            this.setUserInfo(info)
                        })
                    }
                })
        },
        async mounted() {
            await realtime.createIMClient(this.user.id)
                .then(res => {
                    this.setClient(res)
                    this.eventBus.$emit('client-ready')
                    this.client.on(Event.MESSAGE, function(message, conversation) {
                        console.log(message)
                        console.log(conversation)
                    })
                })
            //获取用户的对话
            this.client.getQuery().limit(50).containsMembers([this.user.id]).find().then(conversations => {
                if (conversations.length) {
                    conversations.forEach(item => {
                        item.lastMessage = item.lastMessage ? item.lastMessage.toJSON() : undefined
                    })
                    this.setConversations(conversations)
                }
            })
        },
        beforeDestroy() {
            document.removeEventListener('click', this.listenDocument)
            document.removeEventListener('click', this.handleOptionsVisible)
        },
        methods: {
            ...mapMutations(['setUser', 'setUserInfo', 'setConversations', 'setClient']),
            ...mapActions(['createUserInfo', 'getUserInfo', 'updateInfo', 'logout']),
            xxx() {

            },
            yyy() {
                this.client && this.client.close()
            },
            async send() {
                let cc = await this.client.createConversation({
                    members: ['5c0233a49f545400675ee3d5'],
                    name: 'to Jerry',
                    unique: true
                })
                cc.send(new TextMessage('耗子，起床！')).then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })
            },
            onClickAvatar(e) {
                this.profileVisible = true
                let { offsetX, offsetY } = e
                this.$refs.profile.style.top = offsetY + 'px'
                this.$refs.profile.style.left = offsetX + 'px'
            },
            listenDocument(e) {
                if (!this.$refs.user.contains(e.target)) {
                    this.profileVisible = false
                }
            },
            handleOptionsVisible() {
                this.optionsVisible = false
            },
            onSetting() {
                this.profileVisible = false
                this.dialogVisible = true
            },
            onSaveInfo() {
                if (this.nickyname === this.userInfo.nickyname && this.avatar === this.userInfo.avatar) {
                    this.dialogVisible = false
                    return
                }
                this.updateInfo({ nickyname: this.nickyname, avatar: this.avatar, id: this.userInfo.id }).then(res => {
                    let info = Object.assign({}, this.userInfo, res.attributes)
                    this.setUserInfo(info)
                    this.dialogVisible = false
                })
            },
            uploaded(obj) {
                this.avatar = obj.url + '?x-oss-process=style/avatar'
            },
            onLogout() {
                this.logout()
                    .then(res => {
                        this.setUser(null)
                        this.setUserInfo(null)
                        localStorage.removeItem('username')
                        this.$router.push('/')
                    })
            }
        }
    }
</script>
<style scoped lang="scss">
    $p:#4587f0;
    $hover:#72abfc;
    .user {
        width: 100%;
        height: 100%;
        >main {
            width: 80%;
            max-width: 1000px;
            height: 80%;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-radius: 2px;
            margin: 0 auto;
            transform: translateY(12.5%);
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            >.sider {
                width: 60px;
                height: 100%;
                background: rgb(40, 40, 40);
                border-top-left-radius: 2px;
                border-bottom-left-radius: 2px;
                padding-top: 20px;
                position: relative;
                flex-shrink: 0;
                >li {
                    width: 40px;
                    height: 40px;
                    margin: 20px auto;
                    &.user-info {
                        position: relative;
                        margin-bottom: 40px;
                        >img {
                            width: 40px;
                            height: 40px;
                            border-radius: 2px;
                            cursor: pointer;
                        }
                        >.profile {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 220px;
                            height: 180px;
                            background: #fff;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            border-radius: 2px;
                            padding: 0 20px;
                            >.info {
                                width: 100%;
                                height: 120px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                border-bottom: 1px solid rgba(0, 0, 0, 0.15);
                                >.name {
                                    width: 100px;
                                    cursor: default;
                                    font-size: 18px;
                                }
                                >img {
                                    width: 80px;
                                    height: 80px;
                                    border-radius: 2px;
                                }
                            }
                            >.action {
                                width: 100%;
                                height: 60px;
                                display: flex;
                                justify-content: flex-end;
                                align-items: center;
                                >.icon {
                                    width: 30px;
                                    height: 30px;
                                    cursor: pointer;
                                    color: rgba(0, 0, 0, 0.45);
                                    &:hover {
                                        color: rgba(0, 0, 0, 0.55);
                                    }
                                    &:not(:last-child) {
                                        margin-right: 10px;
                                    }
                                }
                            }
                        }
                    }
                    >.icon {
                        width: 38px;
                        height: 38px;
                        color: rgba(255, 255, 255, 0.85);
                        cursor: pointer;
                        &.active {
                            color: $p;
                        }
                    }
                    &.setting {
                        position: absolute;
                        left: 10px;
                        bottom: 0;
                    }
                    &.options {
                        width: 100px;
                        height: 70px;
                        margin: 0;
                        position: absolute;
                        left: 100%;
                        bottom: 20px;
                        background: rgba(0, 0, 0, 0.45);
                        border-top-right-radius: 2px;
                        border-bottom-right-radius: 2px;
                        >div {
                            width: 100%;
                            height: 35px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            color: rgba(255, 255, 255, 0.65);
                            &:hover {
                                background: rgba(0, 0, 0, 0.05);
                            }
                        }
                    }
                }
            }
            >.nav {
                width: 260px;
                height: 100%;
                background: rgb(245, 245, 245);
                flex-shrink: 0;
            }
            >.content {
                flex-grow: 1;
                height: 100%;
            }
        }
        >.dialog {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.05);
            >.form {
                position: fixed;
                top: 45%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                width: 280px;
                height: 280px;
                background: #fff;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: stretch;
                >.close {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 18px;
                    height: 18px;
                    color: rgba(0, 0, 0, 0.45);
                    cursor: pointer;
                    &:hover {
                        color: rgba(0, 0, 0, 0.55);
                    }
                }
                >.avatar {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-end;
                    padding: 10px;
                    >span {
                        display: inline-flex;
                        width: 45px;
                        flex-shrink: 0;
                    }
                    >img {
                        width: 80px;
                        height: 80px;
                        margin: 0 10px;
                        border-radius: 2px;
                    }
                    >.button {
                        cursor: pointer;
                        width: 75px;
                        height: 24px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 2px;
                        border: 1px solid rgba(0, 0, 0, 0.15);
                        color: rgba(0, 0, 0, 0.45);
                        user-select: none;
                        font-size: 12px
                    }
                }
                >.nickyname {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 10px;
                    margin: 20px 0;
                    >span {
                        display: inline-flex;
                        width: 45px;
                        flex-shrink: 0;
                    }
                }
                >.button {
                    padding: 10px;
                    margin: 0 auto;
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
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s linear;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
<template>
    <div class="e-dialog">
        <div class="title">
            <span v-if="currentCoversation&&currentCoversation.members.length!==2">{{currentCoversation.name}}</span>
            <span v-if="chatTarget&&currentCoversation&&currentCoversation.members.length===2">{{chatTarget.nickyname}}</span>
            <div class="dot" v-if="currentCoversation&&currentCoversation.members.length!==2">
                <x-icon name="dian" class="icon" @click="membersVisible=true"></x-icon>
            </div>
        </div>
        <template v-if="members&&members.length">
            <transition name="fade">
                <div class="mask" v-show="membersVisible">
                    <div class="wrapper">
                        <div class="title">
                            成员列表
                            <x-icon name="close" class="icon" @click="membersVisible=false"></x-icon>
                        </div>
                        <ul class="members">
                            <li v-for="member in members" :key="member.uid">
                                <img :src="member.avatar"><span class="name">{{member.nickyname}}</span><span class="button" role="button" :class="{disabled:userInfo.friends.indexOf(member.uid)>-1||member.uid===userInfo.uid}" @click="onAdd(member.uid)">添加好友</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
        </template>
        <ul class="conversation" ref="ul">
            <template v-if="messages&&messages.length&&chatTarget">
                <li v-for="text in messages" :key="text.id">
                    <div class="time">{{formatTime(text._timestamp).con}}</div>
                    <div class="from" v-if="text.from!==user.id">
                        <img :src="getAvatar(text.from)" v-if="members&&members.length">
                        <img :src="chatTarget.avatar" v-else>
                        <div class="content">
                            <div class="nickyname" v-if="currentCoversation.members.length!==2&&members">{{getNickyname(text.from)&&getNickyname(text.from).nickyname}}</div>
                            <div class="msg">
                                {{text.text}}
                            </div>
                        </div>
                    </div>
                    <div class="to" v-else>
                        <div class="content">
                            <div class="msg">
                                {{text.text}}
                            </div>
                        </div>
                        <img :src="userInfo.avatar">
                    </div>
                </li>
            </template>
        </ul>
        <div class="input">
            <textarea v-model="msg"></textarea>
            <div class="button" role="button" @click="send">发送</div>
        </div>
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import { mapState, mapActions, mapMutations } from 'vuex'
    import { TextMessage, Event } from 'leancloud-realtime'
    import formatTime from '@/utils/formatTime.js'
    export default {
        name: 'eDialog',
        inject: ['eventBus'],
        components: { xIcon },
        data() {
            return {
                formatTime,
                msg: '',
                messages: null,
                members: null,
                getting: false,
                membersVisible: false,
                add: false
            }
        },
        computed: {
            ...mapState({
                userInfo: state => state.userInfo,
                user: state => state.user,
                currentId: state => state.currentConversationId,
                conversations: state => state.conversations,
                chatTarget: state => state.chatTarget,
                client: state => state.client,
                friendsList: state => state.friendsList
            }),
            currentCoversation() {
                if (!this.currentId || !this.conversations) {
                    return null
                }
                return this.conversations.find(item => item.id === this.currentId)
            }
        },
        watch: {
            currentId: {
                handler(val) {
                    if (val) {
                        this.currentCoversation.queryMessages({ limit: 20 })
                            .then((messages) => {
                                this.$set(this, 'messages', messages)
                            })
                    }
                },
                immediate: true
            },
            messages: {
                handler(val) {
                    this.scrollBottom()
                },
                deep: true,
                immediate: true
            },
            currentCoversation: {
                handler(val, oldVal) {
                    if (val && val.members.length !== 2) {
                        if (!oldVal || val.id !== oldVal.id) {
                            this.currentCoversation.on(Event.MEMBERS_JOINED, this.membersjoinedEventHandler)
                        }
                    }
                    //多人
                    if (this.getting) { return }
                    if (val && val.members.length !== 2 && !this.members) {
                        this.getting = true
                        this.getFriendsList({ ids: val.members })
                            .then(res => {
                                this.getting = false
                                let list = []
                                res.forEach(info => {
                                    let { nickyname, avatar, uid } = info[0].attributes
                                    list.push({ nickyname, avatar, uid })
                                })
                                this.members = list
                            })
                    }
                },
                deep: true,
                immediate: true
            }
        },
        created() {
            this.eventBus.$on('new-message', this.handleEventBus)
        },
        beforeDestroy() {
            this.eventBus.$off('new-message', this.handleEventBus)
        },
        methods: {
            ...mapMutations(['addFriendInfo']),
            ...mapActions(['getFriendsList', 'addFriends']),
            membersjoinedEventHandler(payload) {
                //payload.members 新加入成员的id数组
                this.getFriendsList({ ids: payload.members })
                    .then(res => {
                        res.forEach(info => {
                            let { nickyname, avatar, uid } = info[0].attributes
                            this.members = this.members || []
                            this.members.push({ nickyname, avatar, uid })
                        })
                    })
            },
            scrollBottom() {
                this.$nextTick(() => {
                    this.$refs.ul.scrollTop = this.$refs.ul.scrollHeight
                })
            },
            handleEventBus(message, conversation) {
                if (conversation.id === this.currentId) {
                    this.messages.push(message)
                }
            },
            async send() {
                if (!this.msg) { return }
                this.currentCoversation.send(new TextMessage(this.msg)).then(res => {
                    this.msg = ''
                    this.messages.push(res)
                }).catch(err => {
                    console.log(err)
                })
            },
            getNickyname(uid) {
                return this.members.find(item => item.uid === uid)
            },
            onAdd(uid) {
                if (this.add) { return }
                this.add = true
                let friends = JSON.parse(JSON.stringify(this.userInfo.friends))
                if (friends.indexOf(uid) > -1 || uid === this.userInfo.uid) {
                    this.add = false
                    return
                }
                friends.push(uid)
                this.addFriends({ friends, id: this.userInfo.id })
                    .then(res => {
                        this.addFriendInfo(uid)
                        this.add = false
                    })
            },
            getAvatar(uid){
                let member=this.members.find(item=>item.uid===uid)
                return member.avatar
            }
        }
    }
</script>
<style scoped lang="scss">
    $p:#4587f0;
    $hover:#72abfc;
    .e-dialog {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        >.title {
            height: 56px;
            padding-left: 20px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-shrink: 0;
            position: relative;
            >span {
                font-size: 16px;
                color: rgba(0, 0, 0, 0.85);
            }
            >.dot {
                position: absolute;
                top: 8px;
                right: 10px;
                width: 40px;
                height: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                >.icon {
                    width: 26px;
                    height: 26px;
                    cursor: pointer;
                    color: rgba(0, 0, 0, 0.45);
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
            z-index: 25;
            >.wrapper {
                position: fixed;
                top: 40%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                width: 350px;
                height: 450px;
                background: #fff;
                border-radius: 2px;
                box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
                position: relative;
                >.title {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                    text-align: center;
                    position: relative;
                    padding: 10px;
                    cursor: default;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    >.icon {
                        position: absolute;
                        top: 40%;
                        right: 5px;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                        color: rgba(0, 0, 0, 0.45);
                    }
                }
                >.members {
                    width: 100%;
                    height: 100%;
                    overflow-y: scroll;
                    >li {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        position: relative;
                        padding: 8px 5px;
                        >img {
                            width: 30px;
                            height: 30px;
                            border-radius: 2px;
                            margin-right: 5px;
                            flex-shrink: 0;
                        }
                        >.name {
                            font-size: 14px;
                            color: rgba(0, 0, 0, 0.65);
                            display: block;
                            width: 180px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            cursor: default;
                        }
                        >.button {
                            flex-shrink: 0;
                            position: absolute;
                            top: 50%;
                            right: 10px;
                            transform: translateY(-50%);
                            cursor: pointer;
                            width: 80px;
                            height: 24px;
                            display: inline-flex;
                            justify-content: center;
                            align-items: center;
                            border-radius: 2px;
                            background: $p;
                            color: rgba(255, 255, 255, 0.85);
                            user-select: none;
                            &:hover {
                                background: $hover;
                            }
                            &.disabled {
                                background: rgba(0, 0, 0, 0.15);
                                color: rgba(0, 0, 0, 0.45);
                                &:hover {
                                    background: rgba(0, 0, 0, 0.15);
                                }
                            }
                        }
                    }
                }
            }
        }
        >.conversation {
            flex-grow: 1;
            background: rgb(250, 250, 250);
            padding: 10px 20px;
            overflow-y: scroll;
            >li {
                max-width: 100%;
                padding: 5px 0;
                padding-top: 30px;
                margin-bottom: 10px;
                position: relative;
                >.time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.65);
                    background: rgba(0, 0, 0, 0.25);
                    display: inline-flex;
                    padding: 0 8px;
                    border-radius: 2px;
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                }
                >.from {
                    max-width: 60%;
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    >img {
                        width: 36px;
                        height: 36px;
                        border-radius: 4px;
                        margin-right: 10px;
                    }
                    >.content {
                        >.nickyname {
                            font-size: 12px;
                            color: rgba(0, 0, 0, 0.45);
                        }
                        >.msg {
                            word-break: break-all;
                            position: relative;
                            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                            padding: .5em;
                        }
                    }
                }
                >.to {
                    max-width: 60%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: flex-start;
                    margin-left: auto;
                    >img {
                        width: 36px;
                        height: 36px;
                        border-radius: 4px;
                        margin-left: 10px;
                    }
                    >.content {
                        >.nickyname {
                            font-size: 12px;
                            color: rgba(0, 0, 0, 0.45);
                        }
                        >.msg {
                            word-break: break-all;
                            position: relative;
                            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                            padding: .5em;
                        }
                    }
                }
            }
        }
        >.input {
            width: 100%;
            height: 150px;
            box-shadow: 0 4px 8px -4px rgba(0, 0, 0, 0.15);
            position: relative;
            >textarea {
                width: 100%;
                height: 100%;
                padding: 10px;
                resize: none;
                border: none;
                color: rgba(0, 0, 0, 0.65);
                &:focus {
                    outline: none;
                }
            }
            >.button {
                position: absolute;
                right: 10px;
                bottom: 10px;
                width: 70px;
                height: 26px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px solid rgba(0, 0, 0, 0.15);
                border-radius: 2px;
                cursor: pointer;
                background-color: #fff;
                color: rgba(0, 0, 0, 0.65);
                user-select: none;
                &:hover {
                    color: #fff;
                    background-color: $p;
                    border-color: $p;
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
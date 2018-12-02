<template>
    <div class="card" @click="onClick" :class="{selected:conversation.id===currentId}">
        <template v-if="target">
            <img :src="target.avatar" @click="onAvatar" ref="img">
            <div class="content">
                <div class="name">
                    <span class="nickyname">{{target.nickyname}}</span>
                </div>
                <div class="msg">
                    最近会话：{{conversation._lastMessageAt&&formatTime(conversation._lastMessageAt).stamp}}
                </div>
            </div>
            <transition name="fade">
                <div class="profile" ref="profile" v-show="profileVisible">
                    <div class="info" v-if="target">
                        <div class="name">{{target.nickyname}}</div>
                        <img :src="target.avatar">
                    </div>
                    <div class="action">
                        <x-icon name="addto" class="icon" title="添加好友" @click.stop="onAdd"></x-icon>
                    </div>
                </div>
            </transition>
        </template>
        <div class="dot" v-show="unread"></div>
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import { mapState, mapMutations, mapActions } from 'vuex'
    import { TextMessage, Event } from 'leancloud-realtime'
    import formatTime from '@/utils/formatTime.js'
    export default {
        name: 'Card',
        mixins: [],
        inject: ['eventBus'],
        components: { xIcon },
        props: {
            conversation: Object
        },
        data() {
            return {
                formatTime,
                target: null,
                unread: false,
                profileVisible: false,
                add: false
            }
        },
        computed: {
            ...mapState({
                user: state => state.user,
                userInfo: state => state.userInfo,
                client: state => state.client,
                currentId: state => state.currentConversationId,
            })
        },
        watch: {
            profileVisible(val) {
                if (val) {
                    document.addEventListener('click', this.handleProfileVisible)
                } else {
                    document.removeEventListener('click', this.handleProfileVisible)
                }
            }
        },
        created() {
            this.eventBus.$on('new-message', this.handleEventBus)
            let targetId = ''
            this.conversation.members.forEach(id => {
                if (id !== this.user.id) {
                    targetId = id
                }
            })
            this.getUserInfo({ uid: targetId })
                .then(res => {
                    this.target = { nickyname: res[0].attributes.nickyname, avatar: res[0].attributes.avatar, uid: res[0].attributes.uid }
                })
        },
        mounted() {

        },
        beforeDestroy() {
            this.eventBus.$off('new-message', this.handleEventBus)
            document.removeEventListener('click', this.handleProfileVisible)
        },
        methods: {
            ...mapMutations(['setCurrentConversationId', 'setChatTarget', 'updateConversation', 'addFriendInfo']),
            ...mapActions(['getUserInfo', 'addFriends']),
            onClick(e) {
                if (e.target === this.$refs.img) {
                    return
                }
                this.unread = false
                this.setCurrentConversationId(this.conversation.id)
                this.setChatTarget(this.target)
            },
            handleEventBus(message, conversation) {
                if (conversation.id === this.conversation.id) {
                    this.unread = true
                    this.updateConversation(conversation)
                }
            },
            onAvatar() {
                this.profileVisible = true
            },
            handleProfileVisible() {
                this.profileVisible = false
            },
            onAdd() {
                this.profileVisible = false
                if (this.add) {
                    return
                }
                this.add = true
                let friends = JSON.parse(JSON.stringify(this.userInfo.friends))
                if (friends.indexOf(this.target.uid) > -1) {
                    this.add = false
                    return
                }
                friends.push(this.target.uid)
                this.addFriends({ friends, id: this.userInfo.id })
                    .then(res => {
                        this.addFriendInfo(this.target.uid)
                        this.add=false
                    })
            }
        }
    }
</script>
<style scoped lang="scss">
    .card {
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
                >.time {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                }
            }
            >.msg {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.45);
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }
        }
        >.profile {
            position: absolute;
            top: 50px;
            left: 20px;
            z-index: 15;
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
        >.dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f5222d;
            position: absolute;
            top: 2px;
            left: 50px;
        }
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s linear;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
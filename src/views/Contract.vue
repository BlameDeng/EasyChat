<template>
    <div class="contract">
        <div class="nav">
            <div class="title">
                <div class="chat">联系人</div>
                <div class="icon-wrapper" title="发起群聊">
                    <x-icon name="close" class="icon"></x-icon>
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
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import { mapState, mapActions, mapMutations } from 'vuex'
    export default {
        name: 'Contract',
        mixins: [],
        components: { xIcon },
        props: {},
        data() {
            return {
                currentUid: ''
            }
        },
        computed: {
            ...mapState({
                userInfo: state => state.userInfo,
                friendsList: state => state.friendsList,
                conversations: state => state.conversations
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
            }
        },
        watch: {},
        created() {},
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
        beforeDestroy() {},
        methods: {
            ...mapMutations(['setFriendsList', 'setCurrentConversationId']),
            ...mapActions(['getFriendsList']),
            onSend() {
                //找到对应的会话（单聊）
                this.conversations.forEach(con => {
                    let ids = con.members
                    let result = true
                    for (let i = 0; i < ids.length; i++) {
                        if (ids[i] !== this.userInfo.uid && ids[i] !== this.currentUid) {
                            result = false
                        }
                    }
                    if (result === true) {
                        this.setCurrentConversationId(con.id)
                    }
                })
                this.$router.push('/user/conversation')
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
    }
</style>
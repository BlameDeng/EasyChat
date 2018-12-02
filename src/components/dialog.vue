<template>
    <div class="e-dialog">
        <div class="title">
            <span v-if="chatTarget">{{chatTarget.nickyname}}</span>
        </div>
        <ul class="conversation" ref="ul">
            <template v-if="messages&&messages.length">
                <li v-for="text in messages" :key="text.id">
                    <div class="time">{{formatTime(text._timestamp).con}}</div>
                    <div class="from" v-if="text.from!==user.id">
                        <img :src="chatTarget.avatar">
                        <div class="content">
                            <!-- <div class="nickyname">{{chatTarget.nickyname}}</div> -->
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
    import { mapState } from 'vuex'
    import { TextMessage, Event } from 'leancloud-realtime'
    import formatTime from '@/utils/formatTime.js'
    export default {
        name: 'eDialog',
        mixins: [],
        inject: ['eventBus'],
        components: {},
        props: {},
        data() {
            return {
                formatTime,
                msg: '',
                messages: null
            }
        },
        computed: {
            ...mapState({
                userInfo: state => state.userInfo,
                user: state => state.user,
                currentId: state => state.currentConversationId,
                conversations: state => state.conversations,
                chatTarget: state => state.chatTarget,
                client: state => state.client
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
            }
        },
        created() {
            this.eventBus.$on('new-message', this.handleEventBus)
        },
        mounted() {

        },
        beforeDestroy() {
            this.eventBus.$off('new-message', this.handleEventBus)
        },
        methods: {
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
                let single = await this.client.createConversation({
                    members: [this.chatTarget.uid],
                    name: 'single',
                    unique: true
                })
                single.send(new TextMessage(this.msg)).then(res => {
                    this.msg = ''
                    this.messages.push(res)
                }).catch(err => {
                    console.log(err)
                })
            },
        }
    }
</script>
<style scoped lang="scss">
    $p:#4587f0;
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
            >span {
                font-size: 16px;
                color: rgba(0, 0, 0, 0.85);
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
</style>
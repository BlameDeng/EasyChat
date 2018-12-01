<template>
    <div class="card" @click="onClick">
        <template v-if="target">
            <img :src="target.avatar">
            <div class="content">
                <div class="name">
                    <span class="nickyname">{{target.nickyname}}</span>
                </div>
                <div class="msg">
                    最近会话：{{formatTime(conversation._updatedAt).stamp}}
                </div>
            </div>
        </template>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import formatTime from '@/utils/formatTime.js'
    export default {
        name: 'Card',
        mixins: [],
        components: {},
        props: {
            conversation: Object
        },
        data() {
            return { formatTime, target: null }
        },
        computed: {
            ...mapState({
                user: state => state.user
            })
        },
        watch: {},
        created() {
            // this.conversation.queryMessages({
            //     limit: 20
            // }).then(msgs => {
            //     console.log(msgs)
            // }).catch(console.error.bind(console))
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
        mounted() {},
        beforeDestroy() {},
        methods: {
            ...mapMutations(['setCurrentConversationId', 'setChatTarget']),
            ...mapActions(['getUserInfo']),
            onClick() {
                this.setCurrentConversationId(this.conversation.id)
                this.setChatTarget(this.target)
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
        &:hover {
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
    }
</style>
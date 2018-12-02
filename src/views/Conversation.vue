<template>
    <div class="conversation">
        <div class="nav">
            <e-nav></e-nav>
        </div>
        <div class="content">
            <e-dialog v-if="currentId"></e-dialog>
            <div class="bg" v-else>
                <x-icon name="logo-copy" class="icon"></x-icon>
            </div>
        </div>
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import eNav from '@/components/nav/nav.vue'
    import eDialog from '@/components/dialog.vue'
    import { mapMutations, mapState, mapActions } from 'vuex'
    import realtime from '@/utils/realtime.js'
    import { TextMessage, Event } from 'leancloud-realtime'
    export default {
        name: 'Conversation',
        mixins: [],
        inject: ['eventBus'],
        components: { xIcon, eNav, eDialog },
        props: {},
        data() {
            return {}
        },
        computed: {
            ...mapState({
                user: state => state.user,
                userInfo: state => state.userInfo,
                client: state => state.client,
                currentId: state => state.currentConversationId
            })
        },
        watch: {},
        created() {},
        async mounted() {},
        beforeDestroy() {},
        methods: {
            ...mapMutations(['setUser', 'setUserInfo', 'setConversations', 'setClient']),
            ...mapActions(['createUserInfo', 'getUserInfo', 'updateInfo', 'logout']),
        }
    }
</script>
<style scoped lang="scss">
    .conversation {
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
        }
        >.content {
            flex-grow: 1;
            height: 100%;
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
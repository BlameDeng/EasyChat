<template>
    <div class="user">
        <main>
            <ul class="sider">
                <li class="user-info">
                    <img v-if="userInfo&&userInfo.avatar" :src="userInfo.avatar">
                </li>
                <li class="conversation"></li>
                <li class="contract"></li>
            </ul>
            <div class="nav"></div>
            <div class="content"></div>
        </main>
    </div>
</template>
<script>
    import xUpload from '@/components/upload/upload.vue'
    import { mapMutations, mapState, mapActions } from 'vuex'
    export default {
        name: 'User',
        mixins: [],
        components: { xUpload },
        props: {},
        data() {
            return {}
        },
        computed: {
            ...mapState({
                user: state => state.user,
                userInfo: state => state.userInfo
            })
        },
        watch: {},
        created() {
            this.getUserInfo({ uid: this.user.id })
                .then(res => {
                    if (res.length) {
                        let info = { ...res[0].attributes }
                        this.setUserInfo(info)
                    } else {
                        this.createUserInfo({ uid: this.user.id, nickname: '', avatar: 'https://chatavatar.oss-cn-hangzhou.aliyuncs.com/avatar.png?x-oss-process=style/avatar' })
                    }

                })
                .catch(error => {
                    console.log(error);

                })
        },
        mounted() {},
        beforeDestroy() {},
        methods: {
            ...mapMutations(['setUserInfo']),
            ...mapActions(['createUserInfo', 'getUserInfo']),
        }
    }
</script>
<style scoped lang="scss">
    .user {
        width: 100%;
        height: 100%;
        >main {
            width: 80%;
            max-width: 1000px;
            height: 80%;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, .15);
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
                >li {
                    width: 40px;
                    height: 40px;
                    margin: 10px auto;
                    &.user-info {
                        >img {
                            width: 40px;
                            height: 40px;
                            border-radius: 2px;
                            cursor: pointer;
                        }
                    }
                }
            }
            >.nav {
                width: 250px;
                height: 100%;
                background: rgb(245, 245, 245);
            }
            >.content {
                flex-grow: 1;
                height: 100%;
            }
        }
    }
</style>
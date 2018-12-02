<template>
    <div class="home">
        <x-icon name="logo-copy" class="icon"></x-icon>
        <div class="login">
            <div class="error">
                <x-icon name="error" style="margin-right:4px;" v-show="error"></x-icon><span style="cursor:default;" v-show="error">{{error}}</span>
            </div>
            <div class="form">
                <x-input icon="username" placeholder="请输入用户名" v-model.trim="username"></x-input>
                <x-input icon="lock" placeholder="请输入密码" type="password" v-model="password"></x-input>
            </div>
            <div class="button" role="button" @click="onLogin">登&nbsp;录</div>
            <span class="info">若为未注册用户，将自动为您注册</span>
        </div>
    </div>
</template>
<script>
    import xIcon from '@/components/icon/icon.vue'
    import xInput from '@/components/input/input.vue'
    import { mapMutations, mapActions } from 'vuex'
    export default {
        name: 'Home',
        components: { xIcon, xInput },
        data() {
            return {
                username: '',
                password: '',
                error: ''
            }
        },
        created() {
            let username = localStorage.getItem('username')
            if (username) { this.username = username }
        },
        methods: {
            ...mapMutations(['setUser']),
            ...mapActions(['login', 'signUp']),
            onLogin() {
                if (!this.username || !this.password) {
                    this.error = '用户名或密码不能为空'
                    return
                }
                const pattern1 = /^[\u4e00-\u9fa5\w]{5,10}$/
                const pattern2 = /.{6,18}/
                if (!pattern1.test(this.username)) {
                    this.error = '用户名为5到10个字母、数字、下划线或汉字'
                    return
                }
                if (!pattern2.test(this.password)) {
                    this.error = '密码为6到18个字符'
                    return
                }
                this.error = ''
                this.login({ username: this.username, password: this.password })
                    .then(res => {
                        let id = res.id
                        let username = res.attributes.username
                        localStorage.setItem('username', username)
                        this.setUser({ id, username })
                        this.$router.push('/user')
                    })
                    .catch(error => {
                        if (error.code === 210) {
                            this.error = '密码不正确'
                        } else if (error.code === 211) {
                            this.signUp({ username: this.username, password: this.password })
                                .then(res => {
                                    let id = res.id
                                    let username = res.attributes.username
                                    localStorage.setItem('username', username)
                                    this.setUser({ id, username })
                                    this.$router.push('/user')
                                })
                        } else {
                            this.error = '系统异常'
                        }
                    })
            }
        }
    }
</script>
<style scoped lang="scss">
    $habg:#f0f8ff;
    $hover:#72abfc;
    $p:#4587f0;
    $error:#f5222d;
    .home {
        width: 100%;
        height: 100%;
        >.icon {
            margin-top: 60px;
            margin-left: 60px;
            width: 50px;
            height: 50px;
        }
        >.login {
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            width: 350px;
            height: 300px;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            >.error {
                width: 100%;
                height: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: $error;
            }
            >.form {
                width: 80%;
                height: 90px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: stretch;
            }
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
            >.info {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.45);
            }
        }
    }
</style>
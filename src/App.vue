<template>
    <div id="app">
        <router-view />
    </div>
</template>
<script>
    import Vue from 'vue'
    export default {
        name: 'App',
        provide() {
            return { eventBus: this.eventBus }
        },
        data() {
            return { eventBus: new Vue() }
        }
    }
</script>
<style lang="scss">
    @import "@/assets/global.scss";
    html, body {
        width: 100%;
        height: 100%;
        min-width: 1100px;
    }
    #app {
        color: rgba(0, 0, 0, .65);
        width: 100%;
        height: 100%;
        background-image: url('./assets/bg.jpg');
        background-position: center center;
        background-size: cover;
    }
</style>
<template>
    <div id="app">
        <router-view />
    </div>
</template>

<style lang="scss">
    @import "@/assets/global.scss";
    html, body {
        width: 100%;
        height: 100%;
    }
    #app {
        color: rgba(0, 0, 0, .65);
        width: 100%;
        height: 100%;
    }
</style>
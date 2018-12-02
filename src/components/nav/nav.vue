<template>
    <div class="e-nav">
        <div class="title">
            <div class="chat">聊天</div>
            <!-- <div class="icon-wrapper" title="发起群聊">
                <x-icon name="close" class="icon"></x-icon>
            </div> -->
        </div>
        <template v-if="conversations&&conversations.length">
            <e-card v-for="item in conversations" :key="item.id" :conversation="item"></e-card>
        </template>
    </div>
</template>
<script>
    import eCard from './card.vue'
    import xIcon from '@/components/icon/icon.vue'
    import { mapState } from 'vuex'
    export default {
        name: 'eNav',
        components: { eCard, xIcon },
        computed: {
            ...mapState({
                conversations: state => state.conversations
            })
        }
    }
</script>
<style scoped lang="scss">
    .e-nav {
        width: 100%;
        height: 100%;
        overflow: hidden;
        &:hover {
            overflow-y: scroll;
        }
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
    }
</style>
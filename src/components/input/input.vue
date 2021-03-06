<template>
    <div class="x-textarea-wrapper" v-if="type==='textarea'">
        <textarea :style="xStyle" :value="value" @change="$emit('change',$event)" @input="onInput" @focus="$emit('focus',$event)" @blur="$emit('blur',$event)" ref="myTextarea">
        </textarea>
    </div>
    <div class="x-input" :class="{error,disabled}" v-else>
        <x-icon v-if="icon" :name="icon" class="icon" :class="{focus:focus||value}"></x-icon>
        <x-icon name="error" class="error"></x-icon>
        <input :type="type" @focus="onFocus" @blur="onBlur" :value="value" @input="onInput" @change="onChange" :class="{['no-icon']:!icon}" ref="input">
        <label v-if="placeholder" :class="{focus:focus||value,['no-icon']:!icon}">{{placeholder}}</label>
    </div>
</template>
<script>
    import xIcon from '../icon/icon.vue'
    export default {
        name: 'xInput',
        components: { xIcon },
        props: {
            placeholder: String,
            value: String,
            icon: String,
            type: { type: String, default: 'text' },
            disabled: { type: Boolean, default: false },
            error: { type: Boolean, default: false },
            resize: { type: Boolean, default: false },
        },
        data() {
            return { focus: false }
        },
        computed: {
            xStyle() {
                if (this.resize) {
                    return { resize: 'auto' }
                } else {
                    return { resize: 'none' }
                }
            }
        },
        methods: {
            onFocus(e) {
                this.focus = true
                this.$emit('focus', e)
                if (this.disabled) {
                    this.$refs.input.blur()
                }
            },
            onBlur(e) {
                if (this.disabled) { return }
                this.focus = false
                this.$emit('blur', e)
            },
            onInput(e) {
                this.$emit('input', e.target.value)
            },
            onChange(e) {
                this.$emit('change', e)
            }
        }
    }
</script>
<style scoped lang="scss">
    $p:#4587f0;
    $error:#f5222d;
    .x-input {
        width: 100%;
        display: inline-flex;
        height: 32px;
        position: relative;
        color: rgba(0, 0, 0, .65);
        font-size: 14px;
        >.icon {
            width: 20px;
            height: 20px;
            margin-right: 5px;
            position: absolute;
            top: 50%;
            left: 5px;
            transform: translateY(-50%);
            pointer-events: none;
            color: rgba(0, 0, 0, .45);
            &.focus {
                color: rgba(0, 0, 0, .65);
            }
        }
        >.error {
            width: 20px;
            height: 20px;
            position: absolute;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            color: $error;
            pointer-events: none;
            display: none;
        }
        >input {
            width: 100%;
            height: 100%;
            display: block;
            border: 1px solid rgba(0, 0, 0, .15);
            border-radius: 2px;
            box-shadow: none;
            padding: 0 5px 0 30px;
            color: rgba(0, 0, 0, .65);
            &.no-icon {
                padding: 0 5px;
            }
            &:focus {
                outline: none;
                border-color: $p;
            }
            &:hover {
                border-color: $p;
            }
        }
        >label {
            display: block;
            position: absolute;
            top: 50%;
            left: 30px;
            transform: translateY(-50%);
            color: rgba(0, 0, 0, .45);
            pointer-events: none;
            &.focus {
                display: none;
            }
            &.no-icon {
                left: 5px;
            }
        }
        &.error {
            >.error {
                display: inline-flex;
            }
            >input {
                border-color: $error;
            }
        }
        &.disabled {
            >input {
                cursor: not-allowed;
                user-select: none;
                &:focus {
                    outline: none;
                    border-color: rgba(0, 0, 0, .15);
                }
                &:hover {
                    border-color: rgba(0, 0, 0, .15);
                }
            }
        }
    }
    .x-textarea-wrapper {
        width: 100%;
        textarea {
            width: 100%;
            height: 100%;
            resize: none;
            padding: .5em .5em;
            border: 1px solid rgba(0, 0, 0, .15);
            border-radius: 4px;
            color: rgba(0, 0, 0, .65);
            font-size: 14px;
            &:hover {
                border-color: $p;
            }
            &:focus {
                outline: none;
                box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.25);
            }
        }
    }
</style>
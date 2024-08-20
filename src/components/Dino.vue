<template>

    <div class="dino" :style="toSizeStyle(comData)" :class="animationClasses">
        <slot>
            <div :style="toStyle(comData)"></div>
        </slot>
    </div>
</template>

<script lang="ts">
    export default {
        name: "Dino",
    };
</script>

<script setup lang="ts">
    import { toSizeStyle, toStyle } from "@/hooks/useBaseCom";
    import { useComponentRef } from "@/hooks/useComponentRef";
    import type { BaseCom, GameConfig, Player } from "@/types";
    import { computed, onMounted, ref, watchEffect, reactive, inject, type Ref } from 'vue';
    import { cloneDeep } from "lodash";

    let baseComponent = useComponentRef(HTMLElement);
    let { baseCom } = defineProps<{ baseCom: Player }>();
    let comData = ref(baseCom)
    let comDataDefault = cloneDeep(comData.value);
    //组件动画类
    let animationClasses = ref({
        player_gameover: false,
        player_hurt_protect: false,
    })
    //组件动画默认配置（重置时使用）
    let animationClassesDefault = cloneDeep(animationClasses.value);
    //游戏总配置项
    let gameConfig = inject<Ref<GameConfig>>("gameConfig") as Ref<GameConfig>;

    // 组件各项内容（comData）初始化
    function comInit() {
        // 对组件各项内容（comData）进行初始化
        // comData.value.height=0;
        // ...

        // 组件默认值备份
        comDataDefault = cloneDeep(comData.value)
    }
    // 组件初始化
    comInit()

    //组件自定义方法
    let hurt_animation = [
        'img/charactors/dino/hurt_1.png',
        // 'img/charactors/dino/hurt_2.png',
        'img/charactors/dino/hurt_3.png'
    ]

    // 玩家阵亡动画
    function playerDead() {
        console.log('playerDead')
        animationClasses.value.player_gameover = true;
        // setTimeout(() => {
        //     playerClass.value.player_gameover = false;
        // }, 2000);
        let index = 0
        let id = setInterval(() => {
            comData.value.display_img = hurt_animation[index]
            index += 1;
            if (index >= hurt_animation.length) {
                clearInterval(id);
                return;
            }
        }, 100)

    }
    //玩家角色跳跃方法
    function playerJump() {
        const intervalTime = 20; // 每0.05秒修改一次位置
        const totalTime = 800; // 跳跃总耗时
        let currentTime = 0;
        //加速度
        let gravity = (comData.value.speed) as number / (totalTime / 1000 / 2);
        console.log('gravity', gravity)
        //当前速度
        let s: number = comData.value.speed as number;
        if (!comData.value.isActive && !gameConfig.value.isGameover) {
            //isPause=true：禁止操作
            comData.value.isActive = true
            let id = setInterval(() => {
                //如果gameover则保持玩家当前位置，并结束定时任务
                if (gameConfig.value.isGameover) {
                    clearInterval(id);
                    return;
                }
                let s1 = s - intervalTime * gravity / 1000;
                let avgSpeed = (s1 + s) / 2
                // 组件显示框和受击框位置变化
                comData.value.top -= avgSpeed * intervalTime / 1000;
                comData.value.hitbox_top -= avgSpeed * intervalTime / 1000;
                currentTime += intervalTime;
                // console.log("top", comData.value.top)
                s = s1;
                if (currentTime > (totalTime - intervalTime) || comData.value.hitbox_top > comDataDefault.hitbox_top) {
                    let isProtected=comData.value.isProtected
                    //还原玩家角色位置
                    Object.assign(comData.value, comDataDefault);
                    // comData.value=comDataDefault;
                    comData.value.isProtected=isProtected
                    //解除禁止操作
                    comData.value.isActive = false;
                    clearInterval(id);
                    return;
                }
            }, intervalTime)
        }
    }
    // 角色受伤无敌帧
    function player_hurt() {
        comData.value.isProtected = true;
        animationClasses.value.player_hurt_protect = true;
        setTimeout(() => {
            comData.value.isProtected = false;
            animationClasses.value.player_hurt_protect = false;
        }, 2000)
    }
    //组件重置
    function reset() {
        Object.assign(comData.value, comDataDefault);
        animationClasses.value.player_gameover = false;
    }

    defineExpose({
        playerJump,
        playerDead,
        reset,
        comData,
        player_hurt,
    })
</script>

<style scoped>
    .dino {
        position: absolute;
    }

    .player_gameover {
        animation-name: player_gameover;
        animation-duration: 2s;
        animation-fill-mode: forwards;
    }


    @keyframes player_gameover {
        0% {}

        10% {
            transform: translateY(0px);
        }

        30% {
            transform: translateY(-50px);
        }

        100% {
            transform: translateY(400px);

        }
    }

    .player_hurt_protect {
        animation: player_hurt_protect 0.5s infinite;
    }

    @keyframes player_hurt_protect {
        0% {
            opacity: 1;
        }

        50% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }

    }
</style>

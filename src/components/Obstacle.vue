<template>
    <div class="baseCom" :style="toStyle(comData)" :class="animationClasses">
        <slot>
            <!-- <div :style="toStyle(comData)"></div> -->
        </slot>
    </div>
</template>
<script lang='ts'>
    export default
        {
            name: "Obstacle"
        }
</script>
<script lang='ts' setup>
    import { ref, inject, type Ref } from "vue";
    import { cloneDeep } from 'lodash';
    import { toSizeStyle, toStyle } from "@/hooks/useBaseCom";
    import { useComponentRef } from "@/hooks/useComponentRef";
    import type { Enemy, GameConfig } from "@/types";
    import { getRamdomInit } from "@/hooks/useUtils";
    // 组件初始化属性（位置，判定区，显示图片等)
    let { baseCom } = defineProps<{ baseCom: Enemy }>();
    let comData = ref(baseCom)
    // 组件默认值
    let comDataDefault = cloneDeep(comData.value)
    //组件动画类
    let animationClasses = ref({
        fire_loop: true,
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
    /**
     * 实现组件独有逻辑，封装为方法
     */

    //障碍角色移动方法
    function enemyMove() {
        console.log("enemyMove")
        const intervalTime = 20; // 每0.05秒执行一次
        //当前速度
        let s: number = comData.value.speed as number;

        comData.value.isActive = true;
        if (comData.value.isActive && !gameConfig.value.isGameover) {

            let id = setInterval(() => {
                // console.log(gameConfig)
                if (comData.value.isActive && gameConfig.value.isGameover) {
                    clearInterval(id);
                    return;
                }
                if (comData.value.left + comData.value.width >= 0) {
                    comData.value.left -= s * intervalTime / 1000
                    comData.value.hitbox_left -= s * intervalTime / 1000
                    // console.log('enemyHit',comData.value.hitbox_left)

                } else {
                    enemyInit();

                    gameConfig.value.score += 10
                    // clearInterval(id);
                    // return;
                }
            }, intervalTime)
        }
    }

    //障碍角色刷新方法
    function enemyInit() {
        Object.assign(comData.value, comDataDefault);
        let distance = getRamdomInit(0, 200);
        comData.value.left += distance;
        comData.value.hitbox_left += distance
        comData.value.isActive = true;
    }

    function speedUp() {
        comData.value.speed!+=0.2*comData.value.speed!
    }


    //组件重置
    function reset() {
        Object.assign(animationClasses.value, animationClassesDefault)
        Object.assign(comData.value, comDataDefault);
        // animationClasses.value.player_gameover = false;
    }
    defineExpose({
        comData,
        reset,
        enemyMove,
        speedUp,
    })

</script>
<style scoped>
    .baseCom {
        position: absolute;
    }

    .fire_loop {
        animation-name: fire_loop;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: steps(8);
    }

    @keyframes fire_loop {

        from {
            background-position: 0% 0px;
        }

        to {
            background-position: 800% 0px;
        }

    }
</style>
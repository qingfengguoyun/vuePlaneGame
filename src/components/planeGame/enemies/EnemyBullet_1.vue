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
            name: "EnemyBullet_1"
        }
</script>
<script lang='ts' setup>
    import { ref, inject, type Ref, watch } from "vue";
    import { cloneDeep, rest } from 'lodash';
    import { toSizeStyle, toStyle, validateHitbox } from "@/hooks/useBaseCom";
    import type { BaseCom, Enemy, GameConfig } from "@/types";
    import { getRamdomInit } from "@/hooks/useUtils";
    import { tr } from "element-plus/es/locales.mjs";
    // 组件初始化属性（位置，判定区，显示图片等)
    let { baseCom } = defineProps<{ baseCom: BaseCom }>();
    let comData = ref(baseCom)
    // 组件默认配置
    // 组件创建时的初始化配置(彻底重置时使用，例如游戏重置)
    let comDataDefault: BaseCom;
    // 组件临时配置(用于记录组件数值的临时状态（例如速度等属性修改，组件刷新时使用)
    let comDataSnipaste: BaseCom;
    let bulletSpeed = 200;
    //组件动画类
    let animationClasses = ref({
        // fire_loop: true,
        bullet_loop: true
    })
    //组件动画默认配置（重置时使用）
    let animationClassesDefault = cloneDeep(animationClasses.value);
    //游戏总配置项
    let gameConfig = inject<Ref<GameConfig>>("gameConfig") as Ref<GameConfig>;
    let displayBoard = inject<BaseCom>("displayBoard") as BaseCom;

    // 组件各项内容（comData）初始化
    function comInit() {
        // 对组件各项内容（comData）进行初始化
        // comData.value.height=0;
        // ...
        bulletSpeed = 100;
        comData.value.display_img = "img/charactors/weapon/bullet/nautolan_bullet_1.png"
        // comData.value.isActive=true;
        // 组件默认值备份
        comDataSnipaste = cloneDeep(comData.value)
        comDataDefault = cloneDeep(comData.value)
        // move()
        // // 敌机子弹创建时直接执行移动方法
        // move()
    }
    // 组件初始化
    comInit()

    // 监听组件位置，实时更新受击框位置
    watch(() => {
        return [comData.value.left, comData.value.top]
    }, () => {
        validateHitbox(comData.value);
    })

    // 实现组件自定义逻辑，封装为方法(例如移动，各种动作,动画等)

    // function move(){
    //     let id=setInterval(()=>{
    //         comData.left+=1;
    //         comData.hitbox_left+=1;
    //     },50);
    // }  

    function move() {
        console.log("enemy bullet move")
        comData.value.isActive = true;
        let interval = 20;
        let id = setInterval(() => {
            // 若isActive为false或子弹的位置超出边界
            if (!comData.value.isActive || comData.value.top > displayBoard.height + 50) {
                comData.value.isActive = false;
                reset();
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            comData.value.top += bulletSpeed * interval / 1000;
            // comData.value.hitbox_top-=200*interval/1000;
        }, interval)
    }




    // 自定义逻辑结束

    // 组件重置方法(临时，刷新组件用，例如越界刷新位置等)
    function reset() {
        // 动画重置
        Object.assign(animationClasses.value, animationClassesDefault)
        // 主配置（位置，默认图片等）重置
        Object.assign(comData.value, comDataDefault)
    }
    // 组件还原初始默认状态（完全重置，游戏重置等时机使用）
    function resetDefault() {
        // 动画重置
        Object.assign(animationClasses.value, animationClassesDefault)
        // 主配置（位置，默认图片等）重置
        // 临时配置重置为默认
        Object.assign(comDataSnipaste, comDataDefault)
        // 组件数据重置
        Object.assign(comData.value, comDataDefault)
    }
    defineExpose({
        comData,
        reset,
        resetDefault,
        //自定义逻辑
        // move
        move,
        bulletSpeed,
    })

</script>
<style scoped>
    .baseCom {
        position: absolute;
        display: flex;
        justify-content: center;
        /* align-items: center; */
    }

    .bullet_loop {
        animation-name: bullet_loop;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: steps(16);
    }


    @keyframes bullet_loop {
        from {
            background-position: 0% 0px;
        }

        to {
            background-position: -1600% 0px;
        }
    }

    /* .fire_loop {
        animation-name: fire_loop;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: steps(8);
    }

    @keyframes fire_loop {

        from {
            background-position: 0% 0px;
        }

        // background-position: x, y; 表示背景图向右/上移动，若想从左到右展示背景图，x应设置为负值
        to {
            background-position: -800% 0px;
        }

    } */
</style>
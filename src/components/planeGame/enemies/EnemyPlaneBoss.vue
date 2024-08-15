<template>
    <!-- <div class="baseCom" :style="toStyle(comData)" style="transform: rotate(180deg);" :class="animationClasses"></div> -->
    <div class="baseCom" :style="toStyle(comData)" :class="animationClasses">
        <slot>
            <!-- <div :style="toStyle(comData)"></div> -->
        </slot>
    </div>
</template>
<script lang='ts'>
    export default
        {
            name: "EnemyPlaneBoss"
        }
</script>
<script lang='ts' setup>
    import { ref, inject, type Ref, watch } from "vue";
    import { cloneDeep } from 'lodash';
    import { initBaseCom, toSizeStyle, toStyle, validateHitbox } from "@/hooks/useBaseCom";
    import type { BaseCom, Enemy, EnemyBoss, GameConfig } from "@/types";
    import { getRamdomInit } from "@/hooks/useUtils";
    // 组件初始化属性（位置，判定区，显示图片等)
    let { baseCom } = defineProps<{ baseCom: EnemyBoss }>();
    let comData = ref(baseCom)

    // 组件默认配置
    // 组件创建时的初始化配置(彻底重置时使用，例如游戏重置)
    let comDataDefault: Enemy;
    // 组件临时配置(用于记录组件数值的临时状态（例如速度等属性修改，组件刷新时使用)
    let comDataSnipaste: Enemy;

    //组件动画类
    let animationClasses = ref({
        enemy_explode: false,
        // fire_loop: true,
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
        comData.value.display_img = "./img/charactors/enemy/nautolan/Nautolan_boss.png"
        comData.value.speed = 50
        comData.value.shot_cd = 3000;
        comData.value.hp = 50;
        comData.value.max_hp = 50;
        comData.value.isAction = false;
        comData.value.bossEnter = false;
        comData.value.bossAction_1 = false;
        comData.value.bossAction_2 = false;
        // 组件默认值备份
        comDataSnipaste = cloneDeep(comData.value)
        comDataDefault = cloneDeep(comData.value)
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

    function enemyExplode() {
        // comData.value.displayImg      
        console.log("enemyPlaneExplode")
        comData.value.isActive = false
        animationClasses.value.enemy_explode = true;
        let id = setTimeout(() => {
            // comData.value.isActive=false;
            // animationClasses.value.asteroid_explode=false;
            // reset();
            randomReset()
        }, 1000);
    }

    function bossEnterAction() {
        let interval = 20
        let h_speed = 50
        comData.value.hp = 0;
        // 计时器
        let currentTime = 0
        // 动作总持续时间
        let totalTime = 3000

        // boss水平位置移动至屏幕中央
        comData.value.left = displayBoard.width / 2 - comData.value.width / 2;
        // boss垂直位置移动至紧贴界面上边缘
        comData.value.top = 0 - comData.value.height;
        // 没有正在执行动作
        if (!comData.value.isAction) {
            comData.value.isAction = true;
            comData.value.isProtected = true;
            comData.value.isActive = true;
            comData.value.bossEnter = true;
            let id = setInterval(() => {
                //游戏结束或自身失效，则停止移动任务
                if (gameConfig.value.isGameover || !comData.value.isActive || currentTime >= totalTime) {
                    comData.value.isProtected = false;
                    comData.value.isAction = false;
                    comData.value.bossEnter = false;
                    comData.value.hp = comData.value.max_hp;
                    clearInterval(id);
                    return;
                }
                // 如果游戏为暂停状态，不执行后续逻辑
                if (gameConfig.value.isPaused) {
                    return;
                }
                comData.value.top += h_speed * interval / 1000;
                currentTime += interval;
                comData.value.hp! += (comData.value.max_hp! / totalTime) * interval

            }, interval)
        }

    }

    function bossAction_1() {
        let interval = 20
        // 计时器
        let currentTime = 0
        // 动作总持续时间
        let totalTime = 3000
        // 记录当前位置
        let currentPosition = cloneDeep(comData.value)
        // 目标位置1
        let checkPoint_1 = {
            left: 10 - comData.value.width / 2,
            top: 100,
        }
        // 目标位置2
        let checkPoint_2 = {
            left: displayBoard.width - comData.value.width / 2 - 10,
            top: 100,
        }
        // 没有正在执行动作
        if (!comData.value.isAction) {
            // 设置整体动作标识以及指定动作标识为true
            comData.value.isAction = true;
            comData.value.bossAction_1 = true;
            // 将射击cd设置为0（立即发射子弹）
            comData.value.shot_cd = 0;
            let id = setInterval(() => {
                //游戏结束或自身失效，则停止移动任务
                if (gameConfig.value.isGameover || !comData.value.isActive || currentTime > totalTime) {
                    // comData.value.isProtected = false;
                    comData.value.isAction = false;
                    comData.value.bossAction_1 = false;
                    clearInterval(id);
                    return;
                }
                // 如果游戏为暂停状态，不执行后续逻辑
                if (gameConfig.value.isPaused) {
                    return;
                }
                //前0.5秒移动至检查点1
                if (currentTime < 500) {
                    comData.value.left += (checkPoint_1.left - currentPosition.left) * interval / 500;
                    comData.value.top += (checkPoint_1.top - currentPosition.top) * interval / 500;
                }
                if (currentTime == 500) {
                    comData.value.left = checkPoint_1.left;
                    comData.value.top = checkPoint_1.top;
                }
                //中间两秒移动至检查点2
                if (currentTime > 500 && currentTime < 2500) {
                    comData.value.left += (checkPoint_2.left - checkPoint_1.left) * interval / 2000;
                    comData.value.top += (checkPoint_2.top - checkPoint_1.top) * interval / 2000;
                }
                if (currentTime == 2500) {
                    comData.value.left = checkPoint_2.left;
                    comData.value.top = checkPoint_2.top;
                }
                // 0.5秒移动至原位
                if (currentTime > 2500 && currentTime < 3000) {
                    comData.value.left += (currentPosition.left - checkPoint_2.left) * interval / 500;
                    comData.value.top += (currentPosition.top - checkPoint_2.top) * interval / 500;
                }
                if (currentTime == 3000) {
                    comData.value.left = currentPosition.left;
                    comData.value.top = currentPosition.top;
                }
                currentTime += interval;

            }, interval)
        }
    }

    // boss机常态移动
    function bossMove() {
        let interval = 20
        let h_move = 'right';
        let h_speed = comData.value.speed;
        let id = setInterval(() => {
            if (gameConfig.value.isGameover || !comData.value.isActive) {
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            // 如果在执行其他动作，则不执行常驻动作
            if (comData.value.isAction) {
                return;
            }

            if (comData.value.left >= displayBoard.width - comData.value.width && h_move == 'right') {
                // console.log("left")
                h_speed = -comData.value.speed!;
                // console.log('h_speed', h_speed)
                h_move = 'left'
            }
            if (comData.value.left <= 0 && h_move == 'left') {
                h_speed = comData.value.speed!;
                h_move = 'right'
            }
            if (comData.value.isActive) {
                // comData.value.top += comData.value.speed! * interval / 1000;
                // comData.value.hitbox_top+=comData.value.speed!*interval/1000;
                comData.value.left += h_speed! * interval / 1000;
                // validateHitbox(comData.value);
            }

        }, interval)
    }

    //直线移动
    function moveStyle2() {
        let interval = 20
        let h_speed = comData.value.speed;
        let id = setInterval(() => {
            if (gameConfig.value.isGameover || !comData.value.isActive) {
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            if (comData.value.isActive) {
                comData.value.top += comData.value.speed! * interval / 1000;
            }

        }, interval)
    }

    let getBossHpStyle = function () {
        return {
            height: `10px`,
            width: `${comData.value.hp! / comData.value.max_hp! * 150}px`,
            backgroundColor: `red`,
            borderRadius: `5px`,
        }
    }

    //重置子弹发射cd
    function resetShotCD() {
        // 特殊动作1时，射击cd变为1/4
        if (comData.value.bossAction_1) {
            comData.value.shot_cd = comDataSnipaste.shot_cd! / 8;
        } else {
            comData.value.shot_cd = comDataSnipaste.shot_cd;
        }

    }

    //随机初始化位置
    function randomReset() {
        reset();
        comData.value.top = -comData.value.height;
        comData.value.left = Math.random() * (displayBoard.width - comData.value.width);
        validateHitbox(comData.value)
        comData.value.speed = comDataDefault.speed! * 0.6 + (comDataDefault.speed! * 0.4) * Math.random()
        setTimeout(() => {
            comData.value.isActive = true
        }, Math.random() * 1000)
    }
    // 自定义逻辑结束

    // 组件重置方法
    function reset() {
        // 动画重置
        Object.assign(animationClasses.value, animationClassesDefault)
        // 主配置（位置，默认图片等）重置
        Object.assign(comData.value, comDataDefault)
    }
    // 组件还原初始默认状态
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
        randomReset,
        bossAction_1,
        enemyExplode,
        bossEnterAction,
        bossMove,
        resetShotCD,
        getBossHpStyle,
        //自定义逻辑
        // move
    })

</script>
<style scoped>
    .baseCom {
        position: absolute;
        display: flex;
        justify-content: center;

        /* align-items: center; */
    }

    @keyframes enemy_explode {

        from {
            background-position: 0% 0px;

        }

        to {
            background-position: -1100% 0px;
        }
    }

    .enemy_explode {
        animation-name: enemy_explode;
        animation-duration: 1s;
        animation-iteration-count: 1;
        animation-timing-function: steps(11);
        animation-fill-mode: forwards;
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

        to {
            background-position: 800% 0px;
        }

    } */
</style>
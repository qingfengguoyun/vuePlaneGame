<template>
    <div class="baseCom" :style="toSizeStyle(comData)" :class="animationClasses">
        <slot>
            <!-- <div :style="toStyle(comData)"></div> -->
            <div :style="toStyle(comData)" :class="animationClasses" style="z-index: 1;"> </div>
            <Weapon :baseCom="weaponData" ref="weapon"></Weapon>
            <Engine :baseCom="engineData">

            </Engine>
            <Shield :baseCom="shieldData" ref="shield" v-if="shieldData.isActive">

            </Shield>
            <!-- <template v-for="(bulletData,index) in bulletDatas" :key="index">
                <Bullet_1 :baseCom="bulletData"></Bullet_1>
            </template> -->
        </slot>
    </div>
</template>
<script lang='ts'>
    export default
        {
            name: "Plane"
        }
</script>
<script lang='ts' setup>
    import { ref, inject, type Ref, watch, computed, withCtx } from "vue";
    import { cloneDeep } from 'lodash';
    import { getBaseComCenter, initBaseCom, toSizeStyle, toStyle, validateHitbox } from "@/hooks/useBaseCom";
    import type { BaseCom, Enemy, GameConfig, Player } from "@/types";
    import { getRamdomInit } from "@/hooks/useUtils";
    import BaseComponent from "../BaseComponent.vue";
    import Engine from "@/components/planeGame/Engine.vue"
    import Weapon from "@/components/planeGame/weapons/Weapon.vue"
    import Bullet_1 from "@/components/planeGame/bullets/Bullet_1.vue";
    import Shield from "@/components/planeGame/shields/Shield.vue";
    import { useComponentRef } from "@/hooks/useComponentRef";
    // 组件初始化属性（位置，判定区，显示图片等)
    let { baseCom } = defineProps<{ baseCom: Player }>();
    let comData = ref(baseCom)
    // 组件创建时的初始化配置(彻底重置时使用，例如游戏重置)
    let comDataDefault: Player;
    // 组件临时配置(用于记录组件数值的临时状态（例如速度等属性修改，组件刷新时使用)
    let comDataSnipaste: Player;

    let engineData = initBaseCom(comData.value.width, comData.value.height, 0, 0, 0, 0, "/img/charactors/plane/engine_1.png")
    let weaponData = initBaseCom(comData.value.width, comData.value.height, 0, 0, 0, 0, "/img/charactors/weapon/weapon_1.png")
    let shieldData = initBaseCom(comData.value.width, comData.value.height, 0, 0, comData.value.width, comData.value.height, "/img/charactors/shield/shield_1.png")

    //组件动画类
    let animationClasses = ref({
        // fire_loop: true,
        protected: false,
    })
    //组件动画默认配置（重置时使用）
    let animationClassesDefault = cloneDeep(animationClasses.value);
    //游戏总配置项
    let gameConfig = inject<Ref<GameConfig>>("gameConfig") as Ref<GameConfig>;
    let displayBoard = inject<BaseCom>("displayBoard") as BaseCom;
    let weapon = useComponentRef(Weapon)
    // 组件各项内容（comData）初始化
    function comInit() {
        // 对组件各项内容（comData）进行初始化
        // comData.value.height=0;
        // ...
        comData.value.isActive=true;
        comData.value.shot_cd=200;
        comData.value.max_hp=4;
        comData.value.hp=4;
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

    // 改变组件位置
    function changePositionByCenter(center_x: number, center_y: number) {
        comData.value.left = center_x - comData.value.width / 2;
        comData.value.top = center_y - comData.value.height / 2;
        // validateHitbox(comData.value)
    }
    // 监听组件位置，防止组件位置超出边界
    watch(comData.value, (n, o) => {
        if (comData.value.left < 0 - (comData.value.width - comData.value.hitbox_width) / 2) {
            comData.value.left = 0 - (comData.value.width - comData.value.hitbox_width) / 2;
        }
        if (comData.value.left > displayBoard.width - comData.value.width + (comData.value.width - comData.value.hitbox_width) / 2) {
            console.log("left");
            comData.value.left = displayBoard.width - comData.value.width + (comData.value.width - comData.value.hitbox_width) / 2;
        }
        // 组件不得进入距上边界小于40像素的区域
        if (comData.value.top < 30) {
            comData.value.top = 30;
        }        
        if (comData.value.top > displayBoard.height - comData.value.height ) {
            console.log("height");
            comData.value.top = displayBoard.height - comData.value.height ;
        }
    })

    let planeStatusImg = ['img/charactors/plane/plane_1.png',
        'img/charactors/plane/plane_2.png',
        'img/charactors/plane/plane_3.png',
        'img/charactors/plane/plane_4.png',
    ]

    // 根据血量修改显示图像
    function setPlaneStatusImg(planeStatus: number){
        comData.value.display_img = planeStatusImg[planeStatus];
    }

    function hurt(planeStatus: number) {
        comData.value.isProtected = true;
        setPlaneStatusImg(planeStatus)
        animationClasses.value.protected = true;
        //三秒后移除无敌状态
        let id = setTimeout(() => {
            // 移除保护动画
            animationClasses.value.protected = false;
            //护盾未生效，移除保护状态
            if(!shieldData.isActive){
                comData.value.isProtected = false;
            }           
        }, 3000)
    }

    //获取护盾
    function getShield() {
        //不为保护状态，则开启护盾，并启动监听护盾持续时间线程
        if (!comData.value.isProtected) {
            comData.value.isProtected = true;
            shieldData.isActive = true;
            comData.value.shield_duration = 5000;
            let interval = 20;
            //启动监听线程
            let id = setInterval(() => {
                if (comData.value.shield_duration! <= 0) {
                    comData.value.isProtected = false;
                    shieldData.isActive = false;
                    comData.value.shield_duration = 0;
                    clearInterval(id);
                    return;
                } else {
                    comData.value.shield_duration! -= interval;
                }
            }, 20)
        }
        //保护状态再次获得护盾，刷新护盾时间
        else {
            comData.value.isProtected = true;
            shieldData.isActive = true;
            comData.value.shield_duration = 5000;
        }
    }

    // 监听快照的子弹发射cd，依据power_level实时计算
    watch(()=>{
        return comData.value.power_level
    },(o,n)=>{
        if(comData.value.power_level!>comData.value.max_power_level!){
            comData.value.power_level=comData.value.max_power_level!;
        }
        if(comData.value.power_level!<0){
            comData.value.power_level=0;
        }
        comDataSnipaste.shot_cd=comDataDefault.shot_cd!-40*comData.value.power_level!
        console.log("power_level",comData.value.power_level,"shot_cd",comDataSnipaste.shot_cd)
    })

    //获取提升火力道具
    function getPowerUp() {
        // 修改火力等级，并启动延时任务，5秒后降低一级火力等级
        // 初始cd为200毫秒，每级火力等级减少40毫秒，最大火力等级为2
        comData.value.power_level!+=1;
        let id=setTimeout(()=>{
            comData.value.power_level!-=1;
        },5000)
    }

    //重置子弹发射cd
    function resetShotCD() {
        // 重置cd为快照中的发射cd
        comData.value.shot_cd = comDataSnipaste.shot_cd;
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
        //自定义逻辑
        // move
        changePositionByCenter,
        weapon,
        hurt,
        getShield,
        shieldData,
        resetShotCD,
        setPlaneStatusImg,
        getPowerUp,
    })

</script>
<style scoped>
    .baseCom {
        position: absolute;
        display: flex;
        justify-content: center;
        /* align-items: center; */
    }

    .protected {
        animation: protected 0.5s infinite;
    }

    @keyframes protected {
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



    /* .fire_loop {
        animation-name: fire_loop;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: steps(8);
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
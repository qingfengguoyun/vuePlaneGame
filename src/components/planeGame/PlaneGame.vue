<template>
    <div class="game" :style="toSizeStyle(displayBoard)">
        <div :style="toSizeStyle(displayBoard)" class="border_background" :class="boardAnimateClass"
            @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @mousedown="onMouseDown"
            @mousemove="onMouseMove" @mouseup="onMouseUp">
            <!-- 自机组件 -->
            <Plane :baseCom="playerData" ref="playerPlane"></Plane>
            <!-- 陨石组件 -->
            <template v-for="(asteroidData, index) in asteroidDatas">
                <Asteroid :baseCom="asteroidData" ref="asteroids"></Asteroid>
            </template>
            <!-- 自机子弹组件 -->
            <template v-for="(bulletData, index) in bulletDatas" :key="bulletData">
                <!-- {{ index }} -->
                <Bullet_1 :base-com="bulletData" ref='bullets1'></Bullet_1>
            </template>
            <!-- 小型敌机组件 -->
            <template v-for="(enemySmallPlaneData, index) in enemySmallPlaneDatas" :key="enemySmallPlaneData">
                <!-- {{ index }} -->
                <EnemyPlane :base-com="enemySmallPlaneData" ref="enemySmallPlanes"></EnemyPlane>
            </template>
            <!-- 大型敌机组件 -->
            <template v-for="(enemyBigPlaneData, index) in enemyBigPlaneDatas" :key="enemyBigPlaneData">
                <!-- {{ index }} -->
                <EnemyPlaneBig :base-com="enemyBigPlaneData" ref="enemyBigPlanes"></EnemyPlaneBig>
            </template>
            <!-- 敌机子弹组件 -->
            <template v-for="(enemyBulletData, index) in enemyBulletDatas" :key="enemyBulletData">
                <!-- {{ index }} -->
                <EnemyBullet_1 :base-com="enemyBulletData" ref='enemyBullets1'></EnemyBullet_1>
            </template>
            <!-- 敌方boss组件 -->
            <EnemyPlaneBoss :base-com="enemyBossPlaneData" ref='enemyBossPlane'></EnemyPlaneBoss>
            <!-- 敌方boss血条组件 -->
            <template v-if="enemyBossPlane?.comData.isActive">
                <BaseComponent :base-com="initBaseCom(150, 10, displayBoard.width / 2 - 75, 20)"
                    style="border: 2px black solid; border-radius: 5px; overflow: hidden;">
                    <BaseComponent :base-com="initBaseCom(150, 10, 0, 0)" :style="enemyBossPlane?.getBossHpStyle()">
                    </BaseComponent>
                </BaseComponent>
            </template>




            <!-- 道具组件 -->
            <ShieldItem :base-com="shieldItemData" ref="shieldItem"></ShieldItem>
            <!-- <PowerUp :base-com="powerUpItemData" ref="powerUpItem"></PowerUp> -->
            <ExtraLife :base-com="extraLifeItemData" ref="extraLifeItem"></ExtraLife>
            <template v-for="(powerUpItemData, index) in powerUpItemDatas " :key="powerUpItemData">
                <PowerUp :base-com="powerUpItemData" ref="powerUpItems"></PowerUp>
            </template>

            <!-- 其他组件 -->
            <BaseComponent :base-com="initBaseCom(30, 30, 0, displayBoard.height - 30)">
                <b>Life:</b>
            </BaseComponent>
            <template v-for="(playerLife, index) in playerLifes">
                <BaseComponent :base-com="playerLife" v-if="index < playerData.hp!"></BaseComponent>
            </template>
            <div>
                Life:{{ playerData.hp! }}
            </div>
            <!-- <div v-if="!gameConfig.isGameover" class="gameover_board">
                <b>Game Over</b><br>
                <b>scoure:{{ gameConfig.score }}</b>
            </div> -->
            <BaseComponent :base-com="initBaseCom(200, 100, 50, 150)" v-if="!gameConfig.isGameStart">
                <div style="text-align: center;">
                    <h1><b>飞机大战</b></h1>
                </div>
            </BaseComponent>
            <BaseComponent :base-com="initBaseCom(200, 100, 50, 350)" v-if="!gameConfig.isGameStart"
                @click="gameInit()">
                <div style="text-align: center;">
                    <h3>开始游戏</h3>
                </div>
            </BaseComponent>
            <BaseComponent :base-com="createBaseComAtMiddle(displayBoard, 150, 100)" v-if="gameConfig.isGameover"
                @click="gameInit()">
                <div class="gameover_board">
                    <b>Game Over</b><br>
                    <b>Score:{{ gameConfig.score }}</b><br>
                    <!-- <b>asteroid:{{ destoryRecord.asteroid }}</b><br>
                    <b>enemyPlane:{{ destoryRecord.enemyPlane }}</b><br>
                    <b>enemyPlaneBig:{{ destoryRecord.enemyPlaneBig }}</b><br> -->
                    <b>重新开始</b>
                </div>
            </BaseComponent>
            <BaseComponent :base-com="createBaseComAtMiddle(displayBoard, 150, 100)"
                v-if="enemyBossPlaneData.bossEnter">
                <div class="warning_board">
                    <h1><b>warning!!</b></h1>
                </div>
            </BaseComponent>
            <!-- 游戏暂停按钮 -->
            <GamePause :base-com="gamePauseButtonData" ref="gamePauseButton"
                v-if="gameConfig.isGameStart && !gameConfig.isGameover" @click.stop="gamePause()"
                @touchstart.stop="gamePause()">
            </GamePause>
        </div>
    </div>

    <!-- <el-button type="primary" @click="playerPlane?.weapon?.weapon_shoot">开始</el-button> -->
    <el-button type="primary" @click="gameStart()">开始</el-button>
    <el-button type="primary" @click="() => { gameConfig.isGameover = true }">游戏结束</el-button>
    <h2 v-if="gameConfig.isGameover"> GameOver</h2>
    <h2>score:{{ gameConfig.score }}</h2>
</template>
<script lang='ts'>
    export default
        {
            name: 'PlaneGame'
        }
</script>
<script lang='ts' setup>
    import { onMounted, ref, watch, type Ref, reactive, provide } from 'vue';
    import { ElMessage } from 'element-plus';
    import { useComponentArrayRef, useComponentRef } from '@/hooks/useComponentRef';
    import type { BaseCom, Enemy, EnemyBoss, GameConfig, HitBox, Item, Player } from '@/types';
    import { createBaseComAtMiddle, getBaseComCenter, initBaseCom, initEnemy, initItem, initPlayer, isCollision, toSizeStyle, toStyle, validateHitbox, } from '@/hooks/useBaseCom';
    import { cloneDeep } from 'lodash';
    import BaseComponent from '@/components/BaseComponent.vue';
    import Plane from '@/components/planeGame/Plane.vue';
    import EnemyPlane from '@/components/planeGame/enemies/EnemyPlane.vue';
    import EnemyPlaneBig from '@/components/planeGame/enemies/EnemyPlaneBig.vue';
    import Asteroid from '@/components/planeGame/Asteroid.vue';
    import Bullet_1 from './bullets/Bullet_1.vue';
    import EnemyBullet_1 from './enemies/EnemyBullet_1.vue';
    import ShieldItem from './items/ShieldItem.vue';
    import PowerUp from './items/PowerUp.vue';
    import ExtraLife from './items/ExtraLife.vue';
    import GamePause from './status/GamePause.vue';
    import EnemyPlaneBoss from './enemies/EnemyPlaneBoss.vue';

    // 游戏整体配置
    let gameConfig: Ref<GameConfig> = ref({
        isGameStart: false,
        isGameover: false,
        isPaused: false,
        isBossClear: false,
        isBossAppear: false,
        score: 0,
    })
    // 玩家击破敌人记录
    let destoryRecord = ref({
        asteroid: 0,
        enemyPlane: 0,
        enemyPlaneBig: 0,
    })
    provide('gameConfig', gameConfig)

    let displayBoard: Ref<BaseCom> = ref(initBaseCom(300, 500, 0, 0))
    provide('displayBoard', displayBoard.value)

    let boardAnimateClass = ref({
        // border_background: true,
        border_background_move: false,
    })
    let boardAnimateClassDefault = cloneDeep(boardAnimateClass.value);

    //额外配置
    // let maxLife = 4;

    // 暂停按钮
    let gamePauseButtonData: Ref<BaseCom> = ref(initBaseCom(40, 30, 250, 10))
    let gamePauseButton = useComponentRef(GamePause)

    // 自机配置
    let playerData: Ref<Player> = ref(initPlayer(40, 40, 130, 400, 25, 25, 800, './img/charactors/plane/plane_1.png'))
    let playerPlane = useComponentRef(Plane)

    // 剩余血量图标配置
    let playerLifes: Ref<BaseCom[]> = ref([])
    for (let i = 0; i < 4; i++) {
        playerLifes.value.push(initBaseCom(20, 20, 30 + 20 * i, displayBoard.value.height - 30, 0, 0, './img/charactors/plane/plane_1.png'))
    }

    // 陨石相关配置
    let asteroidDatas: Ref<Enemy[]> = ref([]);
    asteroidDatas.value.push(initEnemy(40, 40, 30, 100, 25, 25, 100, 10, './img/charactors/asteroid/Asteroid_1.png'),
        initEnemy(40, 40, 130, 100, 25, 25, 100, 10, './img/charactors/asteroid/Asteroid_1.png'),
        initEnemy(40, 40, 230, 100, 25, 25, 100, 10, './img/charactors/asteroid/Asteroid_1.png'))
    let asteroids = useComponentArrayRef(Asteroid);

    // 自机子弹相关配置
    let bullets1 = useComponentArrayRef(Bullet_1);
    let bulletDatas: Ref<BaseCom[]> = ref([]);
    //子弹总数
    let bulletCount = 15;
    for (let i = 0; i < bulletCount; i++) {
        bulletDatas.value.push(initBaseCom(playerData.value.width!,
            playerData.value.height!,
            -100,
            displayBoard.value.height,
            playerData.value.width! / 3,
            playerData.value.height! / 3,
            './img/charactors/weapon/bullet/bullet_1.png'));
    }
    // 当前子弹id
    let currentBullet = 0;

    // 敌机相关配置
    let enemySmallPlaneDatas: Ref<Enemy[]> = ref([]);
    let enemySmallPlanes = useComponentArrayRef(EnemyPlane);
    let enemySmallPlaneCount = 3;
    for (let i = 0; i < enemySmallPlaneCount; i++) {
        enemySmallPlaneDatas.value.push(initEnemy(40,
            40,
            30 + 100 * i,
            50,
            25,
            25,
            100,
            10,
            'img/charactors/enemy/nautolan/Nautolan_1.png'
        ))
    }

    //大型敌机相关配置
    let enemyBigPlaneDatas: Ref<Enemy[]> = ref([]);
    let enemyBigPlanes = useComponentArrayRef(EnemyPlaneBig);
    let enemyBigPlaneCount = 2;
    for (let i = 0; i < enemyBigPlaneCount; i++) {
        enemyBigPlaneDatas.value.push(initEnemy(80,
            80,
            30 + 100 * i,
            -100,
            50,
            50,
            50,
            30,
            './img/charactors/enemy/nautolan/Nautolan_2.png'
        ))
    }

    // boss敌机配置
    let enemyBossPlaneData: Ref<EnemyBoss> = ref(initEnemy(120, 120, 0, 500, 60, 60, 0, 100));
    let enemyBossPlane = useComponentRef(EnemyPlaneBoss);


    // 敌机子弹配置(使用预置定量子弹，而非动态生成子弹组件的策略)
    let enemyBulletDatas: Ref<BaseCom[]> = ref([]);
    let enemyBullets1 = useComponentArrayRef(EnemyBullet_1);
    //子弹总数
    let enemyBulletCount = 15;
    for (let i = 0; i < enemyBulletCount; i++) {
        enemyBulletDatas.value.push(initBaseCom(30,
            30,
            -100,
            displayBoard.value.height,
            15,
            15,
            './img/charactors/weapon/bullet/nautolan_bullet_1.png'));
    }
    // 当前子弹id
    let currentEnemyBullet = 0;
    // enemyBulletDatas.value.push(initBaseCom(40,40,50,300,20,20))

    //局内道具
    //护盾
    let shieldItemData: Ref<Item> = ref(initItem(30, 30, 100, 300, 20, 20))
    let shieldItem = useComponentRef(ShieldItem);
    //额外生命
    let extraLifeItemData: Ref<Item> = ref(initItem(30, 30, 100, 300, 20, 20))
    let extraLifeItem = useComponentRef(ExtraLife);
    //火力增强
    let powerUpItemDatas: Ref<Item[]> = ref([])
    for (let i = 0; i < 3; i++) {
        powerUpItemDatas.value.push(initItem(30, 30, 100, 300, 20, 20))
    }
    let powerUpItems = useComponentArrayRef(PowerUp)
    //火力道具生成cd
    let powerUpItemCd = 8000
    let powerUpItemCdDefault = 8000
    // let powerUpItem = useComponentRef(PowerUp);

    // 道具生成次数
    let itemGeneratedTimes = ref({
        shieldItem: 0,
        extraLifeItem: 0,
        powerUpItem: 0,
    })

    //游戏初始化/重置方法
    function gameInit() {

        // 游戏总配置重置
        Object.assign(gameConfig.value, {
            isGameStart: true,
            isGameover: false,
            isPaused: false,
            isBossClear: false,
            isBossAppear: false,
            score: 0,
        })
        boardMove()

        //玩家击破敌人记录重置
        destoryRecord.value = {
            asteroid: 0,
            enemyPlane: 0,
            enemyPlaneBig: 0,
        }

        // 道具生成次数重置
        itemGeneratedTimes.value = {
            shieldItem: 0,
            extraLifeItem: 0,
            powerUpItem: 0,
        }

        //重置自机
        playerPlane.value?.resetDefault();

        //重置子弹
        for (let i = bullets1.value!.length - 1; i >= 0; i--) {
            bullets1.value![i].resetDefault();
        }
        //重置子弹指针
        currentBullet = 0;

        //重置敌方子弹
        for (let i = enemyBullets1.value!.length - 1; i >= 0; i--) {
            enemyBullets1.value![i].resetDefault();
        }
        //重置敌方子弹指针
        currentBullet = 0;

        //重置所有陨石
        for (let i = asteroids.value!.length - 1; i >= 0; i--) {
            asteroids.value![i].resetDefault();
            console.log(asteroids.value![i])
            asteroids.value![i].randomReset()
            asteroids.value![i].comData.isActive = true;
            asteroids.value![i].asteroidMove()
        }
        // 重置所有敌机
        for (let i = enemySmallPlanes.value!.length - 1; i >= 0; i--) {
            enemySmallPlanes.value![i].resetDefault();
            enemySmallPlanes.value![i].randomReset();
            enemySmallPlanes.value![i].comData.isActive = true;
            enemySmallPlanes.value![i].moveStyle1();
        }
        // 重置所有大型敌机
        for (let i = enemyBigPlanes.value!.length - 1; i >= 0; i--) {
            enemyBigPlanes.value![i].resetDefault();
            enemyBigPlanes.value![i].randomReset();
            enemyBigPlanes.value![i].comData.isActive = true;
            // 大型敌机开始游戏时不执行move
            // enemyBigPlanes.value![i].moveStyle2();
        }
        // 重置敌方boss
        enemyBossPlane.value?.reset();
        // 重置道具
        shieldItem.value?.resetDefault();
        shieldItem.value?.randomReset();
        extraLifeItem.value?.resetDefault();
        extraLifeItem.value?.randomReset();
        for (let powerUpItem of powerUpItems.value!) {
            powerUpItem.resetDefault();
            powerUpItem.randomReset();
        }
        powerUpItemCd = powerUpItemCdDefault


        // 检测子弹与陨石,敌机碰撞
        checkBulletsAndEnemys()
        // 检测自机和敌人是否碰撞
        checkPlayerPlaneAndEnemys()
        // 检测自机与道具
        checkPlayerAndItem()
        // 陨石，敌机等超出边界检测
        checkOutBoardCom()
        // 检测并移除失效子弹
        checkBullets();
        // 检查游戏是否结束
        gameOverCheck();
        // 拖拽过程中子弹自动射击
        autoShotBullet()
        // 分数检测
        checkScore()
        // 局内道具生成
        itemGenerate()

    }
    function gameStart() {
        gameInit();
        // obstacle.value.enemyMove();
        // boardMove();
        // 
        gameOverCheck();
    }
    function gamePause() {
        gameConfig.value.isPaused = !gameConfig.value.isPaused
        console.log(gameConfig.value.isPaused ? "game paused" : "game continue")
    }
    //背景开始移动
    function boardMove() {
        boardAnimateClass.value.border_background_move = true;
    }
    // 自机移动
    const isDragging = ref(false)
    const mouseX = ref(0);
    const mouseY = ref(0);

    function onTouchStart(event: TouchEvent) {
        if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
            isDragging.value = true;
            mouseX.value = event.touches[0].clientX + displayBoard.value.left;
            mouseY.value = event.touches[0].clientY + displayBoard.value.top;
            playerPlane.value?.changePositionByCenter(mouseX.value, mouseY.value)
            event.preventDefault()
        }
    };
    function onTouchMove(event: TouchEvent) {
        if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
            if (isDragging.value) {
                mouseX.value = event.touches[0].clientX + displayBoard.value.left;
                mouseY.value = event.touches[0].clientY + displayBoard.value.top;
                playerPlane.value?.changePositionByCenter(mouseX.value, mouseY.value)
            }
        }
    };
    function onTouchEnd() {
        isDragging.value = false;
    }

    function onMouseDown(event: MouseEvent) {
        mouseX.value = event.pageX + displayBoard.value.left;
        mouseY.value = event.pageY + displayBoard.value.top;

        if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
            isDragging.value = true;
            mouseX.value = event.pageX + displayBoard.value.left;
            mouseY.value = event.pageY + displayBoard.value.top;
            playerPlane.value?.changePositionByCenter(mouseX.value, mouseY.value)
            event.preventDefault()
        }
    };
    function onMouseMove(event: MouseEvent) {
        if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
            if (isDragging.value) {
                mouseX.value = event.pageX + displayBoard.value.left;
                mouseY.value = event.pageY + displayBoard.value.top;
                playerPlane.value?.changePositionByCenter(mouseX.value, mouseY.value)

            }
        }

    };
    function onMouseUp() {
        isDragging.value = false;
    }
    // 拖拽过程中子弹自动射击
    function autoShotBullet() {
        console.log("autoshot start")
        let interval = 20
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("autoShot stop")
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
                if (isDragging.value) {
                    if (playerPlane.value!.comData.shot_cd! >= 0) {
                        playerPlane.value!.comData.shot_cd! -= interval
                    } else {
                        bulletShoot();
                        playerPlane.value!.resetShotCD();
                    }
                }
            }
        }, 20)
    }


    // 判断子弹和敌人是否碰撞
    function checkBulletsAndEnemys() {
        console.log("checkBulletsAndEnemy")
        // console.log(asteroids.value)
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("checkBulletsAndEnemy stop")
                clearInterval(id);
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            for (let bd of bulletDatas.value) {
                for (let asteroid_index = asteroids.value!.length - 1; asteroid_index >= 0; asteroid_index--) {
                    // console.log("@@@",asteroids.value![asteroid_index].comData)
                    if (bd.isActive && asteroids.value![asteroid_index].comData.isActive) {
                        if (isCollision(bd, asteroids.value![asteroid_index].comData)) {
                            console.log("isCollision")
                            bd.isActive = false;
                            // console.log(asteroids.value![asteroid_index])
                            asteroids.value![asteroid_index].asteroidExplode();
                            gameConfig.value.score += asteroids.value![asteroid_index].comData.score!;
                            destoryRecord.value.asteroid += 1;
                        }
                    }

                }
                for (let enemyPlane of enemySmallPlanes.value!) {
                    if (bd.isActive && enemyPlane.comData.isActive) {
                        if (isCollision(bd, enemyPlane.comData)) {
                            console.log("isCollision")
                            bd.isActive = false;
                            enemyPlane.enemyExplode();
                            gameConfig.value.score += enemyPlane.comData.score!;
                            destoryRecord.value.enemyPlane += 1;
                        }
                    }
                }
                // 大型敌人与自机子弹检测               
                for (let enemyPlane of enemyBigPlanes.value!) {
                    // 优先检测敌机与子弹是否均有效
                    if (bd.isActive && enemyPlane.comData.isActive) {
                        // 再检测子弹与敌机是否碰撞
                        if (isCollision(bd, enemyPlane.comData)) {
                            // 根据情况执行不同逻辑
                            if (enemyPlane.comData.hp! > 0) {
                                bd.isActive = false;
                                enemyPlane.comData.hp! -= 1;
                            } else {
                                console.log("big enemy destory")
                                bd.isActive = false;
                                enemyPlane.enemyExplode();
                                gameConfig.value.score += enemyPlane.comData.score!;
                                destoryRecord.value.enemyPlaneBig += 1;
                            }
                        }
                    }
                }
                // boss敌机与自机子弹检测               

                if (bd.isActive && enemyBossPlane.value?.comData.isActive) {
                    // 再检测子弹与敌机是否碰撞
                    if (isCollision(bd, enemyBossPlane.value?.comData)) {
                        // 根据情况执行不同逻辑
                        // boss处于保护状态
                        if(enemyBossPlane.value.comData.isProtected){
                            bd.isActive = false;
                        }
                        else if (enemyBossPlane.value?.comData.hp! > 0) {
                            bd.isActive = false;
                            enemyBossPlane.value!.comData.hp! -= 1;
                        } else {
                            console.log("boss destory")
                            bd.isActive = false;
                            enemyBossPlane.value?.enemyExplode();
                            gameConfig.value.score += enemyBossPlane.value?.comData.score!;
                            // destoryRecord.value.enemyPlaneBig += 1;
                        }
                    }
                }

            }
        }, 20)
    }

    // 判断自机和敌方是否碰撞
    function checkPlayerPlaneAndEnemys() {
        console.log("checkPlayerPlaneAndEnemys")
        // console.log(asteroids.value)
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("checkPlayerPlaneAndEnemys stop")
                clearInterval(id);
                //需要return,否则最后一次循环会完整执行一遍
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            //如果角色处于保护状态则不检测
            // TODO :保护状态检测盾牌碰撞，否则else逻辑无法检测盾牌击坠敌方
            if (playerPlane.value?.comData.isProtected) {

            } else {
                //检测陨石
                for (let asteroid of asteroids.value!) {
                    // console.log("@@@",asteroids.value![asteroid_index].comData)
                    // 陨石有效且自机与陨石相撞（先检测陨石是否有效，因为需要播放摧毁动画，此时位置未重置但陨石已失效）
                    if (asteroid.comData.isActive && isCollision(playerPlane.value!.comData, asteroid.comData)) {
                        console.log("asteroid isCollision")
                        //自机处于护盾状态
                        if (playerPlane.value!.shieldData.isActive) {
                            console.log("shield protect")
                            asteroid.comData.isActive = false;
                            asteroid.asteroidExplode()
                            destoryRecord.value.asteroid += 1;
                        } else {
                            playerPlane.value!.comData.hp! -= 1;
                            if (playerPlane.value!.comData.hp! > 0) {
                                playerPlane.value!.hurt(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                                // playerPlane.value!.getShield()
                                asteroid.comData.isActive = false;
                                asteroid.asteroidExplode()
                            }
                        }
                    }
                }
                //检测敌机
                for (let enemyPlane of enemySmallPlanes.value!) {
                    // 同理检测敌机有效且与自机相撞
                    if (enemyPlane.comData.isActive && isCollision(playerPlane.value!.comData, enemyPlane.comData)) {
                        console.log("enemyPlane isCollision")
                        //自机处于护盾状态
                        if (playerPlane.value!.shieldData.isActive) {
                            console.log("shield protect")
                            enemyPlane.comData.isActive = false;
                            enemyPlane.enemyExplode();
                            destoryRecord.value.enemyPlane += 1;
                        } else {
                            playerPlane.value!.comData.hp! -= 1;
                            if (playerPlane.value!.comData.hp! > 0) {
                                playerPlane.value!.hurt(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                                // playerPlane.value!.getShield()
                                enemyPlane.comData.isActive = false;
                                enemyPlane.enemyExplode();
                            }
                        }

                    }
                }
                // 检测大型敌机
                for (let enemyPlane of enemyBigPlanes.value!) {
                    // 同理检测敌机有效且与自机相撞
                    if (enemyPlane.comData.isActive && isCollision(playerPlane.value!.comData, enemyPlane.comData)) {
                        console.log("enemyBossPlane isCollision")
                        //自机处于护盾状态
                        if (playerPlane.value!.shieldData.isActive) {
                            console.log("shield protect")
                            enemyPlane.comData.isActive = false;
                            enemyPlane.enemyExplode();
                            destoryRecord.value.enemyPlaneBig += 1;
                        } else {
                            playerPlane.value!.comData.hp! -= 1;
                            if (playerPlane.value!.comData.hp! > 0) {
                                playerPlane.value!.hurt(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                                // playerPlane.value!.getShield()
                                enemyPlane.comData.isActive = false;
                                enemyPlane.enemyExplode();
                            }
                        }

                    }
                }
                // 检测boss敌机
                // 检测boss敌机有效且与自机相撞
                if (enemyBossPlane.value?.comData.isActive && isCollision(playerPlane.value!.comData, enemyBossPlane.value?.comData)) {
                    console.log("enemyBigPlane isCollision")
                    //自机处于护盾状态
                    if (playerPlane.value!.shieldData.isActive) {
                        console.log("shield protect")
                        // enemyPlane.comData.isActive = false;
                        // enemyPlane.enemyExplode();
                        // destoryRecord.value.enemyPlaneBig += 1;
                    } else {
                        playerPlane.value!.comData.hp! -= 1;
                        if (playerPlane.value!.comData.hp! > 0) {
                            playerPlane.value!.hurt(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                            // playerPlane.value!.getShield()
                            // enemyPlane.comData.isActive = false;
                            // enemyPlane.enemyExplode();
                        }
                    }

                }
                // 检测敌方子弹_1
                for (let enemyBullet of enemyBullets1.value!) {
                    // 同理检测敌方子弹有效且与自机相撞
                    if (enemyBullet.comData.isActive && isCollision(playerPlane.value!.comData, enemyBullet.comData)) {
                        console.log("enemyBigPlane isCollision")
                        //自机处于护盾状态
                        if (playerPlane.value!.shieldData.isActive) {
                            console.log("shield protect")
                            enemyBullet.comData.isActive = false;
                        } else {
                            playerPlane.value!.comData.hp! -= 1;
                            if (playerPlane.value!.comData.hp! > 0) {
                                playerPlane.value!.hurt(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                                // playerPlane.value!.getShield()
                                enemyBullet.comData.isActive = false;
                            }
                        }

                    }
                }

            }
        }, 20)
    }

    // 判断自机与道具
    function checkPlayerAndItem() {
        console.log("checkPlayerAndItem")
        // console.log(asteroids.value)
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("checkPlayerAndItem stop")
                clearInterval(id);
                //需要return,否则最后一次循环会完整执行一遍
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            // 检测护盾
            if (shieldItem.value?.comData.isActive) {
                checkItem(shieldItem.value.comData);
                // console.log("is get item", isCollision(playerPlane.value?.comData!, shieldItem.value.comData));
            }

            // 检测额外生命道具
            if (extraLifeItem.value?.comData.isActive) {
                checkItem(extraLifeItem.value.comData);
                // checkPlayerAndItem(extraLifeItemData)
            }

            // 检测火力强化道具
            for (let powerUpItem of powerUpItems.value!) {
                if (powerUpItem.comData.isActive) {
                    checkItem(powerUpItem.comData, powerUpItem)
                }
            }


        }, 20)
    }

    // 发射子弹
    async function bulletShoot() {
        // console.log('bulletShoot')
        // 不能提前移动子弹下标，因为子弹移动逻辑存在延迟，并发多次子弹射击时将导致冲突
        // currentBullet = (currentBullet + 1) % bulletCount;
        bullets1.value![currentBullet].reset()
        // 延迟0.02秒执行，保证子弹的移动线程结束
        setTimeout(() => {
            // console.log("bullet id", currentBullet)
            bullets1.value![currentBullet].comData.left = getBaseComCenter(playerPlane.value?.comData!).center_x - playerPlane.value?.comData.width! / 2;
            bullets1.value![currentBullet].comData.top = getBaseComCenter(playerPlane.value?.comData!).center_y - playerPlane.value?.comData.height!;
            validateHitbox(bullets1.value![currentBullet].comData)
            bullets1.value![currentBullet].move()
            //子弹下标后移
            currentBullet = (currentBullet + 1) % bulletCount;
        }, 20)
    }

    // 敌机发射子弹
    /**
     * @param enemyPlaneComData 敌机组件
     */
    async function enemyBulletShoot(enemyPlaneComData: BaseCom) {
        // console.log('bulletShoot')       
        enemyBullets1.value![currentEnemyBullet].reset()
        // 延迟0.02秒执行，保证子弹的移动线程结束   
        setTimeout(() => {
            // console.log("bullet id", currentEnemyBullet)
            // 40为敌方子弹的宽度，暂时使用硬编码
            enemyBullets1.value![currentEnemyBullet].comData.left = getBaseComCenter(enemyPlaneComData).center_x - 30 / 2;
            enemyBullets1.value![currentEnemyBullet].comData.top = getBaseComCenter(enemyPlaneComData).center_y;
            validateHitbox(enemyBullets1.value![currentEnemyBullet].comData)
            // console.log(currentEnemyBullet);
            // console.log(enemyBullets1.value![currentEnemyBullet].comData.top)
            enemyBullets1.value![currentEnemyBullet].move()
            //子弹下标后移
            currentEnemyBullet = (currentEnemyBullet + 1) % bulletCount;
        }, 20)
    }
    // 大型/boss敌机发射子弹
    function enemyPlaneShot() {
        console.log("big enemy Plane start shoting")
        let interval = 20;
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("big enemy Plane stop shot")
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            if (gameConfig.value.isGameStart && !gameConfig.value.isGameover) {
                for (let enemyBigPlane of enemyBigPlanes.value!) {
                    if (enemyBigPlane.comData.isActive) {
                        if (enemyBigPlane.comData.shot_cd! > 0) {
                            enemyBigPlane.comData.shot_cd! -= interval;
                        } else {
                            // console.log("shot!!")
                            // 在敌机中心生成一个敌方子弹并移动
                            enemyBulletShoot(enemyBigPlane.comData);
                            //重置敌机子弹发射cd
                            enemyBigPlane.resetShotCD()
                        }
                    }
                }
                if (enemyBossPlane.value?.comData.isActive) {
                    if (enemyBossPlane.value?.comData.shot_cd! > 0) {
                        enemyBossPlane.value!.comData.shot_cd! -= interval;
                    } else {
                        // console.log("shot!!")
                        // 在敌机中心生成一个敌方子弹并移动
                        enemyBulletShoot(enemyBossPlane.value?.comData);
                        //重置敌机子弹发射cd
                        enemyBossPlane.value?.resetShotCD()
                    }
                }
            }
        }, interval)

    }

    // 检测并移除失效子弹
    function checkBullets() {
        console.log("checkBullet")
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("checkBullet stop")
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }

            //自机子弹检测
            for (let bullet of bullets1.value!) {
                if (bullet.comData.isActive == false) {
                    bullet.reset();
                }
            }
            // 敌机子弹检测
            for (let enemyBullet of enemyBullets1.value!) {
                if (enemyBullet.comData.isActive == false) {
                    enemyBullet.reset();
                }
            }
        }, 20)
    }



    // 越界组件重置
    function checkOutBoardCom() {
        console.log("checkOutBoardComs")
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("stop checkOutBoardComs")
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            for (let i = asteroids.value!.length - 1; i >= 0; i--) {
                if (asteroids.value![i].comData.top > displayBoard.value.height) {
                    asteroids.value![i].randomReset();
                }
            }
            for (let enemySmallPlane of enemySmallPlanes.value!) {
                if (enemySmallPlane.comData.top > displayBoard.value.height) {
                    enemySmallPlane.randomReset();
                }
            }
            for (let enemyBigPlane of enemyBigPlanes.value!) {
                if (enemyBigPlane.comData.top > displayBoard.value.height) {
                    enemyBigPlane.randomReset();
                }
            }
            // 道具组件越界检测
            if (shieldItem.value?.comData.top! > displayBoard.value.height) {
                shieldItem.value?.randomReset();
            }
            if (extraLifeItem.value?.comData.top! > displayBoard.value.height) {
                extraLifeItem.value?.randomReset();
            }
            for (let powerUpItem of powerUpItems.value!) {
                if (powerUpItem.comData.top! > displayBoard.value.height) {
                    powerUpItem.randomReset();
                }
            }

        }, 20)
    }
    // 分数检测
    function checkScore() {
        // 监听游戏系统分数
        // 设置定时任务，若分数大于一定值后执行逻辑，并移除定时任务
        let id1 = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("checkScore stop")
                clearInterval(id1);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            if (gameConfig.value.score >= 0) {
                // 分数大于100，大型敌机开始移动
                console.log("enemyBigPlane Start Moving")
                for (let i = enemyBigPlanes.value!.length - 1; i >= 0; i--) {
                    enemyBigPlanes.value![i].moveStyle2();
                }
                // 启动大型敌机发射子弹线程
                enemyPlaneShot()
                clearInterval(id1);
                return;
            }
        }, 20)
        // 设置定时任务，若分数大于一定值后执行逻辑，并移除定时任务
        let id2 = setInterval(() => {
            if (gameConfig.value.isGameover) {
                clearInterval(id1);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            // 启动boss相关动作
            if (gameConfig.value.score >= 1000 && !gameConfig.value.isBossAppear) {
                console.log("enemyBossPlane Start Moving")
                gameConfig.value.isBossAppear = true;
                // 执行boss入场
                bossActions()
                // 定期执行boss动作

                clearInterval(id2);
                return;
            }
        }, 20)

    }

    function bossActions() {

        //启动boss入场动作（一次性）
        enemyBossPlane.value?.bossEnterAction();
        //启动boss常态移动任务
        enemyBossPlane.value?.bossMove();
        //每10秒尝试执行一次特殊动作
        let cd = 10000;
        let interval = 20;
        console.log("Boss特殊移动检测线程启动")
        let id = setInterval(() => {
            if (gameConfig.value.isGameover || !enemyBossPlane.value?.comData.isActive) {
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            cd -= interval;
            if (cd <= 0) {
                //如果触发动作1，则cd重置为10，否则置为5
                if (!enemyBossPlane.value?.comData.isAction) {
                    enemyBossPlane.value?.bossAction_1();
                    cd = 10000;
                    return;
                }
                cd = 5000;
            }

        }, interval)
    }

    // 道具生成
    function itemGenerate() {
        console.log("itemGenerate start")
        shieldItem.value?.randomReset()
        extraLifeItem.value?.randomReset()
        for (let powerUpItem of powerUpItems.value!) {
            powerUpItem.randomReset()
        }

        //道具组件开启移动线程
        // shieldItem.value?.moveStyle1()
        // extraLifeItem.value?.moveStyle1()
        // powerUpItem.value?.moveStyle1()
        let interval = 20;
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("itemGenerate stop")
                clearInterval(id);
                return;
            }
            // 如果游戏为暂停状态，不执行后续逻辑
            if (gameConfig.value.isPaused) {
                return;
            }
            // 每击破5个大型敌机生成一个护盾道具
            if (destoryRecord.value.enemyPlaneBig - itemGeneratedTimes.value.shieldItem * 5 >= 5) {
                console.log("generate sheild")
                console.log(shieldItem.value!.comData.isActive!)
                // 如果护盾组件没有生效，则护盾组件重置并开始移动
                if (!shieldItem.value!.comData.isActive!) {
                    shieldItem.value!.randomReset();
                    shieldItem.value!.comData.isActive = true;
                    shieldItem.value!.moveStyle1();
                }
                itemGeneratedTimes.value.shieldItem += 1;
            }
            // 每500分生成一个加命道具
            if (gameConfig.value.score - itemGeneratedTimes.value.extraLifeItem * 500 >= 500) {
                // 如果额外血量组件未生效，则重置并开始移动
                console.log("generate extraLife")
                if (!extraLifeItem.value!.comData.isActive!) {
                    extraLifeItem.value!.randomReset();
                    extraLifeItem.value!.moveStyle1();
                }
                itemGeneratedTimes.value.extraLifeItem += 1;
            }
            // 经过固定cd生成一个火力道具
            powerUpItemCd -= interval
            if (powerUpItemCd <= 0) {
                console.log("generate powerUp")
                // 选择一个未生效的火力道具组件开始移动
                for (let powerUpItem of powerUpItems.value!) {
                    console.log("powerupitem", powerUpItem.comData.isActive)
                    if (!powerUpItem.comData.isActive) {
                        powerUpItem.randomReset()
                        powerUpItem.comData.isActive = true;
                        powerUpItem.moveStyle2();
                        break;
                    }
                }
                itemGeneratedTimes.value.powerUpItem += 1;
                powerUpItemCd = powerUpItemCdDefault
            }
        }, interval)
    }

    /**
     * 
     * @param item 道具组件数值
     * @param itemCom  道具组件对象
     */
    function checkItem(item: Item, itemCom?: any) {

        if (isCollision(playerPlane.value!.comData, item)) {
            console.log("item get")
            console.log(item.type)
            if (item.type == "shield") {
                console.log("get shield")
                playerPlane.value!.getShield();
                shieldItem.value?.comData.isActive != false;
                shieldItem.value?.randomReset()
            } else if (item.type == "extraLife") {
                console.log("get extraLife")
                if (playerPlane.value!.comData.hp! < playerPlane.value!.comData.max_hp!) {
                    playerPlane.value!.comData.hp! += 1;
                    playerPlane.value!.setPlaneStatusImg(playerPlane.value!.comData.max_hp! - playerPlane.value!.comData.hp!)
                }
                extraLifeItem.value?.comData.isActive != false;
                extraLifeItem.value?.randomReset();
            } else if (item.type == "powerUp") {
                console.log("get powerUp")
                playerPlane.value?.getPowerUp()
                itemCom.comData.isActive != false;
                itemCom.randomReset();
            }

        }
    }




    // 监听游戏是否结束
    function gameOverCheck() {
        let id = setInterval(() => {
            if (gameConfig.value.isGameover) {
                console.log("stop gameOverCheck");
                clearInterval(id);
                return;
            } else {
                if (playerPlane.value?.comData.hp! <= 0) {
                    gameConfig.value.isGameover = true;
                }

            }
        }, 10)
    }

    onMounted(() => {


    })



</script>
<style scoped>
    .game {
        text-align: left;
        /* width: 600px;
        height: 300px; */
        /* border: 2px solid black; */
        position: relative;
        display: flex;
        overflow: hidden;
        border: 2px solid black;
        justify-content: center;
        /* background-image: url('/img/background/background_1.png'); */
        /* background-repeat: repeat-x; */

    }

    .border_background {
        /* background-image: url('/img/background/background_1.png'); */
        /* background-color: aquamarine */
        background-image: url('/img/background/space_1.png');
        background-size: auto 100%;
        background-repeat: repeat;

    }

    .border_background_move {
        animation-name: border_background_move;
        animation-duration: 8s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-fill-mode: forwards;
    }

    @keyframes border_background_move {
        from {
            background-position: 0% 0px;
        }

        to {
            background-position: 0% 500px
        }
    }

    .gameover_board {

        text-align: center;

    }

    .warning_board {
        text-align: center;
        animation: blink 0.5s infinite;
    }

    @keyframes blink {
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
<template>
    <div class="game">

        <h1> This is game Page</h1>
        <div class="game">
            <h1>跨栏小游戏</h1>
            <p>按空格键跳跃，避开障碍物！</p>
            <div class="game-container">
                <!-- 主角 -->
                <div ref="player" class="player"></div>
                <!-- 障碍物 -->
                <div v-for="(obstacle, index) in obstacles" :key="index" class="obstacle"
                    :style="{ bottom: obstacle.height + 'px' }"></div>
            </div>
            <p v-if="gameOver" class="game-over">游戏结束！</p>
        </div>
    </div>
</template>
<script lang='ts'>
    export default
        {
            name: "GamePage"
        }
</script>
<script lang='ts' setup>
    import { ref, reactive, onMounted } from 'vue';

    const player = ref<HTMLElement | null>(null);
    const obstacles = reactive<{ height: number }[]>([]);
    let gameOver = ref(false);


    // 添加障碍物
    const addObstacle = () => {
        const minHeight = 50; // 最小障碍物高度
        const maxHeight = 200; // 最大障碍物高度
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        obstacles.push({ height });
    };

    // 游戏结束
    const endGame = () => {
        gameOver.value = true;
    };

    // 碰撞检测
    const checkCollision = () => {
        if (!player.value || gameOver.value) return;

        const playerRect = player.value.getBoundingClientRect();
        const playerTop = playerRect.top;
        const playerBottom = playerRect.bottom;

        obstacles.forEach(obstacle => {
            const obstacleElement = document.querySelector('.obstacle') as HTMLElement;
            const obstacleRect = obstacleElement.getBoundingClientRect();
            const obstacleTop = obstacleRect.top;
            const obstacleBottom = obstacleRect.bottom;

            if (playerBottom >= obstacleTop && playerTop <= obstacleBottom) {
                endGame();
            }
        });
    };

    // 监听空格键跳跃
    const handleJump = (event: KeyboardEvent) => {
        if (event.code === 'Space' && !gameOver.value) {
            // 实现跳跃动画或移动效果
            console.log('跳跃！');
        }
    };

    // 监听键盘事件
    onMounted(() => {
        window.addEventListener('keydown', handleJump);
    });

    // 添加障碍物定时器
    setInterval(addObstacle, 1500);


    // 碰撞检测定时器
    setInterval(checkCollision, 100);
</script>

<style scoped>
    .game {
        text-align: center;
        margin-top: 20px;
    }

    .game-container {
        position: relative;
        height: 300px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        overflow: hidden;
    }

    .player {
        position: absolute;
        left: 50px;
        bottom: 0;
        width: 30px;
        height: 30px;
        background-color: blue;
    }

    .obstacle {
        position: absolute;
        width: 30px;
        height: 30px;
        background-color: red;
        left: calc(100% + 30px);
        bottom: 0;
    }

    .game-over {
        margin-top: 20px;
        font-weight: bold;
        color: red;
    }
</style>
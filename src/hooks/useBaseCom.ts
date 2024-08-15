import type { BaseCom, Player, Enemy, Item,EnemyBoss } from "@/types";
import { computed } from "vue";

export function toStyle(config: BaseCom) {
  return {
    width: `${config.width}px`,
    height: `${config.height}px`,
    top: `${config.top}px`,
    left: `${config.left}px`,
    backgroundImage: `url('${config.display_img}')`,
    backgroundSize: "auto 100%",
  };
}
export function toSizeStyle(config: BaseCom) {
  return {
    width: `${config.width}px`,
    height: `${config.height}px`,
    top: `${config.top}px`,
    left: `${config.left}px`,
    // backgroundSize: "auto 100%",
  };
}

export function initBaseCom(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number
): BaseCom;
export function initBaseCom(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  display_img?: string
): BaseCom;
export function initBaseCom(
  w?: number,
  h?: number,
  left?: number,
  top?: number
): BaseCom;
export function initBaseCom(): BaseCom;
/**
 *
 * @param w
 * @param h
 * @param top
 * @param left
 * @param h_w 碰撞箱x轴长度
 * @param h_h 碰撞箱y轴长度
 * @returns
 */
export function initBaseCom(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  display_img?: string
): BaseCom {
  let center = {
    x: left! + w! / 2,
    y: top! + h! / 2,
  };
  let h_l = h_w ? center.x - h_w / 2 : left;
  let h_t = h_h ? center.y - h_h / 2 : top;
  let baseCom: BaseCom = {
    width: w || 50,
    height: h || 50,
    top: top || 0,
    left: left || 0,
    hitbox_height: h_h || 50,
    hitbox_width: h_w || 50,
    hitbox_left: h_l || left || 0,
    hitbox_top: h_t || top || 0,
    isActive: false,
    isPause: false,
    display_img: display_img || "",
  };

  return baseCom;
}

export function initPlayer(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number
): Player;
export function initPlayer(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  display_img?: string
): Player;
export function initPlayer(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  speed?: number
): Player;
export function initPlayer(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  display_img?: string
): Player {
  let baseCom = initBaseCom(w, h, left, top, h_w, h_h, display_img);
  let com: Player = {
    ...baseCom,
    speed: speed || 200,
    isProtected: false,
    shot_cd: 200,
    shield_duration:0,
    hp:4,
    max_hp:4,
    power_level:0,
    max_power_level:2,
  };
  return com;
}
export function initEnemy(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  score?: number
): Enemy;
export function initEnemy(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  score?: number,
  display_img?: string
): Enemy;
export function initEnemy(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  speed?: number,
  score?: number
): Enemy;
export function initEnemy(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  score?: number,
  display_img?: string
): Enemy {
  let baseCom = initBaseCom(w, h, left, top, h_w, h_h, display_img);
  let enemy: Enemy = {
    ...baseCom,
    isProtected:false,
    speed: speed || 200,
    score: score || 10,
    type: "",
  };
  return enemy;
}

export function initEnemyBoss(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  speed?: number,
  score?: number,
  display_img?: string
): EnemyBoss {
  let baseCom = initBaseCom(w, h, left, top, h_w, h_h, display_img);
  let enemy: EnemyBoss = {
    ...baseCom,
    isProtected:false,
    speed: speed || 200,
    score: score || 10,
    type: "",
  };
  return enemy;
}

export function initItem(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
) :Item;
export function initItem(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  type?: string,
) :Item;
export function initItem(
  w?: number,
  h?: number,
  left?: number,
  top?: number,
  h_w?: number,
  h_h?: number,
  type?:string,
  speed?: number,
  display_img?: string
) :Item {
  let baseCom = initBaseCom(w, h, left, top, h_w, h_h, display_img);
  let item: Item = {
    ...baseCom,
    speed: speed || 200,
    type: type || "commonItem",
    item_cd:10000,
  };
  return item;
}

//获取BaseCom的中心坐标
export function getBaseComCenter(baseCom: BaseCom) {
  return {
    center_x: baseCom.left + baseCom.width / 2,
    center_y: baseCom.top + baseCom.height / 2,
  };
}

//判断BaseCom是否碰撞
export function isCollision(player: BaseCom, enemy: BaseCom): boolean {
  // 计算椭圆的半径
  const playerRadiusX = player.hitbox_width / 2;
  const playerRadiusY = player.hitbox_height / 2;
  const enemyRadiusX = enemy.hitbox_width / 2;
  const enemyRadiusY = enemy.hitbox_height / 2;

  // 计算半径之和
  const radiusSumX = playerRadiusX + enemyRadiusX;
  const radiusSumY = playerRadiusY + enemyRadiusY;

  // 计算椭圆的中心点
  const playerCenterX = player.hitbox_left + playerRadiusX;
  const playerCenterY = player.hitbox_top + playerRadiusY;
  const enemyCenterX = enemy.hitbox_left + enemyRadiusX;
  const enemyCenterY = enemy.hitbox_top + enemyRadiusY;

  // 计算椭圆之间的距离
  const dx = Math.abs(playerCenterX - enemyCenterX);
  const dy = Math.abs(playerCenterY - enemyCenterY);

  // 判断更精确的情况
  const distanceSquared =
    (dx * dx) / (radiusSumX * radiusSumX) +
    (dy * dy) / (radiusSumY * radiusSumY);

  return distanceSquared <= 1;
}

//更新判定区域位置
export function validateHitbox(baseCom: BaseCom) {
  let center = getBaseComCenter(baseCom);
  baseCom.hitbox_left = center.center_x - baseCom.hitbox_width / 2;
  baseCom.hitbox_top = center.center_y - baseCom.hitbox_height / 2;
}

// 在baseCom中心创建一个指定长宽的baseCom
export function createBaseComAtMiddle(
  boardCom: BaseCom,
  width: number,
  height: number
): BaseCom {
  let center = getBaseComCenter(boardCom);
  return initBaseCom(
    width,
    height,
    center.center_x - width / 2,
    center.center_y - height / 2
  );
}

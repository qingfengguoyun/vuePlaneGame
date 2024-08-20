import { readonly } from "vue";

export interface BaseCom{
    id?:number,
    top:number,
    left:number,
    width:number,
    height:number,
    hitbox_width:number,
    hitbox_height:number,
    hitbox_top:number,
    hitbox_left:number,
    display_img:string,
    isActive:boolean,
    isPause:boolean,
}

export interface HitBox extends BaseCom{

}

export interface Enemy extends BaseCom{

    type?: string,
    isProtected:boolean,
    speed?:number,
    score?:number,
    hp?:number,
    max_hp?:number,
    shot_cd?:number

}

export interface EnemyBoss extends Enemy{
    
    // 是否正在执行动作
    isAction?:boolean,
    bossAction_1?:boolean,
    bossAction_2?:boolean,
    bossEnter?:boolean,
}

export interface Player extends BaseCom{

    speed?:number,
    isProtected:boolean,
    shot_cd?:number
    shield_duration?:number
    hp?:number,
    max_hp?:number,
    // 火力等級
    power_level?:number,
    max_power_level?:number,

}

export interface Item extends BaseCom{
    type?:string,
    speed?:number,
    item_cd?:number,
}

export interface GameConfig {
    isGameStart:boolean,
    isGameover:boolean,
    isPaused:boolean,
    score:number,
    lifeRemain?:number,
    isBossClear?:boolean,
    isBossAppear?:boolean
}
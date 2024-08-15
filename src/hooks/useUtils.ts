/**
 * 还原对象的值（不改变地址）（仅还原基础类型，无法还原函数）
 * @param obj
 * @param defaultObj
 */
export function resetObjectTodefault(obj: any, defaultObj: any): void {
  console.log(obj, defaultObj);
  for (const key in defaultObj) {
    if (obj.hasOwnProperty(key)) {
      console.log(typeof obj[key], obj[key]);
      if (typeof obj[key] === "object" && obj[key] !== null) {
        resetObjectTodefault(obj[key], defaultObj[key]);
      } else {
        obj[key] = defaultObj[key];
      }
    }
  }
}

export function getRamdomInit(min: number, max: number) {
  min = Math.ceil(min); // 向上取整，确保取值范围包括 min
  max = Math.floor(max); // 向下取整，确保取值范围包括 max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

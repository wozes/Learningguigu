/*
 * @lc app=leetcode.cn id=2434 lang=javascript
 *
 * [2434] 使用机器人打印字典序最小的字符串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
 */
var robotWithString = function(s) {
    let t = [];
    let str = [];
    let arrS = [];
    for(let i = 0;i<s.length;i++){
        arrS[i] = s[i];
        t.push(arrS.shift());
        str.push(t.pop()); 
    }
    return str.join('');
};
// @lc code=end


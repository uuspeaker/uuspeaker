const format = (date, fmt) => {
  Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  return date.format(fmt)
}

const getToday = () => {
  return format(new Date(),'yyyyMMdd')
}
const getFirstDayOfWeek = () => {
  var today = new Date()
  if (today.getDay() == 0){
    today.setDate(today.getDate() - 6);
  }else{
    today.setDate(today.getDate() - today.getDay() + 1);
  }
  
  return format(today,'yyyyMMdd')
}
const getFirstDayOfMonth = () => {
  var today = new Date()
  today.setDate(1);
  return format(today, 'yyyyMMdd')
}

const getBetweenDays = (start, end) => {
  start.setHours(0)
  start.setMinutes(0)
  start.setSeconds(0)
  start.setMilliseconds(0)
  end.setHours(0)
  end.setMinutes(0)
  end.setSeconds(0)
  end.setMilliseconds(0)
  var betweenDays = (end - start) / (24 * 60 * 60 * 1000)
  return betweenDays
}

module.exports = { 
  format,
  getToday,
  getFirstDayOfWeek,
  getFirstDayOfMonth,
  getBetweenDays
}

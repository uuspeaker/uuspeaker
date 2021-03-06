const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
const dateUtil = require('../common/dateUtil.js')

/**
 * 获取用户ID 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getOpenId = async (ctx) => {
  var skey = ctx.header['x-wx-skey']
  var openIds = await mysql('cSessionInfo').select('open_id').where({ 'skey': skey })
  return openIds[0].open_id
}

/**
 * 获取用户ID 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getUserInfo = async (userId) => {
  var userInfo = await mysql('cSessionInfo').select('user_info').where({ 'open_id': userId })
  return getTailoredUserInfo(userInfo[0].user_info)
}

/**
 * 获取用户ID 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getUserInfoByKey = async (ctx) => {
  var skey = ctx.header['x-wx-skey']
  var userInfo = await mysql('cSessionInfo').select('user_info').where({ 'skey': skey  })
  return getTailoredUserInfo(userInfo[0].user_info)
}

/**
 * 剪裁用户信息
 * userInfoStr 系统保存的原始用户信息
 * 返回：{nickName:用户昵称, avatarUrl:头像url}
 */
var getTailoredUserInfo = (userInfoStr) => {
  //return JSON.parse(userInfoStr)
  var userInfoTmp = JSON.parse(userInfoStr)
  var userInfo = {}
  userInfo.nickName = userInfoTmp.nickName
  userInfo.avatarUrl = userInfoTmp.avatarUrl
  userInfo.userId = userInfoTmp.openId
  return userInfo
}

//获取用户总积分 
var getTotalScore = async userId => {
  //获取用户积分总额
  var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId })
  return totalScoreRes[0]['totalScore']
}

//获取用户参会积分 
var getMeetingScore = userId => {
  return getScore(userId,1)
}

//获取用户演讲积分 
var getSpeakerScore = userId => {
  return getScore(userId, 2)
}

//获取用户点评积分 
var getEvaluatorScore = userId => {
  return getScore(userId, 3)
}

//获取用户主持积分 
var getHostScore = userId => {
  return getScore(userId, 4)
}

//获取用户复盘积分 
var getReportScore = userId => {
  return getScore(userId, 5)
}

//根据积分类型获取用户参会积分
var getScore = async (userId,scoreType) => {
  var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: scoreType })
  return totalScoreRes[0]['totalScore']
}

//保存用户个人介绍
var saveIntroduction = async (audioId, userId) => {
  await mysql('user_introduction').insert({
    user_id: userId,
    introduce_audio_id: audioId
  })
}

//查询用户个人介绍
var getIntroduction = async (userId) => {
  var data = await mysql('user_introduction').where({
    user_id: userId
  }).orderBy('create_date','desc')
  for (var i = 0; i < data.length; i++) {
    data[i].src = audioService.getSrc(data[i].introduce_audio_id)
  }
    return data
}

//删除用户个人介绍
var deleteIntroduction = async (userId) => {
  await mysql('user_introduction').where({
    user_id: userId
  }).del()
}


//查询用户学习总时间
var getTotalStudyDuration = async (userId) => {
  var data = await mysql('user_study_duration').where({
    user_id: userId,
  }).select(mysql.raw('sum(study_duration) as totalDuration'))
  if (data[0].totalDuration == null){
    return 0
  }else{
    return data[0].totalDuration
  }
}

//查询用户学习总时间
var getTodayStudyDuration = async (userId) => {
  var today = dateUtil.format(new Date(),'yyyyMMdd')
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).andWhere('user_study_duration.study_date', '=', today).select(mysql.raw('sum(study_duration) as totalDuration'))
  if (data[0].totalDuration == null) {
    return 0
  } else {
    return data[0].totalDuration
  }
}

//查询用户学习总时间
var getTotalStudyInfo = async (userId) => {
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).groupBy('study_type').select('study_type',mysql.raw('sum(study_duration) as totalDuration'), mysql.raw('sum(study_amount) as totalAmount'))
  return data
}

//查询用户学习总时间
var getTodayStudyInfo = async (userId) => {
  var today = dateUtil.format(new Date(),'yyyyMMdd')
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).andWhere('study_date', '=', today).groupBy('study_type').select('study_type',mysql.raw('sum(study_duration) as totalDuration'), mysql.raw('sum(study_amount) as totalAmount'))
  return data
}


//查询用户积分数据
var getStudyReport = async (userId) => {
  var limit = 7
  var offset = 0
  var data = await mysql('user_study_duration').where({'user_id':userId}).select('study_date', mysql.raw('sum(study_duration) as totalDuration')).groupBy('study_date').orderBy('study_date', 'desc').limit(limit).offset(offset)
  return data
}
//查询用户当天学习报告
var getStudyReportToday = async (userId) => {
  var today = dateUtil.getToday()
  var data = await mysql('user_study_duration').where({ 'user_id': userId, 'study_date': today})
  return data
}

module.exports = { 
  getOpenId, 
  getUserInfoByKey,
  getTailoredUserInfo, 
  getTotalScore, 
  getMeetingScore, 
  getSpeakerScore,
  getEvaluatorScore,
  getHostScore,
  getReportScore,
  getUserInfo,
  saveIntroduction,
  getIntroduction,
  deleteIntroduction,
  getTotalStudyDuration,
  getTodayStudyDuration,
  getTotalStudyInfo,
  getTodayStudyInfo,
  getStudyReport,
  getStudyReportToday
  }
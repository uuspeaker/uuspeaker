const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const config = require('../../config')
const randomMatchService = require('../../service/randomMatchService')


module.exports = {
  post: async ctx => {
    var userInfo = await userInfoService.getUserInfoByKey(ctx)
    randomMatchService.startMatch(userInfo)
    ctx.state.data = userInfo
  },

  put: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    randomMatchService.stopMatch(userId)
  },

  get: async ctx => {
    var userId = ctx.query.userId
    var userInfo = randomMatchService.getMatchInfo(userId)
    ctx.state.data = userInfo
  },

}
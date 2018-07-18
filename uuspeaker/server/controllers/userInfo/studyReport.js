const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const reportService = require('../../service/reportService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfoService.getOpenId(ctx)
    }
    var studyReport = await reportService.getStudyReport(userId)
    ctx.state.data = studyReport
  },

}
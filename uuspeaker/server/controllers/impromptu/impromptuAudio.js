const { mysql } = require('../../qcloud')
const uploadAudio = require('../../upload/uploadAudio.js')
const uuid = require('../../common/uuid.js')
const userInfo = require('../../common/userInfo')
const multiparty = require('multiparty')
const config = require('../../config')
const fs = require('fs')


var post = async (ctx) => {
  //保存音频文件
  await uploadAudio.upload(ctx)
}

var del = async (ctx) => {
  var audioId = ctx.request.body.audioId
  await uploadAudio.deleteObject(audioId)
}


module.exports = { post,del }
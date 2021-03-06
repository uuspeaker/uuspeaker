var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var uuid = require('../../../common/uuid.js')

const innerAudioContext = wx.createInnerAudioContext()

var showTimes = 0
var timeDuration = 0
var startDate
var endDate

var timetimeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasIntroduction: 0,
    isPlay: 0,
    userIntroduction: {},
    oldAudioId: '0',
  },

  startRecord: function () { 
    audioService.start()
    startDate = new Date()
  },

  stopRecord: function () {
    audioService.stop()
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate)/1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1){
      util.showModel('录音太短', '请录制一段超过10秒的自我介绍');
      return
    }
    var audioId = uuid.v1()
    setTimeout(audioService.saveAudio, 300, audioId)
    
    if (this.data.hasIntroduction == 1){
      var that = this
      wx.showModal({
        title: '提示',
        content: '是否替换原有介绍？',
        success: function (sm) {
          if (sm.confirm) {
            that.saveAudioRecord(audioId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })   
    }else{
      this.saveAudioRecord()
      this.setData({
        hasIntroduction: 1
      })
    }
    
  },

  saveAudioRecord: function (audioId) {
    util.showBusy('请求中...')
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userIntroduction`,
      login: true,
      data: { audioId: audioId, timeDuration: timeDuration, oldAudioId: this.data.oldAudioId},
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        that.setData({
          hasIntroduction: 1
        })
        that.getUserIntroduction()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getUserIntroduction: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userIntroduction`,
      login: true,
      data: {},
      method: 'get',
      success(result) {
        console.log(result.data.data)
        if (result.data.data.length == 0) {
          that.setData({
            hasIntroduction: 0
          })
          
        } else {
          that.setData({
            userIntroduction: result.data.data[0],
            hasIntroduction: 1,
            oldAudioId: result.data.data[0].introduce_audio_id
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  doRecordAgain: function(){
    this.setData({
      hasIntroduction: 0
    })
  },

  toTaskIndex: function(){
    wx.navigateTo({
      url: '../../task/taskIndex/taskIndex',
    })
  },

  play: function(){
    innerAudioContext.src = this.data.userIntroduction.src
    innerAudioContext.play()
    this.setData({
      isPlay: 1
    })
  },

  stop: function () {
    innerAudioContext.stop()
    this.setData({
      isPlay: 0
    })
  },

  onLoad: function(){
    var that = this
    this.getUserIntroduction()

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      wx.hideLoading()
      console.log('开始播放', innerAudioContext.currentTime)
    })
    innerAudioContext.onWaiting(() => {
      wx.showLoading({
        title: '音频加载中',
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      console.log('onStop')
      that.setData({
        isPlay: 0
      })
    })
    innerAudioContext.onEnded((res) => {
      console.log('onEnd')
      that.setData({
        isPlay: 0
      })
    })
  },

  onUnload: function () {
    innerAudioContext.stop();
  },


})
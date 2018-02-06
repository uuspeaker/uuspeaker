var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    textStyle: [],
    rooms: [],
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = 'box-shadow: 1px 1px 2px 2px #888888;'
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (e) {
    this.initViewStyle()
    var index = e.currentTarget.dataset.item
    console.log(index)
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'box-shadow:0px 0px 0px 0px'
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
    //setTimeout(this.initViewStyle, 200);
  },

  //查询最新复盘列表,包含点赞及评论
  queryImpromptuRooms: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          rooms: result.data.data
        })
        //将时间格式化显示
        that.formatDate()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var data = this.data.rooms
    for (var i = 0; i < data.length; i++) {
      var startDate = new Date(data[i].start_date)
      data[i].startDateStr = dateFormat.getFutureTimeNotice(startDate)
    }
    this.setData({
      rooms: data
    })
  },

  openImpromptuRoom: function () {
    console.log(111111)
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initViewStyle()
    this.queryImpromptuRooms()
  },


})
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var rtcroom = require('../../../utils/rtcroom.js');
var getlogininfo = require('../../../getlogininfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    textStyle: [],
    rooms: [],
    userName: '12',
    modeItems: ['即兴演讲', '备稿演讲', '工作坊'],
    languageItems: ['中文', 'English'],
    tapTime: ''
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
      data[i].startDateStr = dateFormat.getTimeNoticeFuture(data[i].start_date, data[i].start_time)
    }
    this.setData({
      rooms: data
    })
  },

  toImpromptuMeeting: function (e) {
    var roomId = e.currentTarget.dataset.room_id
    var userId = e.currentTarget.dataset.user_id

    wx.navigateTo({
      url: '../impromptuMeeting/impromptuMeeting?' + '&roomId=' + e.currentTarget.dataset.room_id
    })
  },

  openImpromptuRoom: function () {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=add'
    })
  },

  updateImpromptuRoom: function (e) {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=modify'
      + '&roomId=' + e.currentTarget.dataset.room_id
      + '&startDate=' + e.currentTarget.dataset.start_date
      + '&startTime=' + e.currentTarget.dataset.start_time
      + '&endTime=' + e.currentTarget.dataset.end_time
      + '&mode=' + e.currentTarget.dataset.mode
      + '&language=' + e.currentTarget.dataset.language
      + '&notice=' + e.currentTarget.dataset.notice
    })
  },

  // 进入rtcroom页面
  createAndGoRoom: function (e) {
    var self = this;
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }
    var mode = e.currentTarget.dataset.mode
    var roomID = e.currentTarget.dataset.room_id
    var roomName =  this.data.modeItems[mode - 1]

    qcloud.request({

      url: `${config.service.host}/weapp/multi_room.isRoomExist`,
      login: true,
      data: { 'roomId': roomID },
      method: 'post',
      success(result) {
        console.log('multi_room.isRoomExist')
        console.log(result)
        var isRoomExist = result.data.isRoomExist
        var enterType = 'create'
        if (isRoomExist) {
          enterType = 'enter'
        }
        var url = '../room/room?type=' + enterType + '&roomName=' + roomName + '&roomID=' + roomID 
        console.log(url)
        wx.navigateTo({
          url: url
        });
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })

    self.setData({ 'tapTime': nowTime });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.initViewStyle()
    //this.queryImpromptuRooms()
  },

  onShow: function (options) {
    this.initViewStyle()
    this.queryImpromptuRooms()

  },

  onPullDownRefresh: function () {
    this.initViewStyle()
    this.queryImpromptuRooms()
  },

  onReady: function () {
    var self = this;
    //this.getRoomList(function () { });
    getlogininfo.getLoginInfo({
      type: 'multi_room',
      success: function (ret) {
        self.data.firstshow = false;
        self.data.isGetLoginInfo = true;
        //self.getRoomList(function () { });
        console.log('我的昵称：', ret.userName);
        self.setData({
          userName: ret.userName
        });
        wx.hideLoading();
      },
      fail: function (ret) {
        self.data.isGetLoginInfo = false;
        wx.hideLoading();
        wx.showModal({
          title: '获取登录信息失败',
          content: ret.errMsg,
          showCancel: false,
          complete: function () {
            wx.navigateBack({});
          }
        });
      }
    });
  },

})
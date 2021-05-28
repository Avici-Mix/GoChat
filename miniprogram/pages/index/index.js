// miniprogram/pages/index/index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var userimage, username

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
  },

  //登录初始化
  init: async function () {
    wx.getUserInfo({
      success: (res => { 
        console.log(res);
        userimage=res.userInfo.avatarUrl
        username=res.userInfo.nickName
        app.globalData.userimage = userimage,
        app.globalData.username = username
        console.log(app.globalData.userimage);
        console.log(app.globalData.username);
        this.setData({
          username,
          userimage
        })
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            app.globalData.openid = res.result.openid
            wx.navigateTo({
              url: '../gochat/gochat',
            })
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
        })
      
      }),
      fail:(err=>{
        console.log(err);
      })
    
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
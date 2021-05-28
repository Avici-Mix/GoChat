const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var username, userimage,textContent
import moment from '../../utils/moment'
moment.locale('zh-cn')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scroll_height: 0,
    showgrid: false,
    scrollTop: 0,
    showstart: false,
    showend: false,
    textInputValue: '',
    scrollTop: 0,
    scrollToMessage: '',
    truepic: 'https://img11.360buyimg.com/ddimg/jfs/t1/116237/11/15151/7990/5f3be28aE583eb418/cdd2c4a4a3b7ad3f.png',
    falsepic: 'https://img13.360buyimg.com/ddimg/jfs/t1/147933/26/5705/6828/5f3be28aE87fa3950/fbfbcd1a5ccdf6d4.png',
    voice2: 'https://img12.360buyimg.com/ddimg/jfs/t1/124318/38/9995/5326/5f3be28aE2b694bd2/c76ea1d8a95f2902.png'
  },

  onAdd: function () {
    this.setData({
      showgrid: true
    })
  },

  //触底加载
  async onScrollToUpper() {
    this.watchMsg()
  },

  //开启监听
  watchMsg: async function () {
    var that = this
    db.collection('gochat')
      // 按 progress 降序
      .orderBy('sendTimeTS', 'asc')
      // 取按 orderBy 排序之后的前 10 个
      .limit(20)
      .watch({
        onChange: function (snapshot) {
          console.log('snapshot', snapshot)
          const items = snapshot.docs
          console.log('app.globalData.openid', app.globalData.openid);
          const openID = app.globalData.openid
          that.setData({
            items,
            openID
          })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },

  //发送文本消息
  sendtext: async function (e) {
    var that = this
    if (!e.detail.value) {
      return
    } else {
      console.log(e.detail.value);
      wx.cloud.callFunction({
        name: 'textsec',
        data: {
          text: e.detail.value //需要检测的文字
        },
        success(res) {
          //帖子没有敏感信息
          console.log('------帖子文字信息检测成功-----')
          console.log('', res);
          textContent = e.detail.value
          that.addtext()
        },
        fail(e) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '您发表的消息中含有敏感信息，请重新编辑',
            confirmText: '重新输入',
            showCancel: false,
          })
        }
      })

    }
  },

//添加文本消息到集合
  addtext: function (res) {
    username = app.globalData.username,
      userimage = app.globalData.userimage,
      console.log('app.globalData.username', app.globalData.username)
    const date = moment(new Date()).format('YYYY-MM-DD HH:mm')
    db.collection('gochat').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        username: username,
        userimage: userimage,
        _id: `${Math.random()}_${Date.now()}`,
        msgType: 'text',
        textContent: textContent,
        sendTime: date,
        sendTimeTS: Date.now(),
      },
      success: (res => {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        this.setData({
          Inputtext: ''
        })
      }),
      fail: (err => {
        console.log(err);
      })
    })
  },

  //发送图片
  sendpic: async function (e) {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          showgrid: false
        })
        // tempFilePath可以作为img标签的src属性显示图片
        console.log('app.globalData.openid is', app.globalData.openid);
        const tempFilePaths = res.tempFilePaths[0]
        wx.cloud.uploadFile({
          cloudPath: `gochatPic/${app.globalData.openid}/${Date.now()}.png`,
          filePath: tempFilePaths, // 文件路径
          success: res => {
            console.log(res.fileID)
            wx.cloud.callFunction({
              name: 'imagesec',
              data: {
                img: res.fileID 
              },
              success() {
                const date = moment(new Date()).format('YYYY-MM-DD HH:mm')
                console.log('------图片检测成功-----')
                db.collection('gochat').add({
                  // data 字段表示需新增的 JSON 数据
                  data: {
                    username: app.globalData.username,
                    userimage: app.globalData.userimage,
                    _id: `${Math.random()}_${Date.now()}`,
                    msgType: 'image',
                    fileID: res.fileID,
                    sendTime: date,
                    sendTimeTS: Date.now(),
                  },
                  success: (res => {
                    console.log(res)
                  }),
                  fail: (res => {
                    console.log(err);
                  })
                })
              },
              fail(e) {
                wx.hideLoading()
                wx.showModal({
                  title: '提示',
                  content: '您发表的图片中含有违规内容，请重新编辑',
                  confirmText: '重新发表',
                  showCancel: false,
                })
                wx.cloud.deleteFile({
                  fileList: [res.fileID]
                })
              }
            })

          }
        })
      }
    })
  },

  //发送视频
  sendvid: async function (e) {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        console.log(res.tempFilePath)
        console.log(res);
        const vd_tempFilePath = res.tempFilePath
        that.setData({
          showgrid: false
        })
        vid_height = res.height,
          vid_width = res.width,
          wx.cloud.uploadFile({
            cloudPath: `gochatvideo/${app.globalData.openid}/${Date.now()}.mp4`,
            filePath: vd_tempFilePath,
            success: res => {
              console.log(res)
              const date = moment(new Date()).format('YYYY-MM-DD HH:mm')
              db.collection('gochat').add({
                // data 字段表示需新增的 JSON 数据
                data: {
                  username: app.globalData.username,
                  userimage: app.globalData.userimage,
                  _id: `${Math.random()}_${Date.now()}`,
                  msgType: 'video',
                  fileID: res.fileID,
                  sendTime: date,
                  sendTimeTS: Date.now(),
                },
                success: (res => {
                  console.log(res)
                }),
                fail: (res => {
                  console.log(err);
                })
              })
            }
          })
      }
    })
  },

  //开始录音
  startvoice: async function (e) {
    this.setData({
      showend: true  //弹起完成/取消录音弹窗
    })
    const options = {
      duration: 600000,
      sampleRate: 16000, //采样率，有效值 8000/16000/44100
      numberOfChannels: 1, //录音通道数，有效值 1/2
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50 //指定帧大小
    }
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },

  //点击完成录音图标
  completev: function () {
    completevoc = true
    this.setData({
        showend: false,
        showstart: false
      }),
      recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const vo_tempFilePath = res.tempFilePath
      wx.cloud.uploadFile({
        cloudPath: `gochatvoice/${app.globalData.openid}/${Date.now()}.mp3`,
        filePath: vo_tempFilePath,
        success: res => {
          const date = moment(new Date()).format('YYYY-MM-DD HH:mm')
          console.log(res)
          db.collection('gochat').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              username: app.globalData.username,
              userimage: app.globalData.userimage,
              _id: `${Math.random()}_${Date.now()}`,
              msgType: 'voice',
              fileID: res.fileID,
              sendTime: date,
              sendTimeTS: Date.now(),
            },
            success: (res => {
              console.log(res)
            }),
            fail: (res => {
              console.log(err);
            })
          })
        }
      })
    })
  },

  //取消录音
  cancelv: function () {
    this.setData({
      showend: false,
      showstart: false
    })
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
    })
  },

  
  sendvoice: function () {
    this.setData({
      showstart: true
    })
  },

  //播放录音
  playvoice: function (e) {
    console.log(e);
    var voicefileID = e.currentTarget.dataset.id
    wx.cloud.downloadFile({
      fileID: voicefileID,
      success: res => {
        // get temp file path
        console.log(res.tempFilePath)
        innerAudioContext.src=res.tempFilePath
        innerAudioContext.onPlay(() => {
          console.log('开始播放')
        })
        innerAudioContext.play()
        innerAudioContext.onError((res) => {
          console.log(res.errMsg)
          console.log(res.errCode)
        })
      },
    })

  },

  onClose() {
    this.setData({
      showgrid: false,
      showstart: false
    });
  },

  urlsetting: function () {
    wx.navigateTo({
      url: '../setting/setting',
    })
  },

  //预览图片
  previewImage:function(e){
    console.log(e);
    wx.previewImage({
      urls: [e.currentTarget.dataset.fileid ]// 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.watchMsg()//监听方法
    //调整scoll-view高度
    let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
    let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
    this.setData({
      scroll_height: windowHeight * 730  / windowWidth - 160 -30 
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
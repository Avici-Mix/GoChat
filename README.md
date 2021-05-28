

## 一、前言

一款小程序端与网页端的即时通讯聊天室

![image-20210528143902888](README.assets/image-20210528143902888.png)

## 二、功能介绍

### 小程序端

##### 1、登录功能：

​		用户首次登录时自动弹出授权框，用户授权之后，自动跳转到聊天界面；用户非首次登陆时，等待用户头像与昵称获取与显示完成之后自动跳转至聊天界面。

![image-20200823102017301](README.assets/image-20200823102017301-1622183670090.png)

##### 2、即时通信功能：

​		用户可即时发送文字、图片、视频语音消息，并即时查看对方以及自己发送的文字与多媒体消息，并实现对文字、图片消息的安全检查

###### （1）发送文字：

​		直接在输入框内输入后直接发送即可

###### （2）发送语音

​		点击语音图标，弹出录音弹出，再次点击弹窗中间录音图标即可开始录音，授权后即可开始录音，点击完成/取消图标即可完成。取消录音



###### （3）发送视频/图片

​		点击输入框右侧加号图标，弹出发送图片/视频/文件弹框，点击即可选择图片/视频发送（**注**：真机上**视频消息播放正常**，模拟器及网页播放视频时**只有声音没有画面**，初步判断，发送的视频非mp4中AVC(H264)格式）

##### 3、查看历史消息

​		点击页面右上角设置符号进入设置界面，点击查看历史消息即可查看

### web端

##### 1、界面：

##### 2、邮箱注册与登陆功能：

​		用户输入正确的邮箱和符合规范的密码，点击注册后，弹出注册成功的提示，待用户前往邮箱点击链接后，可使用注册的邮箱与密码登录，



## 三、数据结构：

​		GoChat小程序数据存储在集合gochat和云存储gochatpic、gochatvideo、gochatvoice中，gochat集合字段及内容如下

|    字段     |              内容              |
| :---------: | :----------------------------: |
|     _id     |             消息id             |
|   _openid   |           用户openid           |
|   msgType   |            消息类型            |
|  sendTime   |            发送时间            |
| sendTimeTs  |        发送时间的时间戳        |
| textContent |          文本消息内容          |
|   fileID    | 视频/语音/图片多媒体消息文件id |
|  userimage  |          用户微信头像          |
|  username   |          用户微信呢称          |



## 四、运行文档

### 小程序端

##### 1、index文件夹

​		index.wxml页面主要为欢迎语和用户头像、呢称两部分，头像部分是使用button组件的方法，获取用户信息之后背景图显示用户头像。		index.js文件主要是登录的初始化，即init()函数。init()函数中调用wx.getUserInfo的方法获取用户呢称和头像，调用login()云函数获取用户openid，在向wxml页面传递该三个变量的过程中还设置了三个全局变量存储用户呢称、头像和openid。

##### 2、gochat文件夹

​		gochat.wxml页面主要有三部分，header部分为页面顶框，顶框中右侧有一个设置的图标，点击可跳转到设置页面；body部分为scroll-view纵向滚动视图区域，利用wx:for显示用户聊天信息，同时工具是否为用户自己的openid利用三元运算符将用户自己的消息置于又，其他人的消息置于左；footer部分为输入框部分，输入款左侧为语音图标，点击后弹出录制弹框（这里弹出层采用vant组件库的van-popup方法），右侧加号图标同理。

​		gochat.js页面中：

###### 		（1）声明

​		创建recorderManager和innerAudioContext的音频上下文，声明全局变量、从utils引入处理时间的js文件moment。

###### 		（2）页面初始加载

​		onLoad()函数中，加载watchMsg()函数与调整scoll-view高度的方法，watchMsg()函数中，通过从gochat集合按照sendTimeTS升序的方法获取所有消息，开启对集合gochat的监听。

###### 		（3）发送文字消息

​		sendtext()函数中，首先判断输入框拿到的消息是否为空，非空则调用textsec()云函数，对输入的文字进行安全检查；addtext()函数中，将经过安全检测的文字消息添加到集合gochat，并将时间戳转换为"YYYY-MM-DD HH:mm"的格式，另存在sendTime字段。

###### 		（4）发送图片和视频消息

​		sendpic()发送图片函数中，先调用选择图片方法wx.chooseImage()，成功后调用 wx.cloud.uploadFile()方法将图片消息上传到云存储，并获得文件路径，向wxml页面传值，之后再将图片消息的相关信息添加到gochat集合；sendvid()发送视频函数同理。

###### 		（5）发送语音信息

​		当用户点击弹出层中的录音图标，触发startvoice()函数，调用recorderManager.start(options)开始录音，并开启录音监听recorderManager.onStart()；当用户点击完成录音，触发completev()函数，函数中调用recorderManager.stop()方法完成录音调用，在recorderManager.onStop监听完成事件中上传录音文件和添加相关音频消息到集合中；cancelv()函数为用户点击取消录音时触发

​		（6）播放音频和预览图片

​		用户点击录音消息中的**图标**时，播放声音，采用innerAudioContext.src、innerAudioContext.onPlay()、innerAudioContext.play()、 innerAudioContext.onError((res)等上下文方法；预览图片调用wx.previewImage()方法。

##### 		3、setting文件夹

​		为设置界面，使用vant组件库进行编写

##### 		4、history文件夹

​		历史消息界面，直接从gochat集合获取消息并排序输出，并会注明消息发送的时间，另外历史消息中语音消息不支持查看



### web端

#### 1、head与body部分

​		head部分引入邮箱登录的js文件和声明；body部分为GoChat聊天室图标、邮箱注册和登录模块、list消息展示模块。

#### 2、js部分

###### 		（1）匿名登录：

​		使用initTcb()函数进行匿名登录，访问gochat集合中的消息列表

###### 		（2）邮箱登录：

​		用户点击邮箱注册触发sign()函数，采用auth.signUpWithEmailAndPassword()方法进行注册，注册成功后弹出弹框；用户点击登录邮箱login()函数，采用auth.signInWithEmailAndPassword()方法进行登录

###### 		（3）加载消息列表：

​		采用loadlist()函数加载用户列表，通过判断消息类型进行简单的拼接输出至html页面

###### 		（4）预览图片：

​		采用preview()函数进行预览
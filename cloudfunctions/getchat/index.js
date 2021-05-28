// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'zzb001-v28kf'
})
const db = cloud.database()
exports.main = async (event, context) => {
  return await db.collection('gochat').get()
}
// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9

const db = wx.cloud.database() 
let content = ''
let userInfo ={}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footerBottom:0,
    images:[],
    selectPhoto:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options

  },



  onInput(event){
    console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM){
      wordsNum = `最大长度为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },

  onFocus(event){
    //console.log(event)
    this.setData({
      footerBottom: event.detail.height
    })

  },
  onBlur(){
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage(){
    let max = MAX_WORDS_NUM -this.data.images.length
wx.chooseImage({
  count: max,
  sizeType:['original','compressed'],
  sourceType:['album','camera'],

  success: (res)=> {
    console.log(res)
    this.setData({
      images: this.data.images.concat(res.tempFilePaths) 
    })
    max = MAX_WORDS_NUM - this.data.images.length
    this.setData({
      selectPhoto: max <=0 ? false : true
    })
  },
})
  },

  onDelImage(event){
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM){
      this.setData({
        selectPhoto:true,
      })

    }

  },

  onPreviewImage(event){
    console.log(event)
    wx.previewImage({
      urls: this.data.images,
      current:event.target.dataset.imgsrc,
    })
  },

  send(){
    //2.数据 -> 云数据库
    //数据库：内容，图片 fileID,openid 名称，头像，时间
    //1.图片->云存储 fileID 云文件ID
if(content.trim() === ''){
wx.showModal({
  title: '小主，请输入内容哦',
  content: '',
})
return 
}
wx.showLoading({
  title: '发布中小主稍等',
  mask:true
})
    let promiseArr = []
    let fileIds = []

    //图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((reslove,reject)=>{
        let item = this.data.images[i]
        //文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]

        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            reslove()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
      }
      //存入到数据库中
    Promise.all(promiseArr).then((res)=>{
db.collection('blog').add({
  data:{
    ...userInfo,
    content,
    img: fileIds,
    createTime:db.serverDate(),
  }
}).then((res)=>{
  wx.hideLoading()
  wx.showToast({
    title: '发布成功啦',
    
  })
  //返回blog页面，并且刷新
  wx.navigateBack()
  const pages = getCurrentPages()
  console.log(pages)
  //用于取到上一个页面
  const prevPage = pages[pages.length - 2]
  prevPage.onPullDownRefresh()

})
    }).catch((err)=>{
      wx.hideLoading()
      wx.showToast({
        title: '小主，发布失败了哦。',
      })
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
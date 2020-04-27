// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  blogId:String,
  blog:Object
  },
  externalClasses: ['iconfont', 'icon-pinglun','icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false,
    modalShow: false,
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success: (res) =>{
       if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: (res) => {
              userInfo = res.userInfo
              //显示评论弹出层
              this.setData({
                modalShow: true,
              })
            }
          })
        }else{
          this.setData({
            loginShow:true
          })
        }
        }
      })

    },
    onloginSuccess(event){
      userInfo = event.detail
      //授权框消失，评论框显示
      this.setData({
        loginShow:false,
       
      },()=>{
        this.setData({
          modalShow:true
        })
      })
      
    },
    onloginfail(){
      wx.showModal({
        title: '小主，请先授权',
        content:'',
      })

    },
    onInput(event){
this.setData({
  content: event.detail.value
})
    },
    
    onSend(event){
      console.log(event)
      //插入数据库
      //let formId = event.detail.formId
      let content = this.data.content
      if(content.trim()==''){
        wx.showModal({
          title: '小主，请先评论哦',
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评价中哦',
        mask: true
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res)=>{
wx.hideLoading()
wx.showToast({
  title: '评论成功',
})       
this.setData({
  modalShow:false,
  content:''
})
        //父元素刷新评论页面
        // this.triggerEvent('refreshCommentList')
      })


     


    },
  }
})

import config from '@/config'
import axios from 'axios'
import iView from 'view-design'
import { setToken, getToken } from '@/libs/util'
import router from '@/router'

export const baseUrl = (process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro)

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  interceptors(instance) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      // console.log(res)
      const filename = res.headers['content-disposition'].split('=')[1]
      //console.log(filename)
      var blob = new Blob([res.data], { type: 'application/vnd.ms-excel;ctf-8' })
      var downloadElement = document.createElement('a')
      var href = window.URL.createObjectURL(blob) // 创建下载的链接
      downloadElement.href = href
      downloadElement.download = filename // 下载后文件名
      document.body.appendChild(downloadElement)
      downloadElement.click() // 点击下载
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href) // 释放掉blob对象
    })
    /* const { data, status } = res
      if (data.code !== 1) {
        if (data.code === -14) {
          setToken('')
          router.push({ name: 'login' })
        } else {
          iView.Message.error(data.msg)
        }
        throw new Error(data.msg)
      } else {
        return { data, status }
      }
    }, error => {
      return Promise.reject(error)
    })
    */
  }

  request(options) {
    const instance = axios.create({
      responseType: 'blob'
    })
    const apiAuth = getToken()
    if (apiAuth === false) {
      options = Object.assign({
        baseURL: this.baseUrl,
        headers: {}
      }, options)
    } else {
      options = Object.assign({
        baseURL: this.baseUrl,
        headers: {
          apiAuth: apiAuth
        },
        withCredentials: true
      }, options)
    }
    this.interceptors(instance)
    return instance(options)
  }
}

const api_axios = new HttpRequest(baseUrl)
export default api_axios

import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { LocalStorageService } from 'ngx-webstorage';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import axios from 'axios';
import {get} from 'lodash';

import {baseURL} from './config'

@Injectable()
export class Services{
  http: any
  token: string
  token_ttl: number
  user: any
  

  constructor(
    private storage: LocalStorageService,
    private transfer: FileTransfer,
    private events: Events
  ){
    this.http = axios.create({
      baseURL : baseURL ,
    })

    events.subscribe('app:set-user', user => this.user = user)

    /*this.http.interceptors.response.use(response => {
      console.log(response)
    }, error => {
      console.log(error)
    })*/

    /*this.http.interceptors.request.use(config => {
      let url = config.url.split('/').pop()
      return config
    }, error => {
      return Promise.reject(error)
    })*/
  }

    setToken(token){
      this.http.defaults.headers.common.Authorization = `Bearer ${token}`
    }

  async checkToken(){
    const logged = this.storage.retrieve('logged')

    if( ! logged ){
      this.events.publish('cart:empty')
      return Promise.resolve(false)
    }else{
      this.setToken(logged.token)
      this.http.post('me').then( obj => get(obj, 'data') ).then(user => {
        if(user){
          logged.user = Object.assign({}, logged.user, user)
        }

        this.parseLogged(logged)
        return Promise.resolve(logged)
      }).catch(error => {
        if(get(error, 'response.status') === 401){
          this.postLogout(true)
        }
        this.events.publish('cart:empty')
        return Promise.resolve(false)
      })
    }
  }

  parseLogged(logged){
    const {token, token_ttl, user} = logged

    this.token = token
    this.token_ttl = token_ttl
    this.user = Object.assign({}, user)

    this.events.publish('app:set-user', user)
    this.events.publish('home:start-tick')
    this.storage.store('logged', {token, token_ttl, user})
    this.setToken(token)
  }

  postLogin(data){
    return this.http.post('auth/token/issue', data).then( obj => get(obj, 'data') )
  }

  postLoginFacebook(data){
    return this.http.post('auth/facebook', data).then( obj => get(obj, 'data') )
  }

  postLogout(force: boolean=true){
    if(force){
      this.storage.clear('logged')
      this.events.publish('cart:empty')
      this.user = {}
      return Promise.resolve()
    }else{
      return this.http.post('auth/token/revoke').then( obj => get(obj, 'data') ).then( (response) => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      }).then(() => {
        this.storage.clear('logged')
        this.events.publish('cart:empty')
        this.user = {}
      })
    }
  }

  updateProfile(data, obj={}){
    return this.http.put(`profile?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  updatePropict(data, obj={}){
    return this.http.put(`profile/picture?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  fetchHome(){
    return this.http.get('home?include=user,product,category,meta').then( obj => get(obj, 'data') )
  }

  fetchProductList(){
    return this.http.get('product?include=user,product,category,meta').then( obj => get(obj, 'data') )
  }

  fetchProductByCategory(category, obj={}){
    return this.http.get(`product/category/${category}?${this.params(obj)}&include=user,product,category,meta`).then( obj => get(obj, 'data') )
  }

  fetchProductById(id, obj={}){
    return this.http.get(`product/${id}?${this.params(obj)}&include=user,product,category,meta,comments`).then( obj => get(obj, 'data') )
  }

  deleteProduct(id){
    return this.http.delete(`product/${id}`).then( obj => get(obj, 'data') )
  }

  postProduct(data){
    return this.http.post(`product?include=user,product,category,meta`, data).then( obj => get(obj, 'data') )
  }

  updateProduct(data){
    return this.http.put(`product/${data.id}?include=user,product,category,meta`, data).then( obj => get(obj, 'data') )
  }

  fetchProductBySearch(term, obj={}){
    return this.http.get(`product/search?term=${term}&${this.params(obj)}&include=user,product,category,meta`).then( obj => get(obj, 'data') )
  }

  postDiscussion(data, obj={}) {
    return this.http.post(`discussion?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }
  postReply(data, obj={}) {
    return this.http.post(`storereply?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  fetchDiscussion(obj = {}){
    return this.http.get(`discussion?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchStory(obj = {}){
    return this.http.get(`story?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postStory(data, obj={}) {
    return this.http.post(`story?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  updateStory(id, data, obj={}) {
    return this.http.put(`story/${id}?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  postStoryLove(obj, id) {
    return this.http.post(`story/${id}/love?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postStoryComment(data, obj) {
    return this.http.post(`story/comment?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  postStoryReport(data, obj) {
    return this.http.post(`story/report?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  deleteStory(id) {
    return this.http.delete(`story/${id}`).then( obj => get(obj, 'data') )
  }

  deleteStoryComment(id) {
    return this.http.delete(`story/${id}/comment`).then( obj => get(obj, 'data') )
  }

  fetchCartLocation(obj = {}){
    return this.http.get(`cart/location?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchCartShipping(data, obj = {}){
    return this.http.post(`cart/shipping?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  checkoutCart(data, obj = {}){
    return this.http.post(`cart/checkout?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  confirmTransaction(data, obj = {}){
    return this.http.post(`transaction/confirm?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  storeCart(obj = {}, id){
    return this.http.post(`cart/${id}?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchMessageReceipt(obj={}){
    return this.http.get(`message/receipt?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchMessageDetail(id, obj={}){
    return this.http.get(`message/${id}?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchMessage(obj={}){
    return this.http.get(`message?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postMessage(data, obj={}){
    return this.http.post(`message?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  updateMessage(id, data, obj={}){
    return this.http.put(`message/${id}?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  fetchComplaint(obj={}){
    return this.http.get(`complaint?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postComplaint(data, obj={}){
    return this.http.post(`complaint?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  postComplaintOpen(id, obj={}){
    return this.http.post(`complaint/${id}/open?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postComplaintClose(id, obj={}){
    return this.http.post(`complaint/${id}/close?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchWallet(obj={}){
    return this.http.get(`wallet?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchWalletWithdraw(obj={}){
    return this.http.get(`wallet/withdraw?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postWallet(data, obj={}){
    return this.http.post(`wallet?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  fetchAdvert(obj={}){
    return this.http.get(`advert?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postAdvert(data, obj={}){
    return this.http.post(`advert?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  updateAdvert(id, data, obj={}){
    return this.http.put(`advert/${id}?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  deleteFile(id){
    return this.http.delete(`file/${id}`).then( obj => get(obj, 'data') )
  }

  fetchTrxPurchase(obj={}){
    return this.http.get(`transaction/purchase?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchTrxSales(obj={}){
    return this.http.get(`transaction/invoice?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchTrxInvoiceDetail(id, obj={}){
    return this.http.get(`transaction/${id}/invoice?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postTrxInvoiceReject(id, obj={}){
    return this.http.post(`transaction/${id}/reject?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postTrxInvoiceApprove(id, obj={}){
    return this.http.post(`transaction/${id}/approve?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postTrxInvoiceShipment(id, data, obj={}){
    return this.http.post(`transaction/${id}/shipment?${this.params(obj)}`, data).then( obj => get(obj, 'data') )
  }

  postTrxInvoiceReceive(id, obj={}){
    return this.http.post(`transaction/${id}/receive?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchNotification(obj={}){
    return this.http.get(`notification?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  fetchTick(obj={}){
    return this.http.get(`tick?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postNotificationDismiss(id, obj={}){
    return this.http.post(`notification/${id}/dismiss?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postNotificationDismissAll(obj={}){
    return this.http.post(`notification/dismiss?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  uploadFile(path, options: FileUploadOptions){
    const fileTransfer: FileTransferObject = this.transfer.create();
    const url = encodeURI(baseURL + 'file')



    return fileTransfer.upload(path, url, options).then(r => {
      const file = get(JSON.parse(r.response), 'data')
      console.log("upload")

      return file
    }, (error) => {
      console.log(error)
      return Promise.reject(error)
    })
  }

  fetchRatingReview(id, obj={}){
    return this.http.get(`rating/${id}/review?${this.params(obj)}`).then( obj => get(obj, 'data') )
  }

  postRatingSeller(data){
    return this.http.post(`rating/seller`, data).then( obj => get(obj, 'data') )
  }

  postRegister(data){
    return this.http.post(`auth/register`, data).then( obj => get(obj, 'data') )
  }

  params(array){
    let pairs = [];

    for (var key in array){
      if (array.hasOwnProperty(key)){
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(array[key]));
      }
    }

    return pairs.join('&');
  }

}

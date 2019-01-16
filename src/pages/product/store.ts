import { Component } from '@angular/core';
import { Events, NavParams, NavController, LoadingController } from 'ionic-angular';

import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Clipboard } from '@ionic-native/clipboard';

import {Services} from '../../app/services';

import {isEmpty, get, findIndex, startsWith} from 'lodash';

import {ProductDetailPage} from './detail'
import {ReviewPage} from '../index'

const defaultProduct = {
  data: [],
  pagination: {

  }
}

@Component({
  selector: 'page-product-store',
  templateUrl: 'store.html'
})
export class ProductStorePage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  categoryKey:string = "myfriends"
  categoryIndex:number = 0

  categories:any = {
    keys: [
      'myfriends',
      'stuff',
      'free-adopt',
      'losing',
    ],
    labels: [
      'MyFriends',
      'Stuff',
      'Free Adopt',
      'Losing',
    ]
  }

  store: any = {
    profile: {
      social: []
    },
    rating: {
      count: [],
    }
  }

  socialList:any = {
    icons: {
      phone: 'ios-call-outline',
      whatsapp: 'logo-whatsapp',
      line: 'ios-chatbubbles-outline',
      bbm: 'ios-chatboxes-outline'
    },
    labels: {
      phone: 'HP',
      whatsapp: 'Whastapp',
      line: 'Line',
      bbm: 'BBM'
    }
  }

  listRating: any =[
    1, 2, 3, 4, 5
  ]

  isLoading:boolean = false

  product: any = Object.assign({}, defaultProduct)

  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    private callNumber: CallNumber,
    private iab: InAppBrowser,
    private clipboard: Clipboard,
    public loadingCtrl: LoadingController,
    private services: Services
  ) {

    events.subscribe('product:change-category', params => {
      const {category} = params
      this.categoryKey = category
      this.categoryIndex = findIndex(this.categories.keys, o => {return o === category})
    })

    events.subscribe('product:proxy-detail', id => this.goToDetail(id))
    events.subscribe('product:refetch', () => this.fetchProduct())
  }

  compareCategory(current, selected): boolean {
    return current === selected
  }

  changeCategory(){
    this.categoryKey = get(this.categories.keys, this.categoryIndex, 'myfriends')
    this.fetchProduct()
  }

  ionViewDidEnter(){
    const store = this.navParams.get('store')
    const category = this.navParams.get('category')

    if(category){
      this.categoryKey = category
      this.categoryIndex = findIndex(this.categories.keys, o => {return o === category})
    }

    if(store){
      this.store = Object.assign({}, this.store, store)
    }

    setTimeout(() => {
      if(this.isProductEmpty()){
        this.fetchProduct()
      }
    }, 300)
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  isProductEmpty(): boolean{
    return !this.isLoading && isEmpty(this.product.data)
  }

  goToDetail(id){
    this.navCtrl.push(ProductDetailPage, {id})
  }

  goToReview(){
    const {store} = this
    this.navCtrl.push(ReviewPage, {store})
  }

  fetchProduct(direction='new'){

    let page = 1, last_time = 0
    const {pagination} = this.product
    if(!isEmpty(pagination) && direction !== 'new'){
      const {current_page, total_pages} = pagination

      if(current_page !== total_pages){
        page = current_page+1
      }else{
        return new Promise((resolve, reject) => {
          resolve()
        });
      }
    }

    if(direction === 'new'){
      this.product = Object.assign({}, defaultProduct)
    }

    const store = this.store.id

    this.events.publish('app:loading:show')
    this.isLoading = true
    return this.services.fetchProductByCategory(this.categoryKey, {page, last_time, store}).then( response => {
      const {data, meta} = response
      if(direction === 'new'){
        this.product.data = Object.assign([], data)
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }else{
        this.product.data = Object.assign([], this.product.data.concat(data))
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }

    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close')).then(() => this.isLoading = false)
  }

  productLoadNewRefresher(refresher): Promise<any>{
    return this.fetchProduct().then((response) => {
      refresher.complete()
    })
  }

  productLoadMore(infinity): Promise<any>{
    return this.fetchProduct('more').then((response) => {
      infinity.complete()
    })
  }

  socialClick(item){
    let {provider_name, provider_id} = item

    if(provider_name === 'phone'){
      this.callNumber.callNumber(provider_id, true)
    }
    if(provider_name === 'bbm'){
      this.iab.create(`bbmi://${provider_id}`, '_system')
    }
    if(provider_name === 'whatsapp'){
      if(startsWith(provider_id, '0')){
        provider_id = '+62' + provider_id.substring(1, provider_id.length)
      }
      this.iab.create(`https://api.whatsapp.com/send?phone=${provider_id}&text=Halo MyFriends`, '_system')
    }
    if(provider_name === 'line'){
      this.clipboard.copy(provider_id)
      // this.iab.create(`line://msg/text/Halo MyFriends`, '_system')
    }
    if(provider_name === 'mail'){
      this.iab.create(`mailto:${provider_id}`, '_system')
    }
  }

}

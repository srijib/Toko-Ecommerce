import { Component } from '@angular/core';
import { Events, App, AlertController, NavController, LoadingController } from 'ionic-angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Services } from '../../app/services';

import {Cart as CartService} from '../../app/cart'

import { Observable } from 'rxjs/Rx';

import {CartThanksPage} from './thanks'
import {ProfilePage} from '../index';

import {get, find} from 'lodash'

@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html'
})
export class CartPage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  defaultStoreItem: any = {
    id: '',
    name: '',
    products: []
  }

  store: any = {
    data: [],
    subtotal: 0,
  }
  cate:any
charge:number
  cart: any = {
    data: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    weight: 0,
    qty: 0,
  }

  shipping: any = {
    province: '',
    city: '',
    postal_code: '',
    address: '',
    notes: '',
  }

  storeShipping: any = []

  provinces: any = []
  cities: any = []

  constructor(
    public app: App,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private events: Events,
    private storage: LocalStorageService,
    private services: Services,
    private cartServices: CartService
  ) {
    this.events.subscribe('cart:updated', cart => Object.assign(this.cart, cart))

  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ngAfterViewInit(){

  }

  async ionViewDidEnter(){
    if(this.isLogged()){
      const check = await this.checkUser()
      if(check){
        this.prepareCart()
      }
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }

  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  checkUser(){
    const {user} = this.services

    let alert = this.alertCtrl.create({
      title: 'Peringatan!',
      subTitle: 'Sebelum Checkout',
      message: 'Mohon lengkapi profil dan alamat anda terlebih dahulu!',
      buttons: ['OK']
    })

    if(
      user.profile === null || user.address === null ||
      get(user.address, 'province_id') === null ||
      get(user.address, 'city_id') === null
    ){
      alert.present()
      alert.onDidDismiss(() => {
        this.navCtrl.push(ProfilePage)
      })
      return false
    }

    return true
  }

  async prepareCart(){
    this.cart = Object.assign({}, this.cart, this.storage.retrieve('cart'))

    if(this.cart.data.length){
      const {user} = this.services
      this.shipping.province = get(user, 'profile.address.province_id');
      this.shipping.city = get(user, 'profile.address.city_id');

      if(!this.provinces.length){
        await this.prepareProvince()
      }
      this.fetchShipping(this.cart)
    }
  }

  remove(storeIndex, productIndex){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menghapus item ini dari keranjang belanja?',
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Ya, Hapus!',
          handler: () => {
            this.events.publish('cart:remove', {storeIndex, productIndex})
          }
        }
      ]
    })

    confirm.present()
  }

  shouldLocationShow(store): boolean{
    return get(store, 'address.province') && get(store, 'address.city')
  }

  compareSelect(current, selected): boolean {
    return current == selected
  }

  compareShipping(current, selected): boolean {
    return current.code === selected.code
  }

  shippingChange(storeIndex){
    let store = this.cart.data[storeIndex]
    

    let storeShipping = this.storeShipping
    storeShipping[storeIndex] = store
    this.storeShipping = Object.assign([], this.storeShipping, storeShipping)

    this.calcShipping()
  }

  async provinceChange(){
    await this.parseProvince()
    this.shipping.city = get(this.cities, `0.city_id`)
    this.fetchShipping(this.cart)
  }

  async cityChange(){
    await this.parseCity()
    this.fetchShipping(this.cart)
  }

  async parseProvince(){
    const self = this
    let cities = get(find(this.provinces, (province: any) => {
      return province.province_id == self.shipping.province
    }), 'city', [])

    this.cities = Object.assign([], cities)
  }

  async parseCity(){
    const self = this
    this.shipping.postal_code = get(find(this.cities, (city: any) => {
      return city.city_id == self.shipping.city
    }), 'postal_code', this.shipping.postal_code)
  }

  prepareShipping(cart){
    if(!cart.total){
      return ;
    }

    this.fetchShipping(cart).then(() => {
      this.calcShipping()
    })

  }

  prepareProvince(){
    this.events.publish('app:loading:show')
    return this.services.fetchCartLocation().then(async (location) => {
      this.provinces = await Object.assign([], location)
      this.parseProvince()
    }).catch(error => this.events.publish('app:error', error)).then( () => this.events.publish('app:loading:close') )
  }

  fetchShipping(cart){
    this.events.publish('app:loading:show')
    const {city, province} = this.shipping
    return this.services.fetchCartShipping(cart, {city, province}).then(response => {
      const {shipping, address} = response
      this.storeShipping = Object.assign([], this.storeShipping, shipping)

      this.shipping = Object.assign({}, this.shipping, {
        postal_code: address.post_code,
        address: address.street
      })

      this.calcShipping()
    }).then( () => this.events.publish('app:loading:close') )
  }

  calcShipping(){
    let subtotal = 0
    let shipping = 0
    let total = 0
    

    this.storeShipping.forEach((item, index) => {
      let store = this.cart.data[index]

      store.shipping = Object.assign({}, store.shipping, item)
      if(store.weight>0)
      {
      store.total = store.shipping.selected.value + store.subtotal
      }
      else{
      store.total = store.subtotal
      }

      this.cart.data[index] = Object.assign({}, this.cart.data[index], store)

      subtotal += store.subtotal
      if(store.weight>0)
      {
      shipping += store.shipping.selected.value
      }
      else
      {
      shipping = 0
      }
      total += store.total

    })
    if(this.cate=="myfriends")
      {
      this.charge = 50000*this.cart.data.length
      }
      else
      {
      this.charge = 0
      }
      total+=this.charge


    this.cart = Object.assign({}, this.cart, {subtotal, shipping, total})
  }

  parseStoreShipping(storeShipping, index){
    return get(this.storeShipping[index], 'selected.value', 0)
  }

  adjustQty(storeIndex, productIndex){
    let store = this.cart.data[storeIndex]
    let product = store.products[productIndex]

    let prompt = this.alertCtrl.create({
      title: 'Update Qty',
      message: "Masukan Jumlah Item",
      inputs: [
        {
          name: 'qty',
          value: product.qty,
          placeholder: 'Qty'
        },
      ],
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Kirim',
          handler: data => {
            let qty = parseInt(data.qty)

            this.cartServices.update(storeIndex, productIndex, qty)
            this.fetchShipping(this.cart)
          }
        }
      ]
    })

    prompt.present()
  }

  checkout(){
    let {cart, shipping} = this

    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi Checkout',
      message: 'Anda yakin dengan pesanan anda sekarang?',
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Ya, Checkout',
          handler: () => {
          this.storage.store('statuscart',null)
            const data = Object.assign({}, {cart, shipping})
            this.events.publish('app:loading.show')
            this.services.checkoutCart(data).then(transaction => {
              this.navCtrl.setRoot(CartThanksPage, {transaction})
              this.events.publish('cart:empty')
            })
          }
        }
      ]
    })

    confirm.present()
  }

  cancel(){
    let confirm = this.alertCtrl.create({
      title: 'Batal Checkout',
      message: 'Anda yakin ingin membatalkan seluruh pesanan anda?',
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Ya, Batalkan!',
          handler: () => {
          this.storage.store('statuscart',null)
            this.events.publish('cart:empty')
            this.events.publish('home:proxy-tab', 0)
          }
        }
      ]
    })

    confirm.present()
  }
  setmyfriend(){
  this.cate = "myfriends"
  }
  setstuff(){
  this.cate = "stuff"
  }
  

}

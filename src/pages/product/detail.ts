import { Component } from '@angular/core';
import { Events, App, NavParams, NavController, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { Services } from '../../app/services';
import { Cart } from '../../app/cart';
import { Observable } from 'rxjs/Rx';
import { LocalStorageService } from 'ngx-webstorage';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Clipboard } from '@ionic-native/clipboard';
import {get, findIndex} from 'lodash';
import { isEmpty, startsWith } from 'lodash';

import {ProductPage} from './product';
import {DiscussionFormPage} from '../index';
import {ProductFormPage} from './form';
import {ProductStorePage} from './store';

import {ReviewPage} from '../index'

@Component({
  selector: 'page-product-detail',
  templateUrl: 'detail.html'
})
export class ProductDetailPage {


  user:any = {
    propict: {}
  }

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  loading: any
  isLoading: boolean = false

  rate: any = 0

  product: any = {
    id: '',
    title: '',
    images: [],
    user: {
      profile: {
        social: []
      },
      rating: {

      }
    },
    comments: [],
    product: {},
    category: {}
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

  imageLoadOffset$: any

  constructor(
    public app: App,
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private callNumber: CallNumber,
    private iab: InAppBrowser,
    private clipboard: Clipboard,
    private services: Services,
    private cart: Cart,
     private storage: LocalStorageService,
  ) {
    this.user = Object.assign({}, this.user, this.services.user)
    this.product.id = navParams.get('id')


    this.imageLoadOffset$ = Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ngAfterViewInit(){
    this.fetchProduct(this.product.id)
  }

  goToDiscuss(){
    if(this.isLogged()){
      const {product} = this
      this.navCtrl.push(DiscussionFormPage, {product})
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }
  }

  goToStore(){
    const {user: store} = this.product
    this.navCtrl.push(ProductStorePage, {store})
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  isProductEmpty(): boolean{
    return !this.isLoading && isEmpty(this.product.id)
  }

  isOwner(): boolean{
    return this.user.username === this.product.user.username
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

  addToCart(){

    if(this.isLogged()){
    if(this.product.category.slug === 'myfriends')
    {
    let info = this.alertCtrl.create ({
      title: 'Perhatian',
      message: 'Sementara Hanya Dapat Digunakan Jika Penjual Berasal Dari Kota Jakarta Dan Surabaya',
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Selanjutnya',
          handler: () => {
            let confirm = this.alertCtrl.create({
              title: 'Minta bantuan Elzumi',
              message: 'Syarat & Ketentuan dalam menggunakan layanan <br>“ Minta bantuan Elzumi ”<br>1.  Apa itu layanan “Minta bantuan Elzumi”<br><br>• Dengan meminta bantuan Elzumi berarti anda telah menyetujui bahwa pihak Elzumi akan menjadi penengah dalam transaksi dan transaksi yang anda lakukan harus melalui system Elzumi sehingga dapat meminimalkan jumlah dan kasus penipuan.<br>• Pihak penjual wajib menggunakan jasa expedisi yang telah ditetapkan oleh Elzumi dalam mengirim hewan.<br>• Pihak Elzumi tidak menerima dan tidak akan membantu untuk mengirim Hewan Langka / Hewan dilindungi / Hewan yang dilarang untuk diperjualbelikan oleh hukum Indonesia.<br>• Dalam menggunakan layanan ini pembeli akan dikenakan biaya operasional sebesar 50.000 rupiah dalam setiap transaksi<br>• Kematian hewan di tengah perjalanan adalah diluar tanggung jawab Elzumi <br>• Harga yang anda bayarkan adalah harga total dari hewan belum termasuk ongkos kirim jika anda berada di luar kota<br>• Jika lokasi anda dan penjual berbeda maka anda akan dikenakan ongkos kirim, dan total harga hewan yang tertera akan menjadi ongkos booking.<br>Ongkos kirim akan kami kirimkan melalui email untuk kemudian anda selesaikan, Hewan siap di kirim sesuai tanggal yang tercantum di email yang akan kami kirimkan kepada anda.<br>• Anda dapat mengajukan refund dana hanya bila hewan belum dikirimkan dan atau surat-surat pengiriman belum diurus, anda tidak berhak dan tidak bisa mengajukan refund dana bila hewan sudah dikirmkan dan atau surat-surat pengiriman hewan sedang diproses.<br>• Dengan menggunakan jasa minta bantuan Elzumi maka dengan ini anda sepenuhnya menyerahkan proses jual beli kepada staff Elzumi yang mengurus transaksi anda, dan bila terjadi hal-hal yang tidak diinginkan dan ingin mengajukan complain maka dengan ini staff Elzumi memiliki hak untuk menentukan apakah dana akan di kembalikan ke pembeli atau tetap diteruskan kepada penjual. <br>pembeli ataupun penjual tidak berhak menuntut Elzumi beserta seluruh staff nya atas keputusan yang telah di ambil oleh Elzumi <br>',
              buttons: [
                {
                  text: 'Batal',
                  handler: () => {
        
                  }
                },
                {
                  text: 'Ya, Minta bantuan Elzumi',
                  handler: () => {
                     this.events.publish('app:loading:show')
              this.cart.add(this.product).then( () => this.events.publish('app:loading:close') )
              this.storage.store('statuscart','myfriends')
                  }
                }
              ]
            })
            confirm.present()
          }
        }
      ]
    })
   
    info.present()
     }
     else
     {
     this.storage.store('statuscart','stuff')
      this.events.publish('app:loading:show')
      this.cart.add(this.product).then( () => this.events.publish('app:loading:close') )
     }
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }
  }

  fetchProduct(id){
    this.events.publish('app:loading:show')
    return this.services.fetchProductById(id).then( response => {
      const {data} = response
      this.product = Object.assign({}, this.product, data)
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  onRatingChange($event){

  }

  shouldMoreShow():boolean{
    return this.product.user.id === this.user.id && this.isLogged()
  }

  goToEdit(){
    const {product} = this
    this.navCtrl.push(ProductFormPage, {product})
  }

  goToReview(){
    const {user: store} = this.product
    this.navCtrl.push(ReviewPage, {store})
  }

  askRemove(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menghapus produk ini?',
      buttons: [
        {
          text: 'Batal',
          handler: () => {

          }
        },
        {
          text: 'Ya, Hapus!',
          role: 'destructive',
          handler: () => this.remove()
        }
      ]
    })

    confirm.present()
  }

  remove(){
    this.events.publish('app:loading:show')
    this.services.deleteProduct(this.product.id).then(response => {
      if(this.navCtrl.canGoBack()){
        this.navCtrl.pop()
      }else{
        this.navCtrl.parent.select(1)
        this.navCtrl.push(ProductPage, {category: this.product.category.slug})
      }
      this.events.publish('product:refetch')
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  more(){
    let actionSheet = this.actionSheetCtrl.create({
      title: `Aksi ${this.product.title}`,
      buttons: [
        {
          text: 'Edit',
          handler: () => this.goToEdit()
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => this.askRemove()
        },
        {
          text: 'Batal',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

}

import { Component, ViewChild } from '@angular/core';
import { Events, Nav, Platform, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorageService } from 'ngx-webstorage';
import { OneSignal } from '@ionic-native/onesignal';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { OnInit } from '@angular/core';
import { MenuController, ViewController, ModalController, NavController } from 'ionic-angular';
import { Network } from '@ionic-native/network';

import { Subscription } from '../../node_modules/rxjs/Subscription';

import { SQLite } from '@ionic-native/sqlite';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Uid } from '@ionic-native/uid';
import { SocialSharing } from '@ionic-native/social-sharing';

import { AuthService } from '../shared/services/auth.service';
import { DataService } from '../shared/services/data.service';
import { SqliteService } from '../shared/services/sqlite.service';
import {
  TabsPage,
  LoginPage,
  RegisterPage,
  // BlankPage,
  AdvertPage,
  WalletPage,
  ProfilePage,
  MessagePage,
  ComplaintPage,
  DiscussionPage,
  TrxPurchasePage,
  TrxSalesPage
} from '../pages';

import { Services } from './services';
declare var window: any;
@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild('nav') nav: Nav
  rootPage:any = TabsPage;
  foto:any = './assets/img/dummy/avatar.jpg'
  user:any = {
    propict: {}
  }

  defaultPropict = './assets/img/dummy/avatar.jpg'

  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public events: Events,
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private storage: LocalStorageService,
    private services: Services,
    public oneSignal:OneSignal,
    public http: Http,
    ) {


    // events.subscribe('app:loading:show', () => this.presentLoading() )
    events.subscribe('app:redirect-login', (navCtrl) => this.redirectToLoginPage(navCtrl))
    events.subscribe('app:in-develop', () => this.inDevelop() )
    events.subscribe('app:set-user', user => this.user = Object.assign({}, user))
    events.subscribe('app:set-root', page => this.nav.setRoot(page))
    events.subscribe('app:logout', (force) => this.logout(force))
    events.subscribe('app:error', error => {
      if(error.message === "Network Error"){
        let toast = this.toastCtrl.create({
          message: 'Tidak menemukan koneksi, periksa kembali koneksi anda!',
          position: 'bottom',
          showCloseButton: true,
          closeButtonText: 'Tutup',
          dismissOnPageChange: true
        });
        toast.present();
      }else if(error.response){
        if(error.response.status === 422){
          let message = error.response.data

          for(var first in message) break;

            let toast = this.toastCtrl.create({
              message: message[first].join(', '),
              position: 'bottom',
              showCloseButton: true,
              closeButtonText: 'Tutup',
              dismissOnPageChange: true
            })

          toast.present()
        }

        //Request failed with status code 422
      }

      // console.log(JSON.stringify(error))
    }


    )

    this.services.checkToken()


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.overlaysWebView(false)
      statusBar.styleLightContent()
      statusBar.backgroundColorByHexString('#a71d26');
      splashScreen.hide()

      // var notificationOpenedCallback = function(jsonData) {
      //   console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      // };

      // window["plugins"].OneSignal
      // .startInit("35187a20-8cb9-4560-af42-9c585400cb3a", "423412537429")
      // .handleNotificationOpened(notificationOpenedCallback)
      // .endInit();

      this.oneSignal.startInit('c4aff156-71c5-4c30-8ac2-1337a69c684d', '423412537429');

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.getIds().then(data=> {this.storage.store('player_id',data.userId)
        console.log(this.storage.retrieve('player_id'))})
      this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
    });
      this.oneSignal.endInit();
      if(this.isLogged()){
        this.nav.viewDidEnter.subscribe((data) => {
          if(this.storage.retrieve('logged')){
          if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
            this.foto = this.storage.retrieve('logged').user.propict
          }
        }
        })
        if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
          this.foto = this.storage.retrieve('logged').user.propict
        }
        let headerOptions: any = { 'Content-Type': 'application/json' };
        let headers = new Headers(headerOptions);
        if(this.storage.retrieve('logged').user.id!=null)
        {
          this.http.post("https://elzumie.com/api/storeprofile"+'?id='+this.storage.retrieve('logged').user.id+'&player_id='+this.storage.retrieve('player_id'),{}, { headers: headers }).subscribe(data => {
            console.log(JSON.stringify(data.json()));
          }, error => {
            console.log(JSON.stringify(error.json()));
          });
        }
      }
    });


  }
  cek(){
    if(this.isLogged()){
      this.nav.viewDidEnter.subscribe((data) => {
        if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
          this.foto = this.storage.retrieve('logged').user.propict
        }
      })
      if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
        this.foto = this.storage.retrieve('logged').user.propict
      }
      let headerOptions: any = { 'Content-Type': 'application/json' };
      let headers = new Headers(headerOptions);
      if(this.storage.retrieve('logged').user.id!=null)
      {
        this.http.post("https://elzumie.com/api/storeprofile"+'?id='+this.storage.retrieve('logged').user.id+'&player_id='+this.storage.retrieve('player_id'),{}, { headers: headers }).subscribe(data => {
          console.log(JSON.stringify(data.json()));
        }, error => {
          console.log(JSON.stringify(error.json()));
        });
      }
    }
  }
  ngAfterViewInit() {
    this.nav.viewDidEnter.subscribe((data) => {
      console.log('data =>', data);
      // if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
      //   this.foto = this.storage.retrieve('logged').user.propict
      // }
    })
  }
  isLogged(): boolean{
    return this.user.id !== undefined && this.user.id !== '' && this.user.id !== null
  }

  goToHome(){
    this.events.publish('tabs:home-push-page', {})
  }

  goToProduct(category){
    this.events.publish('home:proxy-category', {category, type: 'my'});
  }

  goToTrxPurchase(){
    const page = TrxPurchasePage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToTrxSales(){
    const page = TrxSalesPage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToProfile(){
    const page = ProfilePage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToMessage(){
    const page = MessagePage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToComplaint(){
    const page = ComplaintPage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToDiscussion(){
    const page = DiscussionPage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToAdvert(){
    const page = AdvertPage
    this.events.publish('tabs:home-push-page', {page})
  }

  goToWallet(){
    const page = WalletPage
    this.events.publish('tabs:home-push-page', {page})
  }

  redirectToLoginPage(navCtrl){
    let alert = this.alertCtrl.create({
      title: 'Login',
      subTitle: 'Untuk menggunakan fitur ini anda haru login terlebih dahulu!',
      buttons: [
      {
        text: 'Batal',
        role: 'cancel',
      },
      {
        text: 'OK',
        handler: () => {
          navCtrl.push(LoginPage)
        }
      }
      ]
    });

    alert.present()
  }

  presentLoading(){
    let loading = this.loadingCtrl.create({
      content: '<br><img src="assets/img/pet.png"><br>Mohon Tunggu...'
    })

    loading.present()
    this.events.subscribe('app:loading:close', () => {
      loading.dismiss()
      this.events.unsubscribe('app:loading:close')
    })
  }

  inDevelop(){
    let alert = this.alertCtrl.create({
      title: 'Development',
      message: 'Fitur sedang tahap pengembangan',
      buttons: ['OK']
    })

    alert.present()
  }

  login(){
    this.nav.push(LoginPage)
  }

  register(){
    this.nav.push(RegisterPage)
  }

  logout(force:boolean=false){
    this.platform.ready().then(() => {
      if(force){
        let headerOptions: any = { 'Content-Type': 'application/json' };
        let headers = new Headers(headerOptions);
        this.http.post("https://elzumie.com//api/storeprofile"+'?id='+this.storage.retrieve('logged').user.id+'&player_id='+null,{}, { headers: headers }).subscribe(data => {
          console.log(JSON.stringify(data.json()));
        }, error => {
          console.log(JSON.stringify(error.json()));
        });
        this.storage.store('statuscart',null)
        this.nav.push(LoginPage)
        this.services.postLogout()
        this.user = {propict: ''}

      }else{
        let alert = this.alertCtrl.create({
          title: 'Konfirmasi Logout',
          message: 'Anda yakin akan logout?',
          buttons: [
          {
            text: 'Batal',
            role: 'cancel',
          },
          {
            text: 'Ya',
            handler: () => {
              let headerOptions: any = { 'Content-Type': 'application/json' };
              let headers = new Headers(headerOptions);
              this.http.post("https://elzumie.com//api/storeprofile"+'?id='+this.storage.retrieve('logged').user.id+'&player_id='+null,{}, { headers: headers }).subscribe(data => {
                console.log(JSON.stringify(data.json()));
              }, error => {
                console.log(JSON.stringify(error.json()));
              });
              this.storage.store('statuscart',null)
              this.nav.push(LoginPage)
              this.services.postLogout()
              this.user = {propict: ''}
              

              /* Must Unsubscribe avoid conflict */
                /*this.events.unsubscribe('home:set-fix-container-class')
                this.events.unsubscribe('home:set-content')
                this.events.unsubscribe('home:check-notif')
                this.events.unsubscribe('home:set-notif')
                this.events.unsubscribe('home:push-page')
                this.events.unsubscribe('home:proxy-category')
                this.events.unsubscribe('home:proxy-tab')

                this.events.unsubscribe('product:change-category')
                this.events.unsubscribe('product:proxy-detail')
                this.events.unsubscribe('product:refetch')
                this.events.unsubscribe('story:refetch')

                this.events.unsubscribe('tabs:push-page')
                this.events.unsubscribe('tabs:set-count-cart')

                this.events.unsubscribe('notification:fetch')*/
              }
            }
            ]
          });

        alert.present();
      }
    })
  }
}

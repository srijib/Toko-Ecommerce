import { Component, AfterViewInit } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import {
  App,
  Events,
  NavParams,
  LoadingController,
  AlertController,
  NavController,
  ActionSheetController,
  MenuController,
  PopoverController
} from 'ionic-angular';
import { AdMobPro } from '@ionic-native/admob-pro';
import { Platform } from 'ionic-angular';


import { Observable } from 'rxjs/Rx';
// import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';
//
import { Services } from '../../app/services';

import { StoryMorePopover, NotificationPage, StoryFormPage, StoryCommentPage, StoryReportPage, ProductDetailPage,ProductPage, ProductSearchPage } from '../index';

import {get, isEmpty} from 'lodash';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {
  content:string = "home"
  searchText: string
  containerClass: string = "content content-ios"

  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  isLoading:boolean = false

  products:object = {
    'free-adopt': [],
    'losing': [],
    'myfriends': [],
    'stuff': [],
  }

  advertisements:any = []
  notifications: number = 0
  submyfriend:any = []
  substuff:any = []

  tick: any

  categories:object = {
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

  story:any = {
    data: [],
    pagination: {}
  }

  imageLoadOffset$: any
  public adSize: any;
  public adPosition: number;
  public adAutoShow: boolean = false;
  public adPositionOpts = {};
  public keys;
  constructor(
    public app: App,
    public auth:AuthService,
    public events: Events,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public actionSheetCtrl: ActionSheetController,
    private services: Services,
    public googleAnalytics: GoogleAnalytics,
    private admob: AdMobPro, private platform: Platform
    // private streamingMedia: StreamingMedia
  ) {
    platform.ready().then(() => {

      let adId;
      if(this.platform.is('android')) {
        adId = 'ca-app-pub-5448737459199234/2418335509';
      } else if (this.platform.is('ios')) {
        adId = 'ca-app-pub-5448737459199234/7929203550';
      }
      this.admob.prepareInterstitial({
          adId: adId,
          isTesting: false,
          autoShow: true,
          // position: this.admob.AD_POSITION.BOTTOM_CENTER
      })
      this.showInterstitialAd()
     
  });
    // this.events.subscribe('home:set-fix-container-class', () => this.fixContainerClass())
    this.imageLoadOffset$ = Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );

    const content = navParams.get('content')

    if(content){
      this.content = content

      if(content === 'story'){
        this.storyLoadNew()
      }
    }
  }

  showInterstitialAd() {
    if (AdMobPro) {
      this.admob.setOptions({adSize:"FULL_BANNER",overlap:true})
        this.admob.showInterstitial();
    }
}

  google(){
    this.googleAnalytics.startTrackerWithId('UA-131050787-1', 30)
   .then(() => {
     console.log('Google analytics is ready now');
        this.googleAnalytics.trackView('Home Elzumie Apps')
        .then(()=>{
          console.log('Success');
        })
        .catch((e)=>{
          console.log("Faild"+ e)
        })

        this.googleAnalytics.trackView('Screen Title', 'my-scheme://content/1111?utm_source=google&utm_campaign=my-campaign')
        .then(()=>{
          console.log("Success 1")
        })
        .catch((e)=>{
          console.log("Faild 1" + e)
        })

        this.googleAnalytics.trackEvent('Category', 'Action', 'Label', 30)
        .then(()=>{
          console.log("Success Event");
        })
        .catch(()=>{
          console.log("Faild")
        })

        this.googleAnalytics.trackMetric(5)
        .then(()=>{
          console.log("Key Matrics run successfully");
        })
        .catch((e)=>{
          console.log("Faild" + e)
        })

        this.googleAnalytics.trackTiming('Category', 2, 'Variable', 'Label')
        .then(()=>{
          console.log("TrackTiming success")
        })
        .catch((e)=>{
          console.log("Faild"+ e)
        })
     // Tracker is ready
     // You can now track pages or set additional information such as AppVersion or UserId
     this.googleAnalytics.debugMode();
     this.googleAnalytics.setAllowIDFACollection(true);
   })
   .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  ionViewDidLoad(){
    this.events.subscribe('home:set-content', content => this.content = content)
    this.events.subscribe('home:tick', () => this.fetchTick())
    this.events.subscribe('home:set-notif', notifications => this.notifications = notifications)
    this.events.subscribe('home:push-page', ({page, params}) => this.pushPage(page, params))
    this.events.subscribe('home:proxy-category', params => this.goToProduct(params))
    this.events.subscribe('home:proxy-tab', index => this.navCtrl.parent.select(index))
    this.events.subscribe('product:refetch', () => this.fetchProduct())
    this.events.subscribe('story:refetch', () => this.fetchStory('new'))

    this.events.subscribe('home:start-tick', () => {
      this.tick = setInterval(() => this.events.publish('home:tick'), 60000)
    })


   this.showInterstitialAd()
  
  }

  ionViewWillUnload(){
    this.events.unsubscribe('home:set-content')
    this.events.unsubscribe('home:tick')
    this.events.unsubscribe('home:set-notif')
    this.events.unsubscribe('home:push-page')
    this.events.unsubscribe('home:proxy-category')
    this.events.unsubscribe('home:proxy-tab')
    this.events.unsubscribe('product:refetch')
    this.events.unsubscribe('story:refetch')

    this.tick = null
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  isAdmin(): boolean{
    return this.services.user.level === 'admin'
  }

  ngAfterViewInit(){
    this.resetContainerClass()
    this.fetchHome()
    this.prepareStory()
  }

  resetContainerClass(){
    this.containerClass = 'content content-ios'
  }

  fixContainerClass(){
    this.resetContainerClass()
    this.containerClass += ' container-fix'
  }

  fetchHome(loading=false){
    if(loading){
      this.events.publish('app:loading:show')
    }
    return this.services.fetchHome().then(response => {
      const {products, advertisements, notifications,submyfriend,substuff} = response
      this.products = Object.assign({}, this.products, products)
      this.advertisements = Object.assign([], this.advertisements, advertisements)
      this.notifications = notifications
      this.submyfriend = Object.assign([], this.submyfriend, submyfriend)
      this.substuff = Object.assign([], this.substuff, substuff)
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => {
      if(loading){
        this.events.publish('app:loading:close')
      }
    })
  }

  fetchProduct(){
    this.services.fetchProductList().then(products => {
      this.products = Object.assign({}, this.products, products)
    }).catch(error => {
      this.events.publish('app:error', error)
    })
  }

  inDevelop(){
    this.events.publish('app:in-develop')
  }

  search(){
    const {searchText} = this
    this.navCtrl.push(ProductSearchPage, {searchText})
  }

  pushPage(page, params){
    this.navCtrl.parent.select(0);
    this.navCtrl.push(page, params);
  }

  goToCart(){
    this.navCtrl.parent.select(3)
  }

  goToProductDetail(id){
    this.navCtrl.push(ProductDetailPage, {id})
  }

  gotToNotification(){
    if(this.isLogged()){
      const {notifications} = this
      this.navCtrl.push(NotificationPage, {notifications})
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }
  }

  goToProduct(params){
    
    setTimeout(() => this.events.publish('product:change-category', params), 100)
    this.navCtrl.push(ProductPage, params);
  }

  isProductEmpty(categoryKey): boolean{
    return !this.isLoading && isEmpty(this.products[categoryKey])
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  // playVideo(url){
  //   if( ! url ){
  //     return;
  //   }

  //   let options: StreamingVideoOptions = {
  //     successCallback: () => { console.log('Video played') },
  //     errorCallback: (e) => { console.log('Error streaming') },
  //   };

  //   this.streamingMedia.playVideo(url, options);
  // }

  prepareStory(direction='bottom'){
    if(isEmpty(this.story.data)){
      this.fetchStory()
    }
  }

  fetchTick(){
    this.services.fetchTick().then(response => {
      const {notifications, user} = response
      if(this.notifications !== notifications){
        this.events.publish('notification:fetch')
      }
      this.notifications = notifications
      this.events.publish('app:set-user', user)
    }).catch(error => {})
  }

  fetchStory(direction='bottom'){
    let page = 1, last_time = 0, size=5
    const {pagination} = this.story
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

    if(direction === 'top'){
      last_time = get(this.story.data, '0.created_at')
      page = 1
    }


      this.events.publish('app:loading:show')
    return this.services.fetchStory({page, direction, last_time, size}).then(response =>{
      const {data, meta} = response
      if(direction === 'top'){
        this.story.data = Object.assign([], data.concat(this.story.data))
      }else if(direction === 'new'){
        this.story.data = Object.assign([], data)
        this.story.pagination = Object.assign({}, get(meta, 'pagination'))
      }else{
        this.story.data = Object.assign([], this.story.data.concat(data))
        this.story.pagination = Object.assign({}, get(meta, 'pagination'))
      }
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  contentChange(content){
    if(content === 'story'){
      this.prepareStory()
    }
  }

  storyLoadNew(){
    return this.fetchStory('top')
  }

  storyLoadNewRefresher(refresher): Promise<any>{
    return this.storyLoadNew().then((response) => {
      refresher.complete()
    })
  }

  homeRefresher(refresher): Promise<any>{
    return this.fetchHome(true).then((response) => {
      refresher.complete()
    })
  }

  storyLoadMore(infinity): Promise<any>{
    return this.fetchStory('bottom').then((response) => {
      infinity.complete()
    }).catch(error => {
      this.events.publish('app:error', error)
    })
  }

  storyDelete(item){
    let alert = this.alertCtrl.create({
      title: 'Konfirmasi Hapus',
      subTitle: 'Anda yakin akan menghapus story ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Ya, Hapus!',
          handler: () => {
            this.events.publish('app:loading:show')
            this.services.deleteStory(item.id).then(response => {
              this.fetchStory('new')
            }).catch(error => this.events.publish('app:error', error)).then(() => this.events.publish('app:loading:close'))
          }
        }
      ]
    });
    alert.present()
  }

  storyMore(event, item) {
    let action = {
      edit: true,
      delete: true,
      report: true
    }

    let {user} = this.services

    if(item.user.id !== user.id){
      action.edit = false
      action.delete = false
    }else{
      action.report = false
    }

    let isAdmin = this.isAdmin()

    let popover = this.popoverCtrl.create(StoryMorePopover, {action, isAdmin});
    popover.present({
      ev: event
    });

    this.events.subscribe('home:story-popover', action => {
      if(action === 'delete'){
        this.storyDelete(item)
      }else if(action === 'edit'){
        let story = item
        this.navCtrl.push(StoryFormPage, {story, action})
      }else if(action === 'report'){
        let story = item
        this.navCtrl.push(StoryReportPage, {story})
      }
    })

    popover.onDidDismiss(() => this.events.unsubscribe('home:story-popover'))
  }

  ionViewDidEnter(){
    this.google()
  }

  toggleLove(item){
    if(this.isLogged()){
      if(item.is_loved){
        item.summary.loves--
      }else{
        item.summary.loves++
      }
      item.is_loved = !item.is_loved
      this.services.postStoryLove({}, item.id).then(response => {
        const {data} = response
        item.summary.loves = data.summary.loves
        item.summary.comments = data.summary.comments
      }).catch(error => this.events.publish('app:error', error))
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }

  }

  goToStoryComment(story){
    this.navCtrl.push(StoryCommentPage, {story})
  }
  gotostory(){
    this.navCtrl.push(HomePage, {content:'story'})
  }


}

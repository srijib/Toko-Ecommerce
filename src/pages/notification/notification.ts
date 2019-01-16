import { Component } from '@angular/core';
import { NavParams, Events, AlertController, NavController } from 'ionic-angular';

import {
  TrxPurchasePage,
  TrxSalesPage,
  MessagePage,
  DiscussionPage,
  ComplaintPage
} from '../index';

import {Services} from '../../app/services';
import { StoryCommentPage } from '../story/comment';
import { HomePage } from '../home/home';
import { ThreadsPage } from '../threads/threads';

@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class NotificationPage {

  isLoading: boolean = true

  notifications: any = []

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    private services: Services
  ) {

  }

  ionViewDidLoad(){
    this.events.subscribe('notification:fetch', () => this.fetch())
  }

  ionViewDidEnter(){
    this.fetch()
  }

  fetch(){
    this.isLoading = true
    this.events.publish('app:loading:show')
    return this.services.fetchNotification().then(response => {
      const {data} = response
      this.notifications = Object.assign([], data)
    }).catch(error => {})
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
    })
  }

  refresh(refresher): Promise<any>{
    return this.fetch().then(() => {
      refresher.complete()
    })
  }

  goToReference(index){
    let page
    const notif = this.notifications[index]
    if(notif.type === 'order'){
      page = TrxPurchasePage
    }else if(notif.type === 'invoice'){

      const {data} = notif
      const {receiver_type} = data
      if(receiver_type === 'seller'){
        page = TrxSalesPage
      }else{
        page = TrxPurchasePage
      }
    }else if(notif.type === 'message'){
      page = MessagePage
      
    }
  else if(notif.type === 'forum'){
    page = ThreadsPage
  }else if(notif.type === 'story'){
      page =  'story'
    }else if(notif.type === 'discussion'){
      page = DiscussionPage
    }else if(notif.type === 'complaint'){
      page = ComplaintPage
    }

    this.services.postNotificationDismiss(notif.id)
    .then(response => {
      const {data} = response
      this.notifications = Object.assign([], data)
      this.events.publish('home:set-notif', this.notifications.length)
    })
    .catch(error => this.events.publish('app:error', error))

    if(page){
      if(page == 'story'){
        this.navCtrl.push(HomePage, {content:'story'})
      } else {
        this.navCtrl.push(page)
      }
   
    }
  }

  askDismissAll(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menutup semua notifikasi?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Tutup!',
          role: 'destructive',
          handler: () => this.dismissAll()
        }
      ]
    })

    confirm.present()
  }

  dismissAll(){
    this.services.postNotificationDismissAll()
    .then(response => {
      const {data} = response
      this.notifications = Object.assign([], data)
      this.events.publish('home:set-notif', this.notifications.length)
      this.navCtrl.pop()
    })
    .catch(error => this.events.publish('app:error', error))
  }

  askDismiss(index){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menutup notifikasi ini?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Tutup!',
          role: 'destructive',
          handler: () => this.dismiss(index)
        }
      ]
    })

    confirm.present()
  }

  dismiss(index){
    const notif = this.notifications[index]
    this.events.publish('app:loading:show')
    this.services.postNotificationDismiss(notif.id)
    .then(response => {
      const {data} = response
      this.notifications = Object.assign([], data)
      this.events.publish('home:set-notif', this.notifications.length)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }
}

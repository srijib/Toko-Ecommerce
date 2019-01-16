import { Component } from '@angular/core';
import { Events, NavController, LoadingController, AlertController } from 'ionic-angular';

import { Services } from '../../app/services';

import { MessageFormPage } from './form';
import { MessageDetailPage } from './detail';

@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

  isLoading: boolean = true

  threads:any = []

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private events: Events,
    private services: Services
  ) {

  }

  ionViewDidEnter(){
    this.fetchMessage()
  }

  create(){
    this.navCtrl.push(MessageFormPage)
  }

  detail(id){
    this.navCtrl.push(MessageDetailPage, {id})
  }

  fetchMessage(){
    this.isLoading = true
    this.events.publish('app:loading:show')
    return this.services.fetchMessage().then(response => {
      const {data} = response
      this.threads = Object.assign([], data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
    })
  }

  refresh(refresher): Promise<any>{
    return this.fetchMessage().then(() => {
      refresher.complete()
    })
  }
}

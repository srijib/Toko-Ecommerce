import { Component } from '@angular/core';
import { NavParams, Events, NavController, LoadingController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { Services } from '../../app/services';

import {TrxInvoicePage} from '../index';

import {isEmpty} from 'lodash';

@Component({
  selector: 'page-message-detail',
  templateUrl: 'detail.html'
})
export class MessageDetailPage {
  user: any = {}
  id:string = ''

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

  thread:any = {
    messages: []
  }

  message:string = ''

  invoice: any = {}
  transaction: any = {}

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private events: Events,
    private navParams: NavParams,
    private services: Services
  ) {
    this.user = this.services.user
  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ionViewDidEnter(){
    this.id = this.navParams.get('id')
    this.invoice = this.navParams.get('invoice')
    if(this.invoice){
      this.transaction = this.invoice.trx
    }
    this.fetchMessage(this.id)
  }

  ionViewDidLeave(){
    this.invoice = {}
    this.transaction = {}
  }

  shouldInvoiceShow(){
    return !isEmpty(this.invoice) && !isEmpty(this.transaction)
  }

  goToInvoice(){
    let {invoice, transaction} = this

    this.navCtrl.push(TrxInvoicePage, {transaction, invoice})
  }

  fetchMessage(id){
    this.events.publish('app:loading:show')
    this.services.fetchMessageDetail(id, {include: 'messages'}).then(response => {
      const {data} = response
      this.thread = Object.assign({}, this.thread, data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  submit(){
    const {thread, message} = this

    this.events.publish('app:loading:show')
    this.services.updateMessage(thread.id, {thread, message}, {include: 'messages'}).then(response => {
      const {data} = response
      this.thread = Object.assign({}, this.thread, data)
      this.message = ''
    }).catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }
}

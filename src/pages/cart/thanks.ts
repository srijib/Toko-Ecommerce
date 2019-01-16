import { Component } from '@angular/core';
import { Events, NavParams, AlertController, NavController, LoadingController } from 'ionic-angular';

import {CartConfirmPage} from './confirm'

@Component({
  selector: 'page-thanks',
  templateUrl: 'thanks.html'
})
export class CartThanksPage {

  transaction: any = {
    total: 0,
    code: ''
  }

  constructor(
    public events: Events,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
  ) {
    Object.assign(this.transaction, this.navParams.get('transaction'))
  }

  ionViewDidEnter(){
    Object.assign(this.transaction, this.navParams.get('transaction'))
  }

  confirm(){
    const {transaction} = this
    this.navCtrl.push(CartConfirmPage, {transaction})
  }

  backToHome(){
    this.events.publish('home:proxy-tab', 0)
  }

}

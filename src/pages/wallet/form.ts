import { Component } from '@angular/core';
import { NavParams, Events, AlertController, NavController } from 'ionic-angular';

import { Services } from '../../app/services';

const defaultWallet = {
  bank: '',
  account: '',
  attn: '',
  amount: 0,
}

@Component({
  selector: 'page-wallet-form',
  templateUrl: 'form.html'
})
export class WalletFormPage {

  defaultPicture: string = 'assets/img/dummy/500x500.jpg'

  wallet: any = Object.assign({}, defaultWallet)

  user: any = {}

  hasSubmit: boolean = false

  constructor(
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public navCtrl: NavController,
    public events: Events,
    private services: Services,
  ) {

  }

  ionViewDidEnter(){
    this.user = this.services.user

    let wallet = this.navParams.get('wallet')
    this.wallet = Object.assign({}, this.wallet, wallet)
    this.hasSubmit = false
  }

  submit(){
    this.events.publish('app:loading:show')
    this.services.postWallet(this.wallet).then(response => this.afterSubmit(response)).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  async afterSubmit(response){
    let confirm = this.alertCtrl.create({
      title: 'Withdraw',
      message: 'Data withdraw anda telah terkirim!',
      buttons: ['OK']
    })

    await confirm.present()

    confirm.onDidDismiss(() => {
      this.hasSubmit = true
      this.navCtrl.pop()
      this.reset()
      this.events.publish('wallet:refetch')
    })

  }

  reset(){
    this.wallet = Object.assign({}, defaultWallet)
  }

}

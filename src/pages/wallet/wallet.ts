import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';

import { Services } from '../../app/services';

import { WalletFormPage } from './form'
import { WalletWithdrawPage } from './withdraw'

@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html'
})
export class WalletPage {

  wallet: any = {
    data: [],
    meta: {}
  }

  user: any = {

  }

  isLoading: boolean = false

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public services: Services,
  ) {
    this.events.subscribe('app:set-user', user => this.user = Object.assign({}, user))

  }

  async ionViewDidEnter(){
    // this.events.subscribe('wallet:refetch', () => this.fetch())

    await this.services.checkToken()
    await this.fetch()

  }

  fetch(){
    this.events.publish('app:loading:show')
    this.isLoading = true
    this.services.fetchWallet().then(response => {
      const {data, meta} = response
      this.wallet = Object.assign({}, this.wallet, {data, meta})
    }).catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
      
    })

  }

  create(){
    this.navCtrl.push(WalletFormPage)
  }

  withdraw(){
    this.navCtrl.push(WalletWithdrawPage)
  }

}

import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';

import { Services } from '../../app/services';

import { WalletFormPage } from './form'

@Component({
  selector: 'page-withdraw',
  templateUrl: 'withdraw.html'
})
export class WalletWithdrawPage {

  withdraw: any = {
    data: [],
    meta: {}
  }

  user: any = {

  }
  canWithdraw:boolean=true

  isLoading: boolean = false

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public services: Services,
    ) {

  }

  ionViewDidEnter(){
    this.fetch()
    this.user = Object.assign({}, this.services.user)
  }

  fetch(){
    this.events.publish('app:loading:show')
    this.isLoading = true
    this.services.fetchWalletWithdraw().then(response => {
      const {data, meta} = response
      this.withdraw = Object.assign({}, this.withdraw, {data, meta})
    }).catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
      var counter=0;
      var status=new Array();
      for (var data of this.withdraw.data) {
        status[counter]=data.status;        
        counter++;
      }
      if(status[0].includes("Belum Diproses"))
      {
        this.canWithdraw=false
      }
      console.log(this.canWithdraw);
    })
  }

  create(){
    this.navCtrl.push(WalletFormPage)
  }
}

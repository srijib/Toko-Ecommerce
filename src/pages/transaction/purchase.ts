import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { Services } from '../../app/services';

import { TrxInvoicePage } from './invoice';
import {CartConfirmPage} from '../index';

@Component({
  selector: 'page-purchase',
  templateUrl: 'purchase.html'
})
export class TrxPurchasePage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

  isLoading: boolean = true

  purchase:any = {
    data: [],
    meta: {}
  }

  filterKey:string = "*"

  listFilter: any = [
    {label: 'Semua', value: '*'},
    {label: 'Belum Diproses', value: 'belum-diproses'},
    {label: 'Ditolak', value: 'ditolak'},
    {label: 'Diteruskan Ke Penjual', value: 'diteruskan-ke-penjual'},
    {label: 'Dalam Proses/Pengiriman', value: 'dalam-proses-pengiriman'},
    {label: 'Order Selesai', value: 'order-selesai'},
  ]

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public services: Services
  ) {

  }

  ionViewDidEnter(){
    this.fetchTrxPurchase()
  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  goToInvoice(purchaseIndex, invoiceIndex){
    let transaction = this.purchase.data[purchaseIndex]
    let invoice = transaction.invoices[invoiceIndex]

    this.navCtrl.push(TrxInvoicePage, {transaction, invoice})
  }

  fetchTrxPurchase(){
    this.isLoading = true
    this.events.publish('app:loading:show')
    let params = {}
    if(this.filterKey !== '*'){
      params['status'] = this.filterKey
    }
    return this.services.fetchTrxPurchase(params).then(response => {
      const {data, meta} = response
      this.purchase = Object.assign({}, this.purchase, {data, meta})
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
    })
  }

  refresh(refresher): Promise<any>{
    return this.fetchTrxPurchase().then(() => {
      refresher.complete()
    })
  }

  confirm(transaction){
    this.navCtrl.push(CartConfirmPage, {transaction})
  }

  compareFilter(current, selected): boolean {
    return current === selected
  }

  changeFilter(){
    this.fetchTrxPurchase()
  }

}

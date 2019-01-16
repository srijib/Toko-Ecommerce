import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';

import { Services } from '../../app/services';

import { TrxInvoicePage } from './invoice';

@Component({
  selector: 'page-sales',
  templateUrl: 'sales.html'
})
export class TrxSalesPage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

  isLoading: boolean = true

  sales:any = {
    data: [],
    meta: {}
  }

  filterKey:string = "*"

  listFilter: any = [
    {label: 'Semua', value: '*'},
    {label: 'Belum Diproses', value: 'belum-diproses'},
    {label: 'Diproses Penjual', value: 'diproses-penjual'},
    {label: 'Dalam Pengiriman', value: 'dalam-pengiriman'},
    {label: 'Sudah Diterima', value: 'sudah-diterima'},
    {label: 'Ditolak', value: 'ditolak'},
    {label: 'Oh No MyFriends', value: 'oh-no-my-friends'},
  ]

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public services: Services
  ) {

  }

  ionViewDidEnter(){
    this.fetchTrxSales()
  }

  goToInvoice(invoiceIndex){
    let invoice = this.sales.data[invoiceIndex]
    let transaction = invoice.trx

    this.navCtrl.push(TrxInvoicePage, {transaction, invoice})
  }

  fetchTrxSales(){
    console.log("1")
    this.isLoading = true
    this.events.publish('app:loading:show')
    let params = {}
    if(this.filterKey !== '*'){
      params['status'] = this.filterKey
    }
    return this.services.fetchTrxSales(Object.assign({}, {include: 'trx'}, params)).then(response => {
      const {data, meta} = response
      this.sales = Object.assign({}, this.sales, {data, meta})
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.events.publish('app:loading:close')
      this.isLoading = false
    })
  }

  refresh(refresher): Promise<any>{
    return this.fetchTrxSales().then(() => {
      refresher.complete()
    })
  }

  compareFilter(current, selected): boolean {
    return current === selected
  }

  changeFilter(){
    console.log(this.filterKey)
    this.fetchTrxSales()
  }

}

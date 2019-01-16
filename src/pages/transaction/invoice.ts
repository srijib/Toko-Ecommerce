import { Component } from '@angular/core';
import { Events, NavParams, AlertController, NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { Services } from '../../app/services';
import {TrxShipmentPage} from './shipment';
import {TrxRatingPage} from './rating';
import {ComplaintFormPage, ProductStorePage, ReviewPage} from '../index';

import { DomSanitizer } from '@angular/platform-browser';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpModule } from '@angular/http';

@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html'
})
export class TrxInvoicePage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'
date: Date;
  user: any = {

  }
  tracking:any

  transaction:any = {
    buyer: {

    }
  }

  invoice:any = {
    items: [],
    shipment: {
      send: {}
    },
    status: {},
    seller: {},
    confirm: {},
    rating: {}
  }

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public events: Events,
    public services: Services,
    public sanitizer: DomSanitizer,
    public http: Http,
  ) {
  setTimeout(()=>{
  this.http.get('https://elzumie.com//api/tracking/'+this.invoice.shipment.send.proof+'/'+this.invoice.shipment.send.courier).map(res => res.json()).subscribe( data => {
        this.tracking = data;
        
    },
    err => {
        console.log("Oops!");
    });
    },3000)


  }

  ionViewDidEnter(){
    this.user = this.services.user
    this.transaction = Object.assign({}, this.transaction, this.navParams.get('transaction'))
    this.invoice = Object.assign({}, this.invoice, this.navParams.get('invoice'))
    this.fetchTrxInvoice()
    this.date = this.invoice.expired;


  }

  fetchTrxInvoice(){
    this.events.publish('app:loading:show')
    this.services.fetchTrxInvoiceDetail(this.invoice.id, {include: 'items,shipment,confirm'}).then(response => {
      const {data} = response
      this.invoice = Object.assign({}, this.invoice, data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
    console.log(this.codeone());
  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  isSeller(): boolean{
    return this.user.username === this.invoice.seller.username
  }

  isBuyer(): boolean{
    return this.user.username === this.transaction.buyer.username
  }

  isAdmin(): boolean{
    return this.user.level === 'admin'
  }
  isStuff(): boolean{
    return this.invoice.details[0] === 'stuff'
  }

  shouldRatingShow(): boolean{
    return this.isBuyer() && this.invoice.status.code === 3 && !this.invoice.rating.rated
  }

  shouldActionShow(): boolean{
    return this.isSeller() && this.invoice.status.code === 0
  }
  codeone(): boolean{
    return this.isSeller() && this.invoice.status.code === 1
  }

  shouldProofShow(): boolean{
    return this.isSeller() && this.invoice.status.code >= 1 && this.invoice.status.code < 3 
  }

  shouldReceiveShow(): boolean{
    return this.isBuyer() && this.invoice.status.code === 2
  }

  askReject(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menolak pesanan ini?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Tolak!',
          role: 'destructive',
          handler: () => this.reject()
        }
      ]
    })

    confirm.present()
  }

  reject(){
    this.events.publish('app:loading:show')
    this.services.postTrxInvoiceReject(this.invoice.id, {include: 'items,shipment'}).then(response => {
      const {data} = response
      this.invoice = Object.assign({}, this.invoice, data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  askApprove(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin menerima pesanan ini?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Terima!',
          role: 'destructive',
          handler: () => this.approve()
        }
      ]
    })

    confirm.present()
  }

  approve(){
    this.events.publish('app:loading:show')
    this.services.postTrxInvoiceApprove(this.invoice.id, {include: 'items,shipment'}).then(response => {
      const {data} = response
      this.invoice = Object.assign({}, this.invoice, data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  askReceive(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin telah menerima pesanan ini?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Sudah!',
          role: 'destructive',
          handler: () => this.receive()
        }
      ]
    })

    confirm.present()
  }

  receive(){
    this.events.publish('app:loading:show')
    this.services.postTrxInvoiceReceive(this.invoice.id, {include: 'items,shipment'}).then(response => {
      const {data} = response
      this.invoice = Object.assign({}, this.invoice, data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  shipment(){
    const {invoice} = this
    this.navCtrl.push(TrxShipmentPage, {invoice})
  }

  askComplaint(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin membuka keluhan?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya!',
          role: 'destructive',
          handler: () => this.complaint()
        }
      ]
    })

    confirm.present()
  }

  complaint(){
    const {transaction, invoice} = this
    this.navCtrl.push(ComplaintFormPage, {transaction, invoice})
  }

  rating(){
    const {transaction, invoice} = this
    this.navCtrl.push(TrxRatingPage, {transaction, invoice})
  }

  goToReview(){
    const {seller: store} = this.invoice
    this.navCtrl.push(ReviewPage, {store})
  }

  goToStore(){
    const {seller: store} = this.invoice
    this.navCtrl.push(ProductStorePage, {store})
  }

  /*fetchTrxPurchase(){
    this.events.publish('app:loading:show')
    this.services.fetchTrxPurchase().then(response => {
      const {data, meta} = response
      this.purchase = Object.assign({}, this.purchase, {data, meta})
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }*/

trackurl()
{

  return "https://elzumie.com//tracking.php?resi="+this.invoice.shipment.send.proof+"&courier="+this.invoice.shipment.send.courier
}

}

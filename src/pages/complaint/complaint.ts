import { Component } from '@angular/core';
import { NavParams, Events, AlertController, NavController } from 'ionic-angular';

import {MessageDetailPage} from '../index';

import {Services} from '../../app/services';

@Component({
  selector: 'page-complaint',
  templateUrl: 'complaint.html'
})
export class ComplaintPage {

  isLoading: boolean = true

  complaints: any = []

  filterKey:string = "*"

  listFilter: any = [
    {label: 'Semua', value: '*'},
    {label: 'Belum Selesai', value: 'belum-selesai'},
    {label: 'Sudah Selesai', value: 'sudah-selesai'},
  ]

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    private services: Services
  ) {

  }

  ionViewDidLoad(){
    this.events.subscribe('complaint:fetch', () => this.fetch())
  }

  ionViewDidEnter(){
    this.fetch()
  }

  detail(item){
    const id = item.thread.id
    const invoice = item.invoice
    this.navCtrl.push(MessageDetailPage, {id, invoice})
  }

  fetch(){
    this.isLoading = true
    let params = {}

    if(this.filterKey !== '*'){
      params['status'] = this.filterKey
    }

    this.events.publish('app:loading:show')
    return this.services.fetchComplaint(Object.assign({}, {include: 'invoice.trx,thread.last_message'}, params)).then(response => {
      const {data} = response
      this.complaints = Object.assign([], data)
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

  compareFilter(current, selected): boolean {
    return current === selected
  }

  shouldCloseShow(item): boolean{
    return item.status.code === 0 && this.services.user.id === item.buyer.id
  }

  changeFilter(){
    this.fetch()
  }

  askOpen(index){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan membuka komplain ini?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Buka!',
          role: 'destructive',
          handler: () => this.open(index)
        }
      ]
    })

    confirm.present()
  }

  open(index){
    const item = this.complaints[index]
    this.events.publish('app:loading:show')
    this.services.postComplaintOpen(item.id, {include: 'invoice,thread.last_message'})
    .then(response => this.afterOpenClose(index, response))
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  askClose(index){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin komplain ini sudah selesai?',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Sudah!',
          role: 'destructive',
          handler: () => this.close(index)
        }
      ]
    })

    confirm.present()
  }

  close(index){
    const item = this.complaints[index]
    this.events.publish('app:loading:show')
    this.services.postComplaintClose(item.id, {include: 'invoice,thread.last_message'})
    .then(response => this.afterOpenClose(index, response))
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  afterOpenClose(index, response){
    const {data} = response
    this.complaints[index] = Object.assign({}, data)
  }
}

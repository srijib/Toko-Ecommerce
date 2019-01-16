import { Component } from '@angular/core';
import { Events, NavController, LoadingController, AlertController } from 'ionic-angular';

import { Services } from '../../app/services';

@Component({
  selector: 'page-message-form',
  templateUrl: 'form.html'
})
export class MessageFormPage {

  listReceipts: any = []
  receipts: any = []
  subject: string = ''
  message: string = ''

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private events: Events,
    private services: Services
  ) {

  }

  ionViewDidLoad(){
    this.prepareReceipt()
  }

  prepareReceipt(){
    this.events.publish('app:loading:show')
    this.services.fetchMessageReceipt().then(listReceipts => {
      this.listReceipts = Object.assign([], listReceipts)
    }).catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  submit(){
    const {receipts, subject, message} = this
    this.events.publish('app:loading:show')
    this.services.postMessage({receipts, subject, message}).then(response => this.afterSubmit(response)).catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  afterSubmit(response){
    let confirm = this.alertCtrl.create({
      title: 'Pesan',
      message: 'Pesan telah terkirim!',
      buttons: ['OK']
    })

    // const {data} = response

    confirm.present()
    confirm.onDidDismiss(() => {
      this.navCtrl.pop()
      this.reset()
    })

  }

  reset(){
    this.receipts = []
    this.subject = ''
    this.message = ''
  }
}

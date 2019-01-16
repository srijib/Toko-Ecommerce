import { Component } from '@angular/core';
import { Events, NavParams, NavController, LoadingController, AlertController } from 'ionic-angular';

import { Observable } from 'rxjs/Rx';
import { Services } from '../../app/services';

@Component({
  selector: 'page-complaint-form',
  templateUrl: 'form.html'
})
export class ComplaintFormPage {

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
    confirm: {}
  }

  subject: string = ''
  message: string = ''

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private events: Events,
    private services: Services
  ) {

  }

  ionViewDidEnter(){
    this.transaction = Object.assign({}, this.transaction, this.navParams.get('transaction'))
    this.invoice = Object.assign({}, this.invoice, this.navParams.get('invoice'))
  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  submit(){
    const {invoice, subject, message} = this
    this.events.publish('app:loading:show')
    this.services.postComplaint({invoice, subject, message})
    .then(response => this.afterSubmit(response))
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  afterSubmit(response){
    let confirm = this.alertCtrl.create({
      title: 'Komplain',
      message: 'Komplain anda telah terkirim!',
      buttons: ['OK']
    })

    // const {data} = response

    confirm.present()
    confirm.onDidDismiss(() => {
      this.navCtrl.pop()
    })

  }
}

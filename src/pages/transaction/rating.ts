import { Component } from '@angular/core';
import { Events, NavParams, NavController, LoadingController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { Services } from '../../app/services';

@Component({
  selector: 'page-transaction-rating',
  templateUrl: 'rating.html'
})
export class TrxRatingPage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

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

  message: string = ''
  score: number = 0

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private events: Events,
    private services: Services
  ) {

  }

  imageLoadOffset$(): any{
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ionViewDidEnter(){
    this.invoice = Object.assign({}, this.invoice, this.navParams.get('invoice'))
  }

  submit(){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin dengan penilaian rating anda!',
      buttons: [
        {text: 'Batal'},
        {
          text: 'Ya, Kirim!',
          role: 'destructive',
          handler: () => {
            const {invoice, score, message} = this

            this.events.publish('app:loading:show')
            this.services.postRatingSeller({invoice, score, message})
            .then(response => this.afterSubmit(response))
            .catch(error => this.events.publish('app:error', error))
            .then(() => this.events.publish('app:loading:close'))
          }
        }]
    })

    confirm.present()
  }

  onRatingChange(){
    console.log(this.score)
  }

  afterSubmit(response){
    let confirm = this.alertCtrl.create({
      title: 'Rating',
      message: 'Penilaian anda telah terkirim!',
      buttons: ['OK']
    })

    confirm.present()
    confirm.onDidDismiss(() => {
      this.reset()

      if(this.navCtrl.canGoBack()){
        this.navCtrl.pop()
      }
    })

  }

  reset(){
    this.score = 0
    this.message = ''
  }
}

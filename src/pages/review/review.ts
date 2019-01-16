import { Component } from '@angular/core';
import { NavParams, Events, AlertController, NavController } from 'ionic-angular';

import {Services} from '../../app/services';

@Component({
  selector: 'page-review',
  templateUrl: 'review.html'
})
export class ReviewPage {

  defaultPropict: string = './assets/img/dummy/avatar.jpg'

  store: any = {
    profile: {}
  }
  reviews: any = []

  isLoading: boolean = true

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    private services: Services
  ) {

  }

  ionViewDidEnter(){
    this.store = Object.assign({}, this.store, this.navParams.get('store'))
    this.fetch()
  }

  fetch(){
    this.events.publish('app:loading:show')
    this.isLoading = true
    this.services.fetchRatingReview(this.store.id)
    .then(response => {
      const {data} = response
      this.reviews = Object.assign([], data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.isLoading = false
      this.events.publish('app:loading:close')
    })
  }
}

import { Component } from '@angular/core';
import { NavParams, Events, AlertController, NavController } from 'ionic-angular';

import {DiscussionFormPage} from './form';

import {Services} from '../../app/services';

@Component({
  selector: 'page-discussion',
  templateUrl: 'discussion.html'
})
export class DiscussionPage {

  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  discussions: any = []

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
    this.fetch()
  }

  goToDiscussion(index){
    const product = this.discussions[index]
    this.events.publish('app:loading:show')
    return this.services.fetchProductById(product.id).then( response => {
      const {data} = response
      this.navCtrl.push(DiscussionFormPage, {product: data})
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  fetch(){
    this.events.publish('app:loading:show')
    this.isLoading = true
    this.services.fetchDiscussion({include: 'first_comment'})
    .then(response => {
      const {data} = response
      this.discussions = Object.assign([], data)
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => {
      this.isLoading = false
      this.events.publish('app:loading:close')
    })
  }
}

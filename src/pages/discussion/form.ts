import { Component, ViewChild } from '@angular/core';
import { Content, Events, NavParams, NavController, LoadingController } from 'ionic-angular';
import { Services } from '../../app/services';
import { ReplyPage } from '../reply/reply';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-discussion-form',
  templateUrl: 'form.html'
})

export class DiscussionFormPage {
  @ViewChild(Content) content: Content;
  @ViewChild('form') form: any;
  ReplyPage : ReplyPage;

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  loading: any
  isLoading: boolean = false

  product: any = {
    id: '',
    title: '',
    images: [],
    user: {
      propict: '',
      profile: {
        social: []
      }
    },
    comments: [],
    product: {},
    category: {}
  }

  comment: any = {
    data: [],
    meta: {}
  }

  message: string = ''

  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private services: Services,
  ) {
  }

  ionViewDidLoad(){
    this.product = Object.assign({}, this.product, this.navParams.get('product'))
    this.comment.data = Object.assign([], this.product.comments)
  }

  ionViewDidEnter(){
    setTimeout(() => this.scrollToForm(), 300)
  }

  scrollToForm(){
    let offset: number = this.form.nativeElement.offsetTop
    this.content.scrollTo(0, offset, 800)
  }

  imageLoadOffset$(){
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  submit(){
    this.events.publish('app:loading:show')
    const id = this.product.id
    const message = this.message
    this.services.postDiscussion({id, message}, {include: 'user'}).then( comments => {
      const {data, meta} = comments
      this.comment = Object.assign({}, {data, meta})
      this.message = ''
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  fetchDiscuss(id){

    /*this.events.publish('app:loading:show')

    return this.services.fetchProductById(id).then( response => {
      const {product, comment} = response
      this.product = this
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:hide'))*/
  }
  goToReply(id){
    this.navCtrl.push(ReplyPage, {id})
  }

}

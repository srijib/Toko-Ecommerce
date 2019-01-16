import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Services } from '../../app/services';
import { Content, Events, LoadingController } from 'ionic-angular';
/**
 * Generated class for the ReplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reply',
  templateUrl: 'reply.html',

})
export class ReplyPage {
apimaindisc:any;
apireplydisc:any;
id:any;
comment:any;
message:any
  constructor(public navCtrl: NavController, public navParams: NavParams,  
  public http: Http,
  public events: Events,
  private services: Services,
  public loadingCtrl: LoadingController,
    ) {
  this.id = navParams.get('id')
  this.http.get('https://elzumie.com//api/apimaindisc/'+this.id).map(res => res.json()).subscribe( data => {
        this.apimaindisc = data;
        
    },
    err => {
        console.log("Oops!");
    });
    this.http.get('https://elzumie.com//api/apireplydisc/'+this.id).map(res => res.json()).subscribe( data => {
        this.apireplydisc = data;
        
    },
    err => {
        console.log("Oops!");
    });
  }

  ionViewDidLoad() {
    
  }
    imageLoadOffset$(){
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }
  submit(){
  this.events.publish('app:loading:show')
    const id = this.id
    const message = this.message
    this.services.postReply({id, message}, {include: 'user'}).then( comments => {
      const {data, meta} = comments
      this.comment = Object.assign({}, {data, meta})
      this.message = '';
      this.navCtrl.pop()
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
setTimeout(() => this.navCtrl.push(ReplyPage, {id}), 3000)
  }

}

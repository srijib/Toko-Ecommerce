import { Component } from '@angular/core';
import { Events, NavController, MenuController, LoadingController, AlertController } from 'ionic-angular';

import { Services } from '../../app/services';

import { TabsPage } from '../tabs/tabs';
import { RegisterPage } from '../register/register';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { LocalStorageService } from 'ngx-webstorage';
import { OneSignal } from '@ionic-native/onesignal';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { UserCredentials } from '../../shared/interfaces';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string = ''
  password: string = ''

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private events: Events,
    private services: Services,
    private fb: Facebook,
    private storage: LocalStorageService,
    public oneSignal:OneSignal,
    public http: Http,
    public dataService: DataService,
    public authService: AuthService,
    
    ) {

  }

  ionViewDidEnter(){
    this.menuCtrl.swipeEnable(false)
  }

  ionViewDidLeave(){
    this.menuCtrl.swipeEnable(true)
  }

  inDevelop(){
    this.events.publish('app:in-develop')
  }

  submit(){
    this.events.publish('app:loading:show')

    const {username, password} = this
    this.services.postLogin({username, password}).then( response => {
      this.services.parseLogged(response)
      this.navCtrl.setRoot(TabsPage)
      let headerOptions: any = { 'Content-Type': 'application/json' };
      let headers = new Headers(headerOptions);
      this.http.post("https://elzumie.com//api/storeprofile"+'?id='+this.storage.retrieve('logged').user.id+'&player_id='+this.storage.retrieve('player_id'),{}, { headers: headers }).subscribe(data => {
        console.log(JSON.stringify(data.json()));
      }, error => {
        console.log(JSON.stringify(error.json()));
      });
      let newUser: UserCredentials = {
        email: this.storage.retrieve('logged').user.email,
        password: password
    };


      this.authService.registerUser(newUser)
      .then((result:any)  => {
        console.log('userterbuat')
        
      }).catch((error:any) => {
      
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(error);
          this.authService.signInUser(this.storage.retrieve('logged').user.email, password)
          
      })
      // this.events.publish('app:set-root', TabsPage)
    }).catch(error => {
      const {response} = error
      if(response.data.messages){
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: response.data.messages.join(', '),
          buttons: ['OK']
        });
        alert.present()
      }
    }).then((data) => {
      this.events.publish('app:loading:close')
    })
  }

  reset(){
    this.username = ''
    this.password = ''
  }

  register(){
    this.navCtrl.push(RegisterPage)
  }

  facebook(){
    this.events.publish('app:loading:show')
    this.fb.login(['public_profile', 'user_friends', 'email'])
    .then((response: FacebookLoginResponse) => {
      this.services.postLoginFacebook(response.authResponse).then(result => {
        this.services.parseLogged(result)
        this.navCtrl.setRoot(TabsPage)
        this.events.publish('app:loading:close')
      }).catch(error => this.events.publish('app:error', error))
    })
    .catch(error => {
      this.events.publish('app:error', error)
      this.events.publish('app:loading:close')
    })
  }
}

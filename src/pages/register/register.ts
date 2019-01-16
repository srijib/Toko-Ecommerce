import { Component } from '@angular/core';
import {  Events,NavController, LoadingController, AlertController } from 'ionic-angular';
import { LoginPage, TabsPage } from '../index';
import { Services } from '../../app/services';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { UserCredentials } from '../../shared/interfaces';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  templateUrl: 'register.html'
})
export class RegisterPage{

  loading: any
  username: string = ''
  password: string = ''
  name: string = ''
  email: string = ''
  password_confirmation: string = ''
  privacy_policy : boolean = false

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private services: Services,
    private iab: InAppBrowser,
    public dataService: DataService,
    public authService: AuthService,
    private events: Events
  ) {

  }

  login(){
    this.navCtrl.setRoot(LoginPage)
  }

  presentLoading(){
    this.loading = this.loadingCtrl.create({
      content: 'Mohon Tunggu...'
    })

    this.loading.present()

    return this.loading
  }

  showPrivacyPolicy(){
    this.iab.create('https://elzumie.com/page/privacy-policy')
  }

  submit(){
    if(this.privacy_policy)
    {
      this.presentLoading()
      const {username, password, name, email, password_confirmation} = this
      let newUser: UserCredentials = {
        email: email,
        password: password
    };
      this.authService.registerUser(newUser)
      this.services.postRegister({username, name, email,password, password_confirmation}).then( response => {
        const {data} = response;
        this.events.publish('app:set-user', data)
        let alert = this.alertCtrl.create({
          title: 'Success!',
          subTitle: "Registrasi berhasil!, mohon periksa inbox / spam email anda untuk melakukan aktivasi",
          buttons: ['OK']
        });
        alert.present()

        this.navCtrl.setRoot(TabsPage)
       
      }).catch(error => {
        const {response} = error
        if(response.data.username){
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: response.data.username[0],
            buttons: ['OK']
          });
          alert.present()
        }
        if(response.data.password){
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: response.data.password[0],
            buttons: ['OK']
          });
          alert.present()
        }
        if(response.data.email){
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: response.data.email[0],
            buttons: ['OK']
          });
          alert.present()
        }
        if(response.data.name){
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: response.data.name[0],
            buttons: ['OK']
          });
          alert.present()
        }
      }).then((data) => {
        this.loading.dismiss()
      })
    }else{
      let alert = this.alertCtrl.create({
        title: 'Peringatan!',
        subTitle: 'Harap setujui privacy policy terlebih dahulu.',
        buttons: ['OK']
      });
      alert.present()
    }
  }
}

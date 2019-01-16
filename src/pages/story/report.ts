import { Component } from '@angular/core';
import { Events, NavParams, AlertController, NavController } from 'ionic-angular';
import { Services } from '../../app/services';

@Component({
  selector: 'page-story-report',
  templateUrl: 'report.html'
})
export class StoryReportPage {

  user:any = {
    propict: {}
  }

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultImage: string = 'assets/img/dummy/500x500.jpg'

  story: any = {
    id: '',
    caption: '',
    comments: [],
    user: {
      profile: {
        social: []
      }
    },
    media: {},
    summary: {},
    type: ''
  }

  message: string = ''

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public events: Events,
    public navParams: NavParams,
    private services: Services,
  ) {

    this.user = Object.assign({}, this.user, this.services.user)
  }

  ionViewDidLoad(){
    this.story = Object.assign({}, this.story, this.navParams.get('story'))
  }

  alertConfirmReported(){
    let alert = this.alertCtrl.create({
      title: 'Laporan',
      message: 'Laporan anda telah terkirim',
      buttons: ['OK']
    })

    alert.onDidDismiss(() => this.navCtrl.pop())
    alert.present()
  }

  submit(){
    this.events.publish('app:loading:show')
    const id = this.story.id
    const message = this.message
    this.services.postStoryReport({id, message}, {include: 'user'}).then( response => {
      const {data} = response

      this.story = Object.assign({}, this.story, data)
      this.message = ''
      this.alertConfirmReported()
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

}

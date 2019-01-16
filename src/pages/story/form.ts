import { Component } from '@angular/core';
import { Events, LoadingController, NavController, ActionSheetController, MenuController, NavParams } from 'ionic-angular';

// import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';

import { Services } from '../../app/services';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-story-form',
  templateUrl: 'form.html'
})
export class StoryFormPage {

  file: object = {
    thumbnail: ''
  }

  action: string = 'add'

  story: any = {

  }

  loading: any

  caption: string

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public events: Events,
    public actionSheetCtrl: ActionSheetController,
    private services: Services,
    // private streamingMedia: StreamingMedia
  ) {
  }

  ionViewDidLoad(){
    this.action = this.navParams.get('action') || 'add'
    this.file = Object.assign({}, this.file, this.navParams.get('file'))
    this.story = Object.assign({}, this.story, this.navParams.get('story'))

    if(this.action === 'edit'){
      this.caption = this.story.caption
    }
  }

  submit(){
    const story = {
      caption: this.caption,
      user_id: this.services.user.id,
      file: this.file
    }

    this.events.publish('app:loading:show')
    if(this.action === 'add'){
      this.services.postStory(story)
      .then( response => this.afterSubmit(response))
      .catch(error => this.events.publish('app:error', error))
    }else{
      this.services.updateStory(this.story.id, story)
      .then( response => this.afterSubmit(response))
      .catch(error => this.events.publish('app:error', error))
    }
  }

  async afterSubmit(response){
    await this.events.publish('app:loading:close')
    //await this.events.publish('home:set-content', 'story')
    // await this.events.publish('home:set-fix-container-class')
    // await this.events.publish('story:refetch')
    await this.navCtrl.push(HomePage,{content:'story'})
    setTimeout(() => {
      this.file = Object.assign({}, {thumbnail: ''})
      this.caption = ''
      this.action = 'add'
    }, 200)
  }

  // playVideo(url){
  //   if( ! url ){
  //     return;
  //   }

  //   let options: StreamingVideoOptions = {
  //     successCallback: () => { console.log('Video played') },
  //     errorCallback: (e) => { console.log('Error streaming') },
  //   };

  //   this.streamingMedia.playVideo(url, options);
  // }
}

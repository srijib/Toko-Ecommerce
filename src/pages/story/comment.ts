import { Component } from '@angular/core';
import { Events, NavParams, AlertController } from 'ionic-angular';
import { Services } from '../../app/services';

@Component({
  selector: 'page-story-comment',
  templateUrl: 'comment.html'
})
export class StoryCommentPage {

  user:any = {
    propict: {}
  }

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultImage: string = 'assets/img/dummy/500x500.jpg'

  loading: any
  isLoading: boolean = false

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

  comment: any = {
    data: [],
    meta: {}
  }

  message: string = ''

  constructor(
    public alertCtrl: AlertController,
    public events: Events,
    public navParams: NavParams,
    private services: Services,
  ) {

    this.user = Object.assign({}, this.user, this.services.user)
    this.story = Object.assign({}, this.story, this.navParams.get('story'))
  }

  ionViewDidEnter(){
    this.story = Object.assign({}, this.story, this.navParams.get('story'))
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  submit(){
    this.events.publish('app:loading:show')
    const id = this.story.id
    const message = this.message
    this.services.postStoryComment({id, message}, {include: 'user'}).then( response => {
      const {data} = response

      this.story = Object.assign({}, this.story, data)
      this.message = ''
      this.events.publish('story:refetch')
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  askRemove(commentIndex){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menghapus komentar ini?',
      buttons: [
        {
          text: 'Batal'
        },
        {
          text: 'Ya, Hapus!',
          role: 'destructive',
          handler: () => this.remove(commentIndex)
        }
      ]
    })

    confirm.present()
  }

  remove(commentIndex){
    this.events.publish('app:loading:show')
    const comment = this.story.comments[commentIndex]
    this.services.deleteStoryComment(comment.id).then(response => {
      this.story.comments.splice(commentIndex, 1)
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

}

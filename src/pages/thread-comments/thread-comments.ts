import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, ToastController, LoadingController, NavParams, Content, AlertController } from 'ionic-angular';

import { CommentCreatePage } from '../comment-create/comment-create';
import { IComment } from '../../shared/interfaces';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { ItemsService } from '../../shared/services/items.service';
import { MappingsService } from '../../shared/services/mappings.service';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../../app/config'
@Component({
    templateUrl: 'thread-comments.html'
})
export class ThreadCommentsPage implements OnInit {
    @ViewChild(Content) content: Content;
    threadKey: string;
    commentsLoaded: boolean = false;
    comments: any[];

admin:any = this.storage.retrieve('logged').user.level == 'admin';
user:any = this.storage.retrieve('logged').user.id
    constructor(public actionSheeCtrl: ActionSheetController,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public navParams: NavParams,
        public authService: AuthService,
        public itemsService: ItemsService,
        public dataService: DataService,
        private api:HttpClient,
        public mappingsService: MappingsService, private storage:LocalStorageService, public alertController: AlertController) { }

    ngOnInit() {
      console.log(this.admin)
      console.log(this.user)
     this.runService()
    }

    runService(){
        let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
        this.api.get(baseURL + 'qa/' + this.navParams.get('id'),{headers:headers}).subscribe((data:any)=>{
            console.log(data)
            this.comments = data.data.comments
        })
    }
    createComment() {
        let self = this;

        let modalPage = this.modalCtrl.create(CommentCreatePage, {
            id: this.navParams.get('id')
        });

        modalPage.onDidDismiss((commentData: any) => {
           this.runService()
        });

        modalPage.present();
    }

    delete(comment){
        console.log(comment)
        const alert =  this.alertController.create({
            title: 'Confirm!',
            message: 'Are you sure want to delete this comment?',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                  console.log('cancel');
                }
              }, {
                text: 'Okay',
                handler: () => {
                    // let loading = this.loadingCtrl.create({
                    //     content:'Deleting...'
                    // })
                    // loading.present()
                    let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
                     this.api.delete(baseURL + 'qa/' + comment.id + '/comment',{headers:headers}).subscribe((data)=>{
                         console.log(data);
                        //  loading.dismiss()
                         let toast = this.toastCtrl.create({
                             message: 'Comment deleted',
                             duration: 2000,
                             position: 'top'
                         });
                         toast.present();
                      this.runService()
                     }) 
            
               
                }
              }
            ]
          });
      
           alert.present();
       
        
    }

    scrollToBottom() {
        this.content.scrollToBottom();
    }

    // vote(like: boolean, comment: IComment) {
    //     var self = this;

    //     self.dataService.voteComment(comment.key, like, self.authService.getLoggedInUser().uid).then(function () {
    //         self.dataService.getCommentsRef().child(comment.key).once('value').then(function (snapshot) {
    //             comment = self.mappingsService.getComment(snapshot, comment.key);
    //             self.itemsService.setItem<IComment>(self.comments, c => c.key === comment.key, comment);
    //         });
    //     });
    // }

    like(id){
        let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
        this.api.post(baseURL + 'qa/' + id + '/comment/like',{},{headers:headers}).subscribe((data:any)=>{
            console.log(data)
           this.runService()
        })
    }
    dislike(id){
        let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
        this.api.post(baseURL + 'qa/' + id + '/comment/dislike',{},{headers:headers}).subscribe((data:any)=>{
            console.log(data)
            this.runService()
        })
    }

    showCommentActions() {
        var self = this;
        let actionSheet = self.actionSheeCtrl.create({
            title: 'Thread Actions',
            buttons: [
                {
                    text: 'Add to favorites',
                    icon: 'heart',
                    handler: () => {
                        self.addThreadToFavorites();
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close-circle',
                    role: 'cancel',
                    handler: () => { }
                }
            ]
        });

        actionSheet.present();
    }

    addThreadToFavorites() {
        var self = this;
        let currentUser = self.authService.getLoggedInUser();
        if (currentUser != null) {
            self.dataService.addThreadToFavorites(currentUser.uid, self.threadKey)
                .then(function () {
                    let toast = self.toastCtrl.create({
                        message: 'Added to favorites',
                        duration: 3000,
                        position: 'top'
                    });
                    toast.present();
                });
        } else {
            let toast = self.toastCtrl.create({
                message: 'This action is available only for authenticated users',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        }
    }
}
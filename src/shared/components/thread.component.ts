import { Component, EventEmitter, OnInit, OnDestroy, Input, Output, ViewChild, Renderer } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';

import { IThread } from '../interfaces';
import { DataService } from '../services/data.service';
import { LocalStorageService } from 'ngx-webstorage';


    @Component({
      selector: 'forum-thread',
      templateUrl: 'thread.component.html'
  })

export class ThreadComponent implements OnInit, OnDestroy {
    @Input() thread: IThread;
    @Output() onViewComments = new EventEmitter<string>();
    @Output() onDelete = new EventEmitter<any>();
    admin:any = this.storage.retrieve('logged').user.level == 'admin';
    user:any = this.storage.retrieve('logged').user.id
    constructor(private loading: LoadingController, private toastCtrl:ToastController,  private dataService: DataService, private storage:LocalStorageService, public navCtrl: NavController,
        private socialSharing: SocialSharing) { }

    ngOnInit() {
        var self = this;
        // self.dataService.getThreadsRef().child(self.thread.key).on('child_changed', self.onCommentAdded);
       
    }

    ngOnDestroy() {
         console.log('destroying..');
        var self = this;
        // self.dataService.getThreadsRef().child(self.thread.key).off('child_changed', self.onCommentAdded);
    }

    // Notice function declarion to keep the right this reference
    // public onCommentAdded = (childSnapshot, prevChildKey) => {
    //    console.log(childSnapshot.val());
    //     var self = this;
    //     // Attention: only number of comments is supposed to changed.
    //     // Otherwise you should run some checks..
    //     self.thread.comments = childSnapshot.val();
    // }

   
    viewComments(id: string) {
        this.onViewComments.emit(id);
    }

    Delete(comment:any) {
        this.onDelete.emit(comment);
    }
   
    shareSheetShare(thread) {
        this.socialSharing.share(thread.content, thread.caption, '', 'https://elzumie.com').then(() => {
          console.log("shareSheetShare: Success");
        }).catch(() => {
          console.error("shareSheetShare: failed");
        });
      }

}
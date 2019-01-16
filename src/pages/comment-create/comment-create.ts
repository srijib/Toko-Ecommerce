import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, LoadingController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';

import { IComment, IUser } from '../../shared/interfaces';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../../app/config'
@Component({
  templateUrl: 'comment-create.html'
})
export class CommentCreatePage implements OnInit {

  createCommentForm: FormGroup;
  comment: AbstractControl;
  threadKey: string;
  loaded: boolean = false;
  komen:any;
  constructor(public nav: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public authService: AuthService,
    public dataService: DataService,
    private storage:LocalStorageService,private api:HttpClient, private toast:ToastController) {

  }

  ngOnInit() {
    this.threadKey = this.navParams.get('threadKey');

    this.createCommentForm = this.fb.group({
      'comment': ['', Validators.compose([Validators.required])]
    });

    this.comment = this.createCommentForm.controls['comment'];
    this.loaded = true;
  }

  cancelNewComment() {
    this.viewCtrl.dismiss();
  }

  onSubmit(commentForm: any): void {
    var self = this;
    if (this.createCommentForm.valid) {

      let loader = this.loadingCtrl.create({
        content: 'Posting comment...',
        dismissOnPageChange: true
      });

      loader.present();
       
        let data = JSON.stringify(
          {
            "id":this.navParams.get('id'),
            "message":this.komen,
            
      })
  
      let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
        this.api.post(baseURL + 'qa/comment',data,{headers:headers}).subscribe((data:any)=>{
        console.log(data)
        loader.dismiss();
        let toast = this.toast.create({
          message: 'Comment Created',
          duration: 3000,
          position: 'top'
      });
      toast.present();
  
        this.nav.pop()
      }, err => {
        loader.dismiss();
        let toast = this.toast.create({
          message: 'Failed',
          duration: 3000,
          position: 'top'
      });
      toast.present();
      })
      
    }
  }
}

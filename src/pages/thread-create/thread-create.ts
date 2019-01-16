import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';

import { IThread } from '../../shared/interfaces';
import { AuthService } from  '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../../app/config'
@Component({
  templateUrl: 'thread-create.html'
})
export class ThreadCreatePage implements OnInit {

  createThreadForm: FormGroup;
  title: AbstractControl;
  question: AbstractControl;
  category: AbstractControl;
  content:any;
  caption:any;
  kategori:any;
  constructor(
    public storage:LocalStorageService,
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public authService: AuthService,
    public dataService: DataService, private api: HttpClient, private toast:ToastController) { }

  ngOnInit() {
    console.log('in thread create..');
    this.createThreadForm = this.fb.group({
      'title': ['', Validators.compose([Validators.required])],
      'question': ['', Validators.compose([Validators.required])],
      'category': ['', Validators.compose([Validators.required])]
    });

    this.title = this.createThreadForm.controls['title'];
    this.question = this.createThreadForm.controls['question'];
    this.category = this.createThreadForm.controls['category'];
  }

  cancelNewThread() {
    this.viewCtrl.dismiss();
  }

  onSubmit() {


      let loader = this.loadingCtrl.create({
        content: 'Mengirim...',
        dismissOnPageChange: true
      });

      loader.present();
      let data = JSON.stringify(
        {
          "caption":this.caption,
          "content":this.content,
          "category": this.kategori
    })

    let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
      this.api.post(baseURL + 'qa',data,{headers:headers}).subscribe((data:any)=>{
      console.log(data)
      loader.dismiss();
      let toast = this.toast.create({
        message: 'Thread Created',
        duration: 3000,
        position: 'top'
    });
    toast.present();
      this.nav.pop()
    },  err => {
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,App, ModalController, ToastController, Content, Events, LoadingController, AlertController } from 'ionic-angular';

import { IThread } from '../../shared/interfaces';
import { ThreadCreatePage } from '../thread-create/thread-create';
import { ThreadCommentsPage } from '../thread-comments/thread-comments';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { MappingsService } from '../../shared/services/mappings.service';
import { ItemsService } from '../../shared/services/items.service';
import { SqliteService } from '../../shared/services/sqlite.service';
import { Services } from '../../app/services';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../../app/config'
import { LocalStorageService } from 'ngx-webstorage';
declare var firebase
@Component({
  templateUrl: 'threads.html'
})
export class ThreadsPage  {
  @ViewChild(Content) content: Content;
  segment: string = 'all';
  selectedSegment: string = this.segment;
  queryText: string = '';
  logged:boolean = false;
  public start: number;
 page:any = 1;
 total:any = 1;
  public loading: boolean = true;
  public internetConnected: boolean = true;

  public threads: Array<IThread> = [];
  public newThreads: Array<IThread> = [];
  public favoriteThreadKeys: string[];

  public firebaseConnectionAttempts: number = 0;

  constructor(public navCtrl: NavController,
    public app: App,
    public alertController:AlertController,
    private ld:LoadingController,
    private services: Services,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public authService: AuthService,
    public dataService: DataService,
    public sqliteService: SqliteService,
    public mappingsService: MappingsService,
    public itemsService: ItemsService,
    public events: Events, public api:HttpClient, public storage:LocalStorageService) { }

  ionViewWillEnter() {
    if(this.isLogged()){
      this.checkFirebase();
      this.logged = true
    }else{
      this.events.publish('app:redirect-login', this.app.getRootNav())
    }
  
  }

  checkFirebase() {
        this.loadThreads(true);
  }
  //  ionViewWillEnter(){
  //   if(this.isLogged()){
  //     this.checkFirebase();
  //     this.logged = true
  //   }else{
  //     this.events.publish('app:redirect-login', this.app.getRootNav())
  //   }

  // }

   Delete(comment){
    const alert =  this.alertController.create({
      title: 'Confirm!',
      message: 'Are you sure want to delete this thread?',
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
            let load = this.ld.create({content:'Sedang Menghapus'})
            load.present()
            let headers = new HttpHeaders().set('Accept','application/json').set('Content-Type','application/json').set('Authorization','Bearer ' + this.storage.retrieve('logged').token);
            this.api.delete(baseURL + 'qa/' + comment.id, {headers:headers}).subscribe((data)=>{
              console.log(data);
        
              let toast = this.toastCtrl.create({
                  message: 'Thread deleted',
                  duration: 2000,
                  position: 'top'
              });
              toast.present();
              this.getThreads()
              load.dismiss()
          }) 
      
         
          }
        }
      ]
    });

     alert.present();
    
   
    
 
     
    
 }
  ionViewWillLeave(){
   // this.logged == false
  }
  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }
 
  
  // Notice function declarion to keep the right this reference
  public onThreadAdded = (childSnapshot, prevChildKey) => {
    let priority = childSnapshot.val(); // priority..
  this.events.publish('thread:created');
    // fetch new thread..
    // self.dataService.getThreadsRef().orderByPriority().equalTo(priority).once('value').then(function (dataSnapshot) {
    //   let key = Object.keys(dataSnapshot.val())[0];
    //   let newThread: IThread = self.mappingsService.getThread(dataSnapshot.val()[key], key);
    //   self.newThreads.push(newThread);
    // });
    this.loadThreads(true)
  }

 

  loadThreads(fromStart: boolean) {
   this.loadData();
    
  }

  getThreads() {
   this.api.get(baseURL + 'qa',{params:{
     size:'10'
   }}).subscribe((data:any)=> {
this.threads = data.data
   })

  }

  filterThreads(segment) {
    if (this.selectedSegment !== this.segment) {
      this.selectedSegment = this.segment;
      if (this.selectedSegment === 'favorites')
        this.queryText = '';
      if (this.internetConnected)
        // Initialize
        this.loadThreads(true);
    } else {
      this.scrollToTop();
    }
  }

  searchThreads(val) {
   
    if (val.trim().length !== 0) {
      this.api.get(baseURL + 'qa',{params:{
        search:val
      }}).subscribe((data:any)=> {
   this.threads = data.data
      })
    } else { // text cleared..
      this.loadThreads(true);
    }
  }

  createThread() {

    let modalPage = this.modalCtrl.create(ThreadCreatePage);

    modalPage.onDidDismiss((data: any) => {
      if (data) {
        let toast = this.toastCtrl.create({
          message: 'Thread created',
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
        this.loadThreads(true)
        if (data.priority === 1)
          this.newThreads.push(data.thread);

      
      }
      this.loadThreads(true)
    });

    modalPage.present();
  
  }

  viewComments(id: string) {
    if (this.internetConnected) {
      this.navCtrl.push(ThreadCommentsPage, {
        id: id
      });
    } else {
      this.notify('Network not found..');
    }
  }

  reloadThreads(refresher) {
    this.queryText = '';
    if (this.internetConnected) {
      this.loadThreads(true);
      refresher.complete();
    } else {
      refresher.complete();
    }
  }

  loadData(infiniteScroll?) {
   
   
    this.api.get(baseURL + 'qa',{params:{size:
      '10'}}).subscribe((data:any)=> {
      this.threads = data.data
       
          
        
       
          this.total = data.meta.pagination.total_page;
          if (this.page < this.total) {
            
            this.threads = this.threads.concat(data.data)
          }
           
       
         
      if (infiniteScroll) {
        infiniteScroll.complete();
      }
    })
 
  }
 
  loadMore(infiniteScroll) {
    this.page++;
    this.loadData(infiniteScroll);
    let a = this.threads.length ;
    console.log(a)
 
    if (this.page > this.total) {
      infiniteScroll.enable(false);
    }
  }

  fetchNextThreads(infiniteScroll) {
    if (this.start > 0 && this.internetConnected) {
      this.loadThreads(false);
      infiniteScroll.complete();
    } else {
      infiniteScroll.complete();
    }
  }

  scrollToTop() {
    var self = this;
    setTimeout(function () {
      self.content.scrollToTop();
    }, 1500);
  }

  notify(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}

export const snapshotToArray = snapshot => {
  let returnArr = [];

  snapshot.forEach(childSnapshot => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr.reverse();
}
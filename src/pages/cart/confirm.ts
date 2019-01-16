import { Component } from '@angular/core';
import { Events, NavParams, ActionSheetController, AlertController, NavController, LoadingController } from 'ionic-angular';
import { Services } from '../../app/services';

import { Observable } from 'rxjs/Rx';
import { FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { Camera, CameraOptions } from '@ionic-native/camera';

import moment from 'moment'

const defaultConfirm = {
  bank: 'BCA',
  attn: '',
  amount: 0,
  date: moment().format('YYYY-MM-DD'),
  attachment: {
    id: '',
    meta: {}
  }
}

@Component({
  selector: 'page-confirm',
  templateUrl: 'confirm.html'
})
export class CartConfirmPage {

  defaultPicture: string = 'assets/img/dummy/500x500.jpg'

  transaction: any = {
    total: 0,
    code: ''
  }

  loading: any
  isLoading: boolean = false

  confirm: any = defaultConfirm

  complete: boolean = false

  imageLoadOffset$: any

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private file: File,
    public navParams: NavParams,
    public events: Events,
    private services: Services,
  ) {
    this.imageLoadOffset$ = Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ionViewDidEnter(){
    Object.assign(this.transaction, this.navParams.get('transaction'))
    this.confirm.amount = this.transaction.total
  }

  ionViewDidLeave(){
    this.confirm = Object.assign({}, defaultConfirm)
  }

  verify(): boolean{
    let status = true

    if(
      !this.confirm.bank ||
      !this.confirm.attn.length ||
      this.confirm.amount <= 0 ||
      !this.confirm.date
    ){
      status = false
    }
    return status
  }

  submit(){
    if( ! this.verify() ){
      let alert = this.alertCtrl.create({
        title: 'Peringatan!',
        subTitle: 'Mohon melengkapi semua form input konfirmasi',
        buttons: ['OK']
      })

      alert.present()
    }else{
      const loading = this.presentLoading()
      const {transaction, confirm} = this
      this.services.confirmTransaction({transaction, confirm}).then(respones => {
        this.complete = true
      }).catch(error => {
        this.events.publish('app:errpr', error)
      }).then(() => loading.dismiss() )
    }
  }

  presentLoading(){
    // this.isLoading = true
    // this.loading = this.loadingCtrl.create({
    //   content: 'Mohon Tunggu...'
    // })

    // this.loading.present()
    // this.loading.onDidDismiss(() => this.isLoading = false)

    return this.loading
  }

  openMedia(type) {

    let camOptions: CameraOptions = {
      quality: 50,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: false
    }

    this.events.publish('app:loading:show')
    if(type === 'image'){
      this.cameraIsCaptureImage(camOptions)
    }else{
      camOptions.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY
      this.cameraIsCaptureImage(camOptions)
    }
  }

  uploadImage(fileEntry){
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: fileEntry.name,
      mimeType: "image/jpeg",
      chunkedMode: false,
      headers: {
        Connection: "close"
      }
    }

    return this.services.uploadFile(fileEntry.toURL(), options)
  }

  cameraIsCaptureImage(options: CameraOptions){
    this.camera.getPicture(options).then(image => {

     
        this.file.resolveLocalFilesystemUrl(image).then(fileEntry => {
          this.uploadImage(fileEntry).then(file => {
            console.log(file, 'success')
            this.confirm.attachment = Object.assign({}, file)
            this.events.publish('app:loading:close')
          }).catch(error => {
            console.log('upload error', JSON.stringify(error))
          })
        })
      
      .catch(e => console.log(e));
    }, (err) => {
      console.log(JSON.stringify(err))
      this.events.publish('app:loading:close')
    });
  }

  addImage(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Lampiran  Dari',
      buttons: [
        {
          text: 'Library',
          handler: () => {
            this.openMedia('library')
          }
        },
        {
          text: 'Foto',
          handler: () => {
            this.openMedia('image')
          }
        },
        {
          text: 'Batal',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
}

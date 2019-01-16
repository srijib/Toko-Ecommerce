import { Component } from '@angular/core';
import { NavParams, Events, ActionSheetController, NavController } from 'ionic-angular';

import { FileUploadOptions } from '@ionic-native/file-transfer';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { File } from '@ionic-native/file';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { Services } from '../../app/services';

import moment from 'moment'

const defaultAdvert = {
  id: '',
  caption: '',
  description: '',
  start: '',
  end: '',
  approved: true,
  active: true,
  image: {
    id: '',
    meta: {}
  }
}

@Component({
  selector: 'page-advert-form',
  templateUrl: 'form.html'
})
export class AdvertFormPage {

  defaultPicture: string = 'assets/img/dummy/500x500.jpg'

  advert: any = Object.assign({}, defaultAdvert)

  constructor(
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public navParams: NavParams,
    public events: Events,
    private camera: Camera,
    private file: File,
    private imageResizer: ImageResizer,
    private services: Services,
  ) {

  }

  ionViewDidEnter(){
    let advert = this.navParams.get('advert')

    console.log(JSON.stringify(advert), JSON.stringify(this.advert))

    if(!advert.image){
      advert.image = Object.assign({}, {
        id: '',
        meta: {}
      })
    }

    if(advert.start){
      advert.start = moment(advert.start, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    if(advert.end){
      advert.end = moment(advert.end, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    this.advert = Object.assign({}, this.advert, advert)
  }

  isEdit():boolean{
    return this.advert.id !== ''
  }

  submit(){
    const {id} = this.advert
    this.events.publish('app:loading:show')
    if(this.isEdit()){
      this.services.updateAdvert(id, this.advert).then(response => this.afterSubmit(response)).catch(error => {
        this.events.publish('app:error', error)
      }).then(() => this.events.publish('app:loading:close'))
    }else{
      this.services.postAdvert(this.advert).then(response => this.afterSubmit(response)).catch(error => {
        this.events.publish('app:error', error)
      }).then(() => this.events.publish('app:loading:close'))
    }
  }

  afterSubmit(response){
    console.log(response)
    this.navCtrl.pop()
    this.reset()
    this.events.publish('advert:refetch')
  }

  reset(){
    this.advert = Object.assign({}, defaultAdvert)
  }

  openMedia(type) {

    let camOptions: CameraOptions = {
      quality: 80,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      targetWidth: 1280,
      targetHeight: 1280,
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
            this.advert.image = Object.assign({}, file)
            this.events.publish('app:loading:close')
          }).catch(error => {
            console.log('upload error', JSON.stringify(error))
          })
        })
      
      .catch(e => console.log(e));
    }, (err) => {
      console.log(err)
      this.events.publish('app:loading:close')
    });
  }

  addImage(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Tambah Gambar Dari',
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

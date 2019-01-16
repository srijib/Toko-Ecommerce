import { Component } from '@angular/core';
import { NavParams, Events, ActionSheetController, NavController } from 'ionic-angular';

import { FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { Services } from '../../app/services';
import { Observable } from 'rxjs/Rx';

import {get} from 'lodash'

const defaultAttachment = {
  id: '',
  meta: {}
}

const defaultShipment = {
  id: '',
  courier: '',
  proof: '',
  notes: '',
  attachment: defaultAttachment
}

@Component({
  selector: 'page-shipment',
  templateUrl: 'shipment.html'
})
export class TrxShipmentPage {

  defaultPicture: string = 'assets/img/dummy/500x500.jpg'

  shipment: any = Object.assign({}, defaultShipment)
  invoice: any = {}

  constructor(
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public navParams: NavParams,
    public events: Events,
    private camera: Camera,
    private file: File,
    private services: Services,
  ) {
    let invoice = this.navParams.get('invoice')
    this.invoice = Object.assign({}, this.invoice, invoice)

    let {shipment} = invoice

    let courier = get(shipment, 'send.courier')
    let proof = get(shipment, 'send.proof')
    let notes = get(shipment, 'send.notes')
    let cour_address=get(shipment, 'send.cour_address')
    let attachment = Object.assign({}, defaultAttachment, get(shipment, 'proof'))
    

    this.shipment = Object.assign({}, defaultShipment, {courier, proof, notes, attachment, cour_address})

  }

  imageLoadOffset$(){
    return Observable.merge(
      Observable.of(300),                 // initial offset
      Observable.of(100000).delay(1000)   // offset triggering loading after 1 seconds
    );
  }

  ionViewDidEnter(){
    
  }

  submit(){
    const {id} = this.invoice
    this.events.publish('app:loading:show')
    this.services.postTrxInvoiceShipment(id, this.shipment).then(response => this.afterSubmit(response)).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

  afterSubmit(response){
    console.log(response)
    this.navCtrl.pop()
    this.reset()
    this.events.publish('shipment:refetch')
  }

  reset(){
    this.shipment = Object.assign({}, defaultShipment)
  }

  openMedia(type) {

    let camOptions: CameraOptions = {
      quality: 80,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      targetWidth: 1080,
      targetHeight: 1080,
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
          this.shipment.attachment = Object.assign({}, file)
          this.events.publish('app:loading:close')
        })
      })
    }, (err) => {
      console.log(err)
      this.events.publish('app:loading:close')
    });
  }

  addImage(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Lampirkan Gambar Dari',
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

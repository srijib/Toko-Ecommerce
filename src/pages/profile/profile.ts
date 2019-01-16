import { Component } from '@angular/core';
import { Events, NavController, AlertController, ActionSheetController, NavParams } from 'ionic-angular';

import { FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { LocalStorageService } from 'ngx-webstorage';
import moment from 'moment'

import {get, find, isEmpty} from 'lodash'

import {Services} from '../../app/services'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  defaultPropict = './assets/img/dummy/avatar.jpg'
  user:any = {
    profile: {},
    address: {}
  }
  foto:any = './assets/img/dummy/avatar.jpg'
  password: any = {
    old: '',
    new: '',
    confirm: '',
  }

  dob: any

  provinces: any = []
  cities: any = []

  loading: any

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private storage: LocalStorageService,
    private camera: Camera,
    private file: File,
    private services: Services,
    private events: Events
  ) {

  }

  ionViewDidEnter() {
    const logged = this.storage.retrieve('logged')
    const {user} = logged
    let {profile, address} = user

    profile = Object.assign({}, profile)
    address = Object.assign({}, address)
    this.user = Object.assign({}, user, {profile, address})
    if(this.storage.retrieve('logged').user.propict != null || this.storage.retrieve('logged').user.propict != undefined || this.storage.retrieve('logged').user.propict != ''){
      this.foto = this.storage.retrieve('logged').user.propict
    }
    this.prepareDOB()

    if(isEmpty(this.provinces)){
      this.prepareProvince()
    }
  }

  prepareDOB(){
    const dob = moment(this.user.profile.dob, 'DD/MM/YYYY')
    this.dob = dob.format('YYYY-MM-DD')
  }

  dobChange(dob){
    this.user.profile.dob = moment(dob).format('DD/MM/YYYY')
  }

  submit(){
    this.events.publish('app:loading:show')
    let data = this.user
    data.password = this.password
     let value = this.storage.retrieve('logged');

     // Modify just that property
     value.user = data;

     // Save the entire data again
     this.storage.store('logged', value);
    return this.services.updateProfile(data).then(response => {
      this.afterUpdate(response)

      this.password = {
        old: '',
        new: '',
        confirm: '',
      }
    })
    .catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))

  }

  compareSelect(current, selected): boolean {
    return current == selected
  }

  provinceChange(){
    const self = this
    let cities = get(find(this.provinces, (province: any) => {
      return province.province_id == self.user.address.province_id
    }), 'city', [])

    this.cities = Object.assign([], this.cities, cities)
  }

  prepareProvince(){
    this.services.fetchCartLocation().then(location => {
      this.provinces = Object.assign([], this.provinces, location)
      this.provinceChange()
    }).catch(error => this.events.publish('app:error', error))
  }

  openMedia(type) {

    let camOptions: CameraOptions = {
      quality: 40,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      targetWidth:600,
      targetHeight: 600,
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
      this.foto = image
      this.file.resolveLocalFilesystemUrl(image).then(fileEntry => {
        this.uploadImage(fileEntry).then(file => {
          this.submitPropict(file)
        })
      })
    }, (err) => {
      console.log(err)
      this.events.publish('app:loading:close')
    });
  }

  submitPropict(file){
    this.services.updatePropict(file).then(response => 
      
      this.afterUpdate(response)
      ).catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  changePropict(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Ubah Foto Dari',
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

  afterUpdate(response){
    let confirm = this.alertCtrl.create({
      title: 'Berhasil',
      message: 'Profil Anda Telah Disimpan!',
      buttons: ['OK']
    })
   
    const {data} = response

    confirm.present()
  
    this.storage.store('logged',response);
      this.prepareDOB()

     
      if(this.navCtrl.canGoBack()){
        this.navCtrl.pop()
      }
  
  }

}

import { Component } from '@angular/core';
import { Events, NavParams, NavController, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { Services } from '../../app/services';

import { FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { Observable } from 'rxjs/Rx';
import { isEmpty } from 'lodash';
import { ProductDetailPage } from './detail'

import moment from 'moment';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpModule } from '@angular/http';

const defaultProduct = {
  id: '',
  title: '',
  meta: {},
  images: [],
  user: {
    profile: {
      social: []
    }
  },
  product: {
    weight: 0,
    price: 0,
    sub: '',
    sub2: ''
  },
  category: {},
  htmlStr:' '
  

}

const reset = obj => Object.assign({}, JSON.parse(JSON.stringify(obj)))

@Component({
  selector: 'page-product-form',
  templateUrl: 'form.html'
})
export class ProductFormPage {
htmlStr: string = 'AA';
apicategory:any;
apicategorystuff:any;
apicategorysub:any;
  user:any = {
    propict: {}
  }

  defaultPropict: string = './assets/img/dummy/avatar.jpg'
  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  isLoading: boolean = false

  product: any = reset(defaultProduct)

  dob: any

  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private file: File,
    private services: Services,
    public http: Http
  ) {
    this.user = Object.assign({}, this.user, this.services.user)
    this.http.get('https://elzumie.com//api/product/apicategory').map(res => res.json()).subscribe( data => {
        this.apicategory = data;
        
    },
    err => {
        console.log("Oops!");
    });
    this.http.get('https://elzumie.com//api/product/apicategorystuff').map(res => res.json()).subscribe( data => {
        this.apicategorystuff = data;
        
    },
    err => {
        console.log("Oops!");
    });
   
    
  }

  ionViewDidEnter(){
    this.product = reset(defaultProduct)
    this.product = Object.assign({}, this.product, this.navParams.get('product'))
    if(this.product.meta.dob){
      this.dob = moment(this.product.meta.dob, 'DD-MM-YYYY').format('YYYY-MM-DD')
    }else{
      this.dob = moment().format('YYYY-MM-DD')
    }
    
    
  }

  isProductEmpty():boolean {
    return !this.isLoading && isEmpty(this.product.id)
  }

  imageLoadOffset$(): any {
    return Observable.merge(
      Observable.of(300),
      Observable.of(100000).delay(1000)
    );
  }

  action():string {
    return this.isEdit() ? 'Edit' : 'Add'
  }

  isEdit():boolean{
    return this.product.id !== ''
  }

  submit(){
    this.events.publish('app:loading:show')
    this.product.meta.dob = moment(this.dob).format('YYYY-MM-DD')
    if(this.isEdit()){
      this.services.updateProduct(this.product).then(response => this.afterSubmit(response)).catch(error => {
        this.events.publish('app:error', error)
      }).then(() => this.events.publish('app:loading:close'))
    }else{
      this.services.postProduct(this.product).then(response => this.afterSubmit(response)).catch(error => {
        this.events.publish('app:error', error)
      }).then(() => this.events.publish('app:loading:close'))
    }
  }

  afterSubmit(response){
    let confirm = this.alertCtrl.create({
      title: 'Produk',
      message: 'Data Produk Telah Disimpan!',
      buttons: ['OK']
    })

    const {data} = response

    confirm.present()
    confirm.onDidDismiss(() => {
      this.product = reset(defaultProduct)
      this.dob = null
      this.events.publish('product:refetch')
      if(this.navCtrl.canGoBack()){
        this.navCtrl.pop()
      }
      this.navCtrl.push(ProductDetailPage, {id: data.id})
    })
  }

  openMedia(type) {

    let camOptions: CameraOptions = {
      quality: 80,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
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
            this.product.images.push(file)
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

  askRemoveImage(index){
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda yakin akan menghapus gambar ini?',
      buttons: [
        {
          text: 'Batal'
        },
        {
          text: 'Ya, Hapus!',
          role: 'destructive',
          handler: () => this.removeImage(index)
        }
      ]
    })

    confirm.present()
  }

  removeImage(index){
    const image = this.product.images[index]
    this.events.publish('app:loading:show')
    this.services.deleteFile(image.id).then(response => {
      this.product.images.splice(index, 1)
    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close'))
  }

    showkate() { 
    
        if (this.product.sub == "") {
             this.htmlStr = '<strong>BB</strong>';
            return;
        } else {
            var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById("txtHint").innerHTML = xmlhttp.responseText;
                //console.log(this.htmlStr);
            }
        };
        xmlhttp.open("GET","https://elzumie.com//panel/product/getkate/"+this.product.sub,true);
        xmlhttp.send();
        console.log(this.product.sub2);
    }
}
sub()
{
   this.http.get('https://elzumie.com//api/product/apicategorysub/'+this.product.sub).map(res => res.json()).subscribe( data => {
        this.apicategorysub = data;
        
    },
    err => {
        console.log("Oops!");
    });
}


}

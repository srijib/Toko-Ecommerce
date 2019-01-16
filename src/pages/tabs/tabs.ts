import { Component, ViewChild } from '@angular/core';
import {
  Tab,
  Tabs,
  NavParams, Events,
  AlertController,
  LoadingController,
  NavController,
  Platform,
  ActionSheetController,
  MenuController
} from 'ionic-angular';


import { CartPage, ProductPage, HomePage, StoryFormPage, ProfilePage} from '../index'

import { FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { LocalStorageService } from 'ngx-webstorage';

import { Services } from '../../app/services';
import { Cart } from '../../app/cart';

import { VideoEditor } from '@ionic-native/video-editor';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from '@ionic-native/media-capture';
import { Camera, CameraOptions } from '@ionic-native/camera';

import {get, findIndex} from 'lodash';
import { ProductFormPage } from '../index'
import * as moment from 'moment';
import { ThreadsPage } from '../threads/threads';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs') tabs: Tabs
  @ViewChild('home') home: Tab
  loading:any
  paramsHome:any
  paramsProduct:any

  countCart: number = 0

  tabHome:any = HomePage;
  tabCart:any = CartPage;
  tabProduct:any = ThreadsPage;

  tabIndex = 0;

  tabList = ['home', 'product', 'add', 'cart', 'more']

  constructor(
    public platform: Platform,
    public navParams: NavParams,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public events: Events,
    private videoEditor: VideoEditor,
    private mediaCapture: MediaCapture,
    private storage: LocalStorageService,
    private camera: Camera,
    private file: File,
    private services: Services,
    private cart: Cart
    ) {

    this.paramsHome = navParams.get('paramsHome')
    this.paramsProduct = navParams.get('paramsProduct')

    const page = navParams.get('page')

    if(page){
      this.tabIndex = findIndex(this.tabList, o => o === page)
    }
    this.storage.observe('cart').subscribe(value => this.countCart = value.length)

    this.countCart = get(this.cart.parse(), 'qty', 0)
  }

  ionViewDidLoad(){
    this.events.subscribe('tabs:push-page', ({page, params}) => {
      this.navCtrl.push(page)
    })

    this.events.subscribe('tabs:home-push-page', ({page, params}) => {
      this.tabs.select(0)
      if(page){
        this.home.push(page, params)
      }
    })

    this.events.subscribe('tabs:set-count-cart', count => this.countCart = count)
  }

  ionViewWillUnload(){
    this.events.unsubscribe('tabs:push-page')
    this.events.unsubscribe('tabs:home-push-page')
    this.events.unsubscribe('tabs:set-count-cart')
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  presentLoading(){
    // this.loading = this.loadingCtrl.create({
    //   content: '<center>Sedang mengupload<br>Mohon Tunggu...</center>'
    // })

    // this.loading.present()

    return this.loading
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
    let vidOptions: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.VIDEO
    }

    // this.presentLoading()
    if(type === 'image'){
      this.cameraIsCaptureImage(camOptions)
    }else if(type === 'video'){
      let options: CaptureVideoOptions = { duration: 10 };

      this.mediaCapture.captureVideo(options)
      .then((data: MediaFile[]) => {
        const file = data[0]
        console.log("full"+file.fullPath)
        console.log("file"+file)
        this.compressVideo(file.fullPath)
      }, (err: CaptureError) => console.error(err))
    }else if(type === 'image_library'){
      camOptions.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY
      this.cameraIsCaptureImage(camOptions)
    }else if(type === 'video_library'){
      console.log("akan masuk camera is..")
      this.cameraIsCaptureVideo(vidOptions)
      console.log("masuk openmedia")
    }
  }

  async compressVideo(path){
  let loading = this.loadingCtrl.create({
    content:'Uploading'
  })
  loading.present();
    const fileName = 'story-' + moment().format('YYYY-MM-DD-HH-mm-ss');

    /*const info = await this.videoEditor.getVideoInfo({fileUri: path})
    const {width, height} = info

    const aspectRatio = width / height;
    const outputWidth = 320 * aspectRatio;
    const outputHeight = outputWidth / aspectRatio;*/
    console.log("masuk compress")
    this.videoEditor.transcodeVideo({
      fileUri: path,
      outputFileName: fileName,
      outputFileType: this.videoEditor.OutputFileType.MPEG4,
      saveToLibrary: false,
      optimizeForNetworkUse: this.videoEditor.OptimizeForNetworkUse.YES,
      maintainAspectRatio: true,
      width: 320,
      height: 640,
      videoBitrate: 1000000, // 1 megabit
      audioChannels: 2,
      audioSampleRate: 44100,
      audioBitrate: 128000, // 128 kilobits
    })
    .then((fileUri: string) => {
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName+'.mp4',
        mimeType: 'video/mp4',
        chunkedMode: false,
        headers: {
          Connection: "close"
        }
      }
   
      this.services.uploadFile(fileUri, options)
      .then(file => {
        this.tabs.select(0)
        const story = {type: 'video'}
        this.home.push(StoryFormPage, {file, story})
        console.log("masuk upload")
        loading.dismiss();
      }).catch(error => {
        console.log(error)
        alert('gagal upload')
        loading.dismiss();
      }).then( () => loading.dismiss() )
    })
    .catch((error: any) => {loading.dismiss(); alert('Gagal Upload');console.log(error)});
  }

  cameraIsCaptureImage(options: CameraOptions){
    console.log("masuk deh")
    this.camera.getPicture(options).then(image => {
      console.log("masuk getpic")
      this.file.resolveLocalFilesystemUrl(image).then(fileEntry => {
        console.log("masuk resolve")
        this.uploadImage(fileEntry).then(file => {
          this.tabs.select(0)
          const story = {type: 'image'}
          this.home.push(StoryFormPage, {file, story})
          this.loading.dismiss()
        })
      })
    }, (err) => {
      console.log(err)
      this.loading.dismiss()
    });
  }

  cameraIsCaptureVideo(options: CameraOptions){
    console.log("masuk deh")
    this.camera.getPicture(options).then(video => {
      console.log("masuk getpic"+video)
      this.compressVideo("file://"+video), (err: CaptureError) =>console.log(err)
    }, (err) => {
      // console.log('gagal '+err)
      // this.loading.dismiss()
    });
  }

  uploadVideo(fileEntry){
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: fileEntry.name+'.mp4',
      mimeType: 'video/mp4',
      headers: {
        Connection: "close"
      }
    }

    return this.services.uploadFile(fileEntry.toURL(), options)
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

  parentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Buat Story atau Tambah Produk',
      buttons: [
      {
        text: 'Buat Story',
        handler: () => {
          if(this.isLogged()){
            this.storyActionSheet()
          }else{
            this.events.publish('app:redirect-login', this.navCtrl)
          }
        }
      },
      {
        text: 'Tambah Produk',
        handler: () => {
          let storagelogged = this.storage.retrieve('logged')
          console.log(storagelogged.user.address)
          if(storagelogged.user.address==undefined||storagelogged.user.address==null||storagelogged.user.address=='')
          {
            alert("Mohon lengkapi profile anda sebelum menjual produk")

            this.navCtrl.push(ProfilePage)
          }
          else{
            if(this.isLogged()){
              this.productActionSheet()
            }else{
              this.events.publish('app:redirect-login', this.navCtrl)
            }
          }
        }
      },
      {
        text: 'Batal',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
      ]
    });
    actionSheet.present();
  }

  productActionSheet() {
    const page = ProductFormPage
    const user = this.services.user
    let product = {
      id: '',
      title: '',
      content: '',
      meta: {
        sex: 'Jantan',
        color: '',
        dob: '',
      },
      category: {},
      user,
    }

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Tambah Produk',
      buttons: [
      {
        text: 'Hewan',
        handler: () => {
          product.category = {
            slug: 'myfriends',
            title: 'My Friends'
          }
          const params = {product}
          this.tabs.select(0)
          this.home.push(page, params)
        }
      },
      {
        text: 'Peralatan',
        handler: () => {
          product.category = {
            slug: 'stuff',
            title: 'Stuff'
          }
          const params = {product}
          this.tabs.select(0)
          this.home.push(page, params)
        }
      },
      {
        text: 'Kehilangan',
        handler: () => {
          product.category = {
            slug: 'losing',
            title: 'Losing'
          }
          const params = {product}
          this.tabs.select(0)
          this.home.push(page, params)
        }
      },
      {
        text: 'Adopsi Gratis',
        handler: () => {
          product.category = {
            slug: 'free-adopt',
            title: 'Free Adopt'
          }
          const params = {product}
          this.tabs.select(0)
          this.home.push(page, params)
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

  storyActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Buat Story dari',
      buttons: [
      {
        text: 'Library',
        handler: () => {
            //this.openMedia('library')
            this.storyLibraryActionSheet()
            console.log('Library');
          }
        },
        {
          text: 'Foto',
          handler: () => {
            this.openMedia('image')
            console.log('Foto Open Camera')
          }
        },
        {
          text: 'Video',
          handler: () => {
            this.openMedia('video')
            console.log('Video')
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
  storyLibraryActionSheet() {
    let actionLibrarySheet = this.actionSheetCtrl.create({
      title: 'Ambil video atau gambar dari library',
      buttons: [
      {
        text: 'Video',
        handler: () => {
          this.openMedia('video_library')
          console.log('Library Video')
        }
      },
      {
        text: 'Image',
        handler: () => {
          this.openMedia('image_library')
          console.log('Library Image');
        }
      },
      {
        text: 'Batal',
        role: 'cancel'
      }
      ]
    });
    actionLibrarySheet.present();
  }
}

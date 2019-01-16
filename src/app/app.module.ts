import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { IonicStorageModule } from '@ionic/storage';

import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { OneSignal } from '@ionic-native/onesignal';
import { MediaCapture } from '@ionic-native/media-capture';
import { Camera } from '@ionic-native/camera';
import { VideoEditor } from '@ionic-native/video-editor';
// import { StreamingMedia } from '@ionic-native/streaming-media';
import { ImageResizer } from '@ionic-native/image-resizer';
import { HttpModule } from '@angular/http';
import { ReplyPageModule } from '../pages/reply/reply.module';
import {CartPage, CartThanksPage, CartConfirmPage} from '../pages';
import {ProfilePage} from '../pages';
import {
  ProductPage,
  ProductStorePage,
  ProductFormPage,
  ProductDetailPage,
  ProductSearchPage,
  DiscussionFormPage
} from '../pages';

import { AdvertFormPage, AdvertPage } from '../pages';
import { WalletPage, WalletFormPage, WalletWithdrawPage } from '../pages';
import { StoryFormPage, StoryCommentPage, StoryReportPage } from '../pages';
import { MessagePage, MessageFormPage, MessageDetailPage } from '../pages';
import { ComplaintPage, ComplaintFormPage } from '../pages';

import {
  TrxPurchasePage,
  TrxSalesPage,
  TrxInvoicePage,
  TrxShipmentPage,
  TrxRatingPage,
} from '../pages';

import {ReviewPage} from '../pages'
import {NotificationPage, DiscussionPage} from '../pages';


import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { BlankPage } from '../pages/blank/blank';
import { RegisterPage } from '../pages/register/register';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Services } from './services';
import { Cart } from './cart';

import { Ng2Webstorage } from 'ngx-webstorage';
import { MomentModule } from 'angular2-moment';
import { ElasticModule } from 'angular2-elastic';
import { PipesModule } from '../pipes/pipes.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CallNumber } from '@ionic-native/call-number';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { Ionic2RatingModule } from 'ionic2-rating';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask/src/currency-mask.config";
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Clipboard } from '@ionic-native/clipboard';
import { Facebook } from '@ionic-native/facebook';


export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    // allowZero: true,
    decimal: ".",
    precision: 0,
    prefix: "",
    suffix: "",
    thousands: ","
};

import { StoryMorePopover } from '../pages';

import * as moment from 'moment';
import 'moment/locale/id';

moment.locale('id-id');
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Uid } from '@ionic-native/uid';
import { SocialSharing } from '@ionic-native/social-sharing';

// Pages

import { CommentCreatePage } from '../pages/comment-create/comment-create';
import { ThreadCommentsPage } from '../pages/thread-comments/thread-comments';
import { ThreadCreatePage } from '../pages/thread-create/thread-create';
import { ThreadsPage } from '../pages/threads/threads';
// Custom components
import { ThreadComponent } from '../shared/components/thread.component';
import { AccordionComponent } from '../shared/components/accordion';

import { UserAvatarComponent } from '../shared/components/user-avatar.component';
// providers
import { APP_PROVIDERS } from '../providers/app.providers';
import { HttpClientModule, HttpClient , HTTP_INTERCEPTORS,HttpErrorResponse} from '@angular/common/http';
import { AdMobPro } from '@ionic-native/admob-pro';
import { credentials } from './firebase.credential';
@NgModule({
  declarations: [
  MyApp,
  ProfilePage,
  CartPage,
  CartThanksPage,
  CartConfirmPage,
  AdvertFormPage,
  AdvertPage,
  WalletPage,
  WalletFormPage,
  WalletWithdrawPage,
  NotificationPage,
  DiscussionPage,
  ProductPage,
  
  ProductStorePage,
  ProductDetailPage,
  ProductFormPage,
  ProductSearchPage,
  DiscussionFormPage,
  TrxPurchasePage,
  TrxSalesPage,
  TrxInvoicePage,
  TrxShipmentPage,
  TrxRatingPage,
  HomePage,
  TabsPage,
  LoginPage,
  BlankPage,
  StoryFormPage,
  StoryCommentPage,
  StoryReportPage,
  StoryMorePopover,
  MessagePage,
  MessageFormPage,
  MessageDetailPage,
  ComplaintPage,
  ComplaintFormPage,
  RegisterPage,
  ReviewPage,

  CommentCreatePage,

  TabsPage,
  ThreadCommentsPage,
  ThreadCreatePage,
  ThreadsPage,
  ThreadComponent,
  UserAvatarComponent,
  AccordionComponent

  ],
  imports: [
    ReplyPageModule,
  BrowserModule,
  Ng2Webstorage,
  MomentModule,
  HttpClientModule,
  LazyLoadImageModule,
  IonicImageViewerModule,
  ElasticModule,
  PipesModule,
  CurrencyMaskModule,
  Ionic2RatingModule,
  IonicModule.forRoot(MyApp, {
      mode: 'ios',
      statusbarPadding: false
  }),
  IonicStorageModule.forRoot(),
  HttpModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
  MyApp,
  ProfilePage,
  CartPage,
  CartThanksPage,
  CartConfirmPage,
  AdvertFormPage,
  AdvertPage,
  WalletPage,
  WalletFormPage,
  WalletWithdrawPage,
  NotificationPage,
  DiscussionPage,
  ProductPage,
  ProductStorePage,
  ProductDetailPage,
  ProductFormPage,
  ProductSearchPage,
  DiscussionFormPage,
  TrxPurchasePage,
  TrxSalesPage,
  TrxInvoicePage,
  TrxShipmentPage,
  TrxRatingPage,
  HomePage,
  TabsPage,
  LoginPage,
  BlankPage,
  StoryFormPage,
  StoryCommentPage,
  StoryReportPage,
  StoryMorePopover,
  MessagePage,
  MessageFormPage,
  MessageDetailPage,
  ComplaintPage,
  ComplaintFormPage,
  RegisterPage,
  ReviewPage,
  CommentCreatePage,
  ThreadCommentsPage,
  ThreadCreatePage,
  ThreadsPage,
  ThreadComponent,
  UserAvatarComponent,
  AccordionComponent
  
  ],
  providers: [
    AdMobPro,
  StatusBar,
  SplashScreen,
  MediaCapture,
  Cart,
  Services,
  VideoEditor,
  ImageResizer,
  // StreamingMedia,
  File,
  FileTransfer,
  CallNumber,
  Clipboard,
  InAppBrowser,
  Facebook,
  Camera,
  Network,
  SQLite,
  PhotoViewer,
  Camera,
  GoogleAnalytics,
  InAppBrowser,
  SocialSharing,
  Uid,
  APP_PROVIDERS,
  {provide: ErrorHandler, useClass: IonicErrorHandler},
  {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig},
  OneSignal
  ]
})
export class AppModule {}

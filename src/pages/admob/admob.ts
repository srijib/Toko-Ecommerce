import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AdMobPro } from '@ionic-native/admob-pro';
import { Platform } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
/**
 * Generated class for the AdmobPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-admob',
  templateUrl: 'admob.html',
})
export class AdmobPage {

  constructor( private admob: AdMobPro, private platform: Platform,public navCtrl: NavController, public navParams: NavParams) {
    platform.ready().then(() => {
      let adId;
      if(this.platform.is('android')) {
        adId = 'ca-app-pub-3859491866846476/5889648989';
      } else if (this.platform.is('ios')) {
        adId = 'ca-app-pub-3859491866846476/5595680109';
      }
      this.admob.prepareInterstitial({
          adId: adId,
          isTesting: false,
          autoShow: true,
          // position: this.admob.AD_POSITION.BOTTOM_CENTER
      })
      this.showInterstitialAd()
     
  });
  }

  ionViewDidLoad() {
   
  }

  showInterstitialAd() {
    if (AdMobPro) {
      this.admob.setOptions({adSize:"FULL_BANNER",overlap:true})
        this.admob.showInterstitial()
        this.admob.onAdDismiss().subscribe(data => {
          this.navCtrl.setRoot(TabsPage)
        })
    } else {
      this.navCtrl.setRoot(TabsPage)
    }
}

}

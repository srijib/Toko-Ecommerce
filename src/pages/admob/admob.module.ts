import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdmobPage } from './admob';

@NgModule({
  declarations: [
    AdmobPage,
  ],
  imports: [
    IonicPageModule.forChild(AdmobPage),
  ],
})
export class AdmobPageModule {}

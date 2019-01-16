import { Component } from '@angular/core';
import { Events, ViewController, NavParams } from 'ionic-angular';

@Component({
  template: `
    <ion-list no-lines no-margin>
      <button *ngIf="action.edit" ion-item menuClose detail-none (click)="close('edit')">
        <ion-icon name="ios-create-outline" item-start></ion-icon>
        Edit
      </button>
      <button *ngIf="action.delete || isAdmin" ion-item menuClose detail-none (click)="close('delete')">
        <ion-icon name="ios-trash-outline" item-start></ion-icon>
        Hapus
      </button>
      <button *ngIf="action.report" ion-item menuClose detail-none (click)="close('report')">
        <ion-icon name="ios-megaphone-outline" item-start></ion-icon>
        Lapor
      </button>
    </ion-list>
  `
})

export class StoryMorePopover {

  action:any = {
    edit: true,
    delete: true,
    report: true
  }

  isAdmin: boolean = false

  constructor(
    public viewCtrl: ViewController,
    public events: Events,
    public navParams: NavParams,
  ) {

    this.action = Object.assign({}, this.action, navParams.get('action'))
    this.isAdmin = navParams.get('isAdmin') === true
  }

  close(action) {
    this.events.publish('home:story-popover', action);
    this.viewCtrl.dismiss();
  }
}

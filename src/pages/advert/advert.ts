import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';


import { Services } from '../../app/services';
import { AdvertFormPage } from './form'

@Component({
  selector: 'page-advert',
  templateUrl: 'advert.html'
})
export class AdvertPage {

  defaultPicture: string = 'assets/img/dummy/500x500.jpg'

  advert:any = {
    data: [],
    meta: {}
  }

  filter: string = 'semua'
  listFilter: any = [
    {label: 'Semua', value: 'semua'},
    {label: 'Aktif', value: 'aktif'},
    {label: 'Tidak Aktif', value: 'tidak-aktif'},
    {label: 'Diajukan', value: 'diajukan'},
  ]

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public services: Services,

  ) {

  }

  ionViewDidEnter(){
    this.events.subscribe('advert:refetch', () => this.fetch())
    this.fetch()
  }

  ionViewDidLeave(){
    this.events.unsubscribe('advert:refetch')
  }

  fetch(){
    const {filter} = this
    this.events.publish('app:loading:show')
    this.services.fetchAdvert({filter}).then(response => {
      const {data, meta} = response
      this.advert = Object.assign({}, this.advert, {data, meta})
    }).catch(error => this.events.publish('app:error', error))
    .then(() => this.events.publish('app:loading:close'))
  }

  create(){
    this.navCtrl.push(AdvertFormPage)
  }

  edit(index){
    const advert = this.advert.data[index]
    this.navCtrl.push(AdvertFormPage, {advert})
  }

  canEdit(index): boolean{
    const advert = this.advert.data[index]
    return advert.valid && advert.approved
  }

  changeFilter(){
    this.fetch()
  }

  compareFilter(current, selected): boolean {
    return current === selected
  }

}

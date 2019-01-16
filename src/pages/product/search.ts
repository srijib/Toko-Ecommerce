import { Component } from '@angular/core';
import { Events, NavParams, NavController, LoadingController } from 'ionic-angular';

import {Services} from '../../app/services';

import {isEmpty, get} from 'lodash';

import {ProductDetailPage} from './detail'

@Component({
  selector: 'page-product-search',
  templateUrl: 'search.html'
})
export class ProductSearchPage {
  searchText: string

  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  categoryKey:string = "myfriends"
  categoryIndex:number = 0

  categories:any = {
    keys: [
      'myfriends',
      'stuff',
      'free-adopt',
      'losing',
    ],
    labels: [
      'MyFriends',
      'Stuff',
      'Free Adopt',
      'Losing',
    ]
  }

  loading: any
  isLoading:boolean = false

  product: any = {
    data: [],
    pagination: {

    }
  }

  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private services: Services
  ) {

    this.searchText = navParams.get('searchText')
  }

  ngAfterViewInit(){
    this.fetchProduct()
  }

  goToDetail(id){
    this.navCtrl.push(ProductDetailPage, {id})
  }

  presentLoading(){
    this.isLoading = true
    this.loading = this.loadingCtrl.create({
      content: 'Mohon Tunggu...'
    })

    this.loading.present()
    this.loading.onDidDismiss(() => this.isLoading = false)

    return this.loading
  }

  fetchProduct(type='new'){

    let page = 1, last_time = 0
    const {pagination} = this.product
    if(!isEmpty(pagination) && type !== 'new'){
      const {current_page, total_pages} = pagination

      if(current_page !== total_pages){
        page = current_page+1
      }else{
        return new Promise((resolve, reject) => {
          resolve()
        });
      }
    }

    const loading = this.presentLoading()
    return this.services.fetchProductBySearch(this.searchText, {page, last_time}).then( response => {
      const {data, meta} = response
      if(type === 'new'){
        this.product.data = Object.assign([], data)
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }else{
        this.product.data = Object.assign([], this.product.data.concat(data))
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }

    }).then(() => loading.dismiss())
  }

  productLoadNewRefresher(refresher): Promise<any>{
    return this.fetchProduct().then((response) => {
      refresher.complete()
    })
  }

  productLoadMore(infinity): Promise<any>{
    return this.fetchProduct('more').then((response) => {
      infinity.complete()
    })
  }

}

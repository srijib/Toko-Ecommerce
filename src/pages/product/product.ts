import { Component } from '@angular/core';
import { Events, NavParams, NavController, LoadingController } from 'ionic-angular';

import {Services} from '../../app/services';

import {isEmpty, get, find, findIndex} from 'lodash';

import {ProductDetailPage} from './detail'
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpModule } from '@angular/http';
const defaultProduct = {
  data: [],
  pagination: {

  }
}

@Component({
  selector: 'page-product',
  templateUrl: 'product.html'
})
export class ProductPage {

  defaultProductImage: string = 'assets/img/dummy/500x500.jpg'

  categoryKey:string = "myfriends"
  categoryIndex:number = 0

  type:string = "public"

  categories:any = {
    keys: [],
    labels: []
  }

  isLoading:boolean = false

  product: any = Object.assign({}, defaultProduct)

  provinces: any = []
  cities: any = []

  province_id: any = ''
  city_id: any = ''
  slug:any
  title:any

  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private services: Services,
    public http: Http,
  ) {
  this.http.get('https://elzumie.com//api/slugcat').map(res => res.json()).subscribe( data => {
        this.categories.keys = data;
        
    },
    err => {
        console.log("Oops!");
    });
    this.http.get('https://elzumie.com//api/titlecat').map(res => res.json()).subscribe( data => {
        this.title = data;
        
    },
    err => {
        console.log("Oops!");
    });

    const category = navParams.get('category')
    const type = navParams.get('type')
const index = navParams.get('index')
    if(type){
      this.type = type
    }

    

    

    if(category){
      this.categoryKey = category
      this.categoryIndex = navParams.get('index')
    }

    events.subscribe('product:change-category', params => {
      const {category, type} = params
      this.categoryKey = category
      this.type = type || "public"
      this.categoryIndex = navParams.get('index')
    })

    events.subscribe('product:proxy-detail', id => this.goToDetail(id))
    events.subscribe('product:refetch', () => this.fetchProduct())
  }

  compareCategory(current, selected): boolean {
    return current === selected
  }

  changeCategory(){
    this.categoryKey = get(this.categories.keys, this.categoryIndex, 'myfriends')
    this.fetchProduct()
  }

  ionViewDidLoad(){
    setTimeout(() => {
      if(this.isProductEmpty()){
        this.fetchProduct()
      }
    }, 300)
    // this.fetchProduct()
    //
    if(isEmpty(this.provinces)){
      this.prepareProvince()
    }
  }

  isLogged(): boolean{
    const user = Object.assign({}, this.services.user)
    return user.id !== undefined && user.id !== '' && user.id !== null
  }

  isProductEmpty(): boolean{
    return !this.isLoading && isEmpty(this.product.data)
  }

  goToDetail(id){
    this.navCtrl.push(ProductDetailPage, {id})
  }

  fetchProduct(direction='new'){

    let page = 1, last_time = 0
    const {pagination} = this.product
    if(!isEmpty(pagination) && direction !== 'new'){
      const {current_page, total_pages} = pagination

      if(current_page !== total_pages){
        page = current_page+1
      }else{
        return new Promise((resolve, reject) => {
          resolve()
        });
      }
    }

    if(direction === 'new'){
      this.product = Object.assign({}, defaultProduct)
    }

    const {type, province_id, city_id} = this

    this.events.publish('app:loading:show')
    this.isLoading = true
    return this.services.fetchProductByCategory(this.categoryKey, {page, last_time, type, province_id, city_id}).then( response => {
      const {data, meta} = response
      if(direction === 'new'){
        this.product.data = Object.assign([], data)
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }else{
        this.product.data = Object.assign([], this.product.data.concat(data))
        this.product.pagination = Object.assign({}, get(meta, 'pagination'))
      }

    }).catch(error => {
      this.events.publish('app:error', error)
    }).then(() => this.events.publish('app:loading:close')).then(() => this.isLoading = false)
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

  compareSelect(current, selected): boolean {
    return current == selected
  }

  provinceChange(){
    const self = this
    this.cities = Object.assign([])
    this.city_id = ''
    let cities = get(find(this.provinces, (province: any) => {
      return province.province_id == self.province_id
    }), 'city', [])

    this.cities = Object.assign([], this.cities, cities)

    this.fetchProduct('new')
  }

  prepareProvince(){
    this.services.fetchCartLocation().then(location => {
      this.provinces = Object.assign([], this.provinces, location)
      this.provinceChange()
    }).catch(error => this.events.publish('app:error', error))
  }


  cityChange(){
    this.fetchProduct('new')
  }

}

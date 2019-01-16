import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { LocalStorageService } from 'ngx-webstorage';

import {get, findIndex, pick} from 'lodash';

@Injectable()
export class Cart{
  http: any
  token: string
  token_ttl: number
  user: any

  constructor(
    private storage: LocalStorageService,
    private events: Events
  ){
    let cart = this.parse()
    events.publish('tabs:set-count-cart', cart.qty)
    events.subscribe('cart:add', item => this.add(item))
    events.subscribe('cart:remove', ({storeIndex, productIndex}) => this.remove(storeIndex, productIndex))
    events.subscribe('cart:empty', () => this.empty())
  }

  parse(){
    return Object.assign({}, {
      data: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      weight: 0,
      qty: 0,
    }, this.storage.retrieve('cart'))
  }

  add(item: any){
    let cart = this.parse()
    let store: any
    let product: any

    /* Get Store */
    let storeIndex = findIndex(cart.data, (store: any, index) => {
      return store.id === item.user.id
    })

    if( storeIndex < 0 ){
      store = {
        id: item.user.id,
        name: item.user.name,
        propict: item.user.propict,
        address: pick(get(item.user, 'profile.address'), ['street', 'post_code', 'province_id', 'city_id', 'province', 'city', 'phone']),
        products: [],
        subtotal: 0,
        weight: 0,
        qty: 0,
        total: 0,
        shipping: {
          origin: '',
          destination: '',
          courier: [],
          selected: {
            code: '',
            value: 0
          }
        }
      }

      cart.data.push(store)
      storeIndex = cart.data.indexOf(store)
    }else{
      store = cart.data[storeIndex]
    }

    /* Get Item */
    let productIndex = findIndex(store.products, (product: any, index) => {
      return product.id === item.id
    })

    if( productIndex < 0 ){
      product = {
        id: item.id,
        sku: item.product.sku,
        category: item.category.slug,
        title: item.title,
        weight: item.product.weight,
        price: item.product.price,
        qty: 0,
        total: 0,
        images: item.images,
        thumbnail: item.thumbnail,
        content: item.content,
        location: item.location,
        description: '-',
      }
      store.products.push(product)
      productIndex = store.products.indexOf(product)

    }else{
      product = store.products[productIndex]
    }

    product.qty += 1
    product.total = product.qty * product.price

    store.products[productIndex] = product

    let storeSubtotal = 0
    let storeWeight = 0
    let storeQty = 0

    store.products.forEach(product => {
      storeSubtotal += product.total
      storeWeight += (product.weight * product.qty)
      storeQty += product.qty
    })

    cart.total = cart.total - store.subtotal + storeSubtotal
    cart.weight = cart.weight - store.weight + storeWeight
    cart.qty = cart.qty - store.qty + storeQty

    store.subtotal = storeSubtotal
    store.weight = storeWeight
    store.qty = storeQty

    cart.data[storeIndex] = store

    this.storage.store('cart', cart)

    this.events.publish('cart:updated', cart)
    this.events.publish('tabs:set-count-cart', cart.qty)

    return Promise.resolve()
  }

  update(storeIndex, productIndex, qty){
    let cart = this.parse()
    let store = cart.data[storeIndex]
    let product = store.products[productIndex]

    product.qty = qty
    if(product.qty < 1){
      product.qty = 1
    }

    product.total = product.qty * product.price

    let storeSubtotal = 0
    let storeWeight = 0
    let storeQty = 0

    store.products.forEach(product => {
      storeSubtotal += product.total
      storeWeight += (product.weight * product.qty)
      storeQty += product.qty
    })

    cart.total = cart.total - store.subtotal + storeSubtotal
    cart.weight = cart.weight - store.weight + storeWeight
    cart.qty = cart.qty - store.qty + storeQty

    store.subtotal = storeSubtotal
    store.weight = storeWeight
    store.qty = storeQty

    store.products[productIndex] = product
    cart.data[storeIndex] = store

    this.storage.store('cart', cart)

    this.events.publish('cart:updated', cart)
    this.events.publish('tabs:set-count-cart', cart.qty)

    return Promise.resolve()
  }

  remove(storeIndex, productIndex){
    let cart = this.parse()

    let store = cart.data[storeIndex]

    store.products.splice(productIndex, 1)

    if(store.products.length === 0){
      cart.data.splice(storeIndex, 1)
    }else{
      let storeSubtotal = 0
      let storeWeight = 0
      let storeQty = 0

      store.products.forEach(product => {
        storeSubtotal += product.total
        storeWeight += (product.weight * product.qty)
        storeQty += product.qty
      })

      cart.total = cart.total - store.subtotal + storeSubtotal
      cart.weight = cart.weight - store.weight + storeWeight
      cart.qty = cart.qty - store.qty + storeQty

      store.subtotal = storeSubtotal
      store.weight = storeWeight
      store.qty = storeQty

      cart.data[storeIndex] = store
    }

    if(cart.data.length === 0){
      return this.empty()
    }else{
      this.storage.store('cart', cart)
    }

    this.events.publish('cart:updated', cart)
    this.events.publish('tabs:set-count-cart', cart.qty)

    return Promise.resolve()
  }

  empty(){
    const cart: any = {
      data: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      weight: 0,
      qty: 0,
    }

    this.storage.store('cart', cart)

    this.events.publish('cart:updated', cart)
    this.events.publish('tabs:set-count-cart', cart.qty)

    return Promise.resolve()
  }

}

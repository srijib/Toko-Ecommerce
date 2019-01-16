import { Pipe, PipeTransform } from '@angular/core';

import {get} from 'lodash'

/**
 * Generated class for the GetPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'get',
})
export class GetPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    const key = get(args, 0)
    const def = get(args, 1)
    return get(value, key, def)
  }
}

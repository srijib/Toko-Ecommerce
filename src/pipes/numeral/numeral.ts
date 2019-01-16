import { Pipe, PipeTransform } from '@angular/core';

import numeraljs from 'numeral';

/**
 * Generated class for the NumeralPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'numeral',
})
export class NumeralPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    return numeraljs(value).format();
  }
}

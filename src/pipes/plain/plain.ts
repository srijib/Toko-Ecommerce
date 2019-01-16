import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PlainPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'plain',
})
export class PlainPipe implements PipeTransform {
  /**
   * Takes a value and makes it string.
   */
  transform(value: string, ...args) {
    return JSON.stringify(value);
  }
}

import { NgModule } from '@angular/core';
import { NumeralPipe } from './../pipes/numeral/numeral';
import { GetPipe } from './../pipes/get/get';
import { PlainPipe } from './plain/plain';
@NgModule({
	declarations: [NumeralPipe,
    GetPipe,
    PlainPipe],
	imports: [],
	exports: [NumeralPipe,
    GetPipe,
    PlainPipe]
})
export class PipesModule {}

import { Component, EventEmitter, OnInit, OnDestroy, Input, Output, ViewChild, Renderer } from '@angular/core';

@Component({
    selector: 'accordion',
    templateUrl: 'thread.component.html'
    
  })

  export class AccordionComponent implements OnInit {
    
      accordionExpanded = false;
      @ViewChild("cc") cardContent: any;
      @Input('title') title: string;

      icon: string = "arrow-forward";      
    
      constructor(public renderer: Renderer) {
    
      }
    
      ngOnInit(){
        console.log(this.cardContent.nativeElement);
        this.renderer.setElementStyle(this.cardContent.nativeElement, "webkitTransition", "max-height 500ms, padding 500ms");    
      }
    
      toggleCard(){
        if(this.accordionExpanded){
          this.renderer.setElementStyle(this.cardContent.nativeElement, "max-height", "0px");
          this.renderer.setElementStyle(this.cardContent.nativeElement, "padding", "0px 16px");      
        } else {
          this.renderer.setElementStyle(this.cardContent.nativeElement, "max-height", "500px");
          this.renderer.setElementStyle(this.cardContent.nativeElement, "padding", "13px 16px");      
        }
        this.accordionExpanded = !this.accordionExpanded;
        this.icon = this.icon == "arrow-forward" ? "arrow-down" : "arrow-forward";
        
      }
    
    }
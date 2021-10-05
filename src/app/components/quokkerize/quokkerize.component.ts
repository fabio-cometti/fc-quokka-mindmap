import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'fc-quokkerize',
  templateUrl: './quokkerize.component.html',
  styleUrls: [ './quokkerize.component.scss' ]
})
export class QuokkerizeComponent implements OnInit {

  @ViewChild('audio') private audio: any;  
  public loaded = true;

  constructor() {    
  }

  ngOnInit() {
    
  }  

  roar() {
    //TODO: Play a sound
  } 
}

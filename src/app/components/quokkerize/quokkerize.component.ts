import { Component, OnInit, ViewChild } from '@angular/core';

/**
 * Component used for show a quokka animation and play a sound
 */
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

  /**
   * start to play a sound
   */
  roar() {
    //TODO: Play a sound. Not so easy to find....
  } 
}

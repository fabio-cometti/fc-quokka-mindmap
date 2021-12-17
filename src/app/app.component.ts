import { ConnectionService } from './services/connection.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { QuokkerizeComponent } from './components/quokkerize/quokkerize.component';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main component of the application
 * 
 * @implements {OnInit}
 */
@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('runState', [
      state('stopped', style({
        right: '0',
        bottom: '-100%', 
        visibility: 'hidden'
      })),
      state('running', style({
        right: '100%',
        bottom: '-5%',
        visibility: 'visible'
      })),
      transition('stopped => running', animate('2000ms ease-in', keyframes([
        style({right: '0', bottom: '-100%', visibility: 'visible', offset: 0}),
        style({right: '0', bottom: '0', offset: 0.1}),
        style({right: '0', bottom: '-5%', offset: 0.2}),
        style({right: '100%', bottom: '-5%', offset: 1})
      ])))
    ])
  ]
})
export class AppComponent implements OnInit {

  //Icons

  /**
   * Font Awesome Icon
   */
  faWindowClose = faWindowClose;

  /**
   * Reference to QuokkerizeComponent, used to directly invoke methods on the component
   */
  @ViewChild('quokka') quokka!: QuokkerizeComponent; 
  
  /**
   * A BehaviorSubject which control the state of the QuokkerizeComponent animation. 
   * It can emit 'stopped' or 'running'
   */
  quokkaState$= new  BehaviorSubject<'stopped' | 'running'>('stopped');  

  /**
   * An array of maps tabs. Each tab has a title and an id (used as unique identifier)
   */
  tabs = [{title: 'The root 1', id: uuidv4(), modified: false}];
  
  /**
   * Current selected tab
   */
  currentTab = 0;  

  /**
   * Default constructor   
   */
  constructor() {

  }

  ngOnInit(): void { 
    
  }  
  
  /**
   * Add a new tab with a new mind map
   */
  addMap(): void {
    this.tabs.push({title: `The root ${this.tabs.length + 1}`, id: uuidv4(), modified: false});
    this.currentTab = this.tabs.length - 1;
  }

  /**
   * Receive a title update event from a map and update the title of the corresponding tab
   * @param newTitle the new title of the root idea of the map
   * @param index the index of the tab to update
   */
  updateTitle(newTitle: string, index: number): void {
    this.tabs[index].title = newTitle;
  }

  /**
   * A function for uniquely identifying a tab
   * @param index the index of the tab
   * @param node the tab info (title and id)
   * @returns the id of the tab
   */
  identify(index: number, node: {title: string, id: string}): string {
    return node.id;
  }

  /**
   * Start the quokka animation emitting a 'running' state for the animation
   */
  getAQuokka(): void {
    this.quokkaState$.next('running');
  }

  /**
   * Stop and reset the animation emitting a 'stopped' state
   * @param event
   */
  resetQuokka(event: any){
    this.quokkaState$.next('stopped');
  }

  /**
   * Used to play a sound in the QuokkerizeComponent
   * @param event
   */
  roar(event: any){
    this.quokka.roar();
  }

  /**
   * Remove a tab and the associated map
   * @param tab 
   * @param index the index of the tab to remove
   */
  closeMap(tab: string, index: number): void {
    this.tabs.splice(index, 1);
  }

  onMapModified(modified: boolean): void {

  }  
}

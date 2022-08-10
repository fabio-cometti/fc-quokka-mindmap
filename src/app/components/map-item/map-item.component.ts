import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { faPlusCircle, faTrashAlt, faExchangeAlt, faArrowCircleUp, faArrowCircleDown, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { EditNotesComponent } from '../edit-notes/edit-notes.component';

@Component({
  selector: 'fc-map-item',
  templateUrl: './map-item.component.html',
  styleUrls: ['./map-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapItemComponent implements OnInit, AfterViewInit {
    
  /**
   * Id of the node
   */
  @Input('nodeId') id: string = '';
  
  /**
   * Specify if a node is a root
   */
  @Input('isRoot') isRoot: boolean = false;
  
  /**
   * CSS class for the node
   */
  @Input('css') css: string = 'conn';

  /**
   * Position of the node
   */
   @Input('position') position: 'left' | 'right' | 'center' = 'right';
  
  /**
   * Title of the node
   */
  @Input('title') title: string = '';
  
  /**
   * Specify if a node is a first level node (a direct child of the root node)
   */
  @Input('isFirstLevel') isFirstLevel: boolean = false;
  
  /**
   * State of the node. it can be 'edit' or 'view'
   */
  @Input('state') state: 'edit' | 'view' = 'view';
  
  /**
   * Specify if the node is the first child of its parent
   */
  @Input('isFirst') isFirst = false;

  /**
   * Notes for the node
   */
   @Input('notes') notes = '';

  /**
   * Specify if the node is the last child of its parent
   */
  @Input('isLast') isLast = false; 

  @Input('isMonochromatic') isMonochromatic = false;
  
  /**
   * Emit an event when the title is modified
   */
  @Output('titleChange') titleChange = new EventEmitter<string>();  
  
  /**
   * Emit an event when the node is rendered
   */
  @Output('initialized') initialized = new EventEmitter<string>();
  
  /**
   * Emit when a child node is added
   */
  @Output('addedNode') addedNode = new EventEmitter<string>();
  
  /**
   * Emit when the current node is deleted
   */
  @Output('nodeDeleted') nodeDeleted = new EventEmitter<string>();
  
  /**
   * Emit when node change state
   */
  @Output('changeState') changeState = new EventEmitter<string>();
  
  /**
   * Emit when node is moved from left to right or vice-versa
   */
  @Output('movedNode') movedNode = new EventEmitter<string>();
  
  /**
   * Emit when a node is sorted
   */
  @Output('sortedNode') sortedNode = new EventEmitter<{id: string, direction: 'up' | 'down'}>();

  /**
   * Emit when the notes change
   */
  @Output('notesChanged') notesChanged = new EventEmitter<string>();
  
  /**
   * main container reference
   */
  @ViewChild('c') c!: ElementRef;
  
  /**
   * input field reference
   */
  @ViewChild('i') i!: ElementRef; 
  
  //Icons
  
  faPlusCircle = faPlusCircle;
  faTrashAlt = faTrashAlt;
  faExchangeAlt = faExchangeAlt;
  faArrowCircleUp = faArrowCircleUp;
  faArrowCircleDown = faArrowCircleDown;
  faStickyNote = faStickyNote;

  /**
   * flag for toolbar visibility
   */
  showToolbarFlag = false;  

  /**
   * Default constructor
   */
  constructor(private dialog: MatDialog) { }  

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {    
    this.initialized.emit(this.id);
    timer(20).subscribe(() => {
    if(!!this.i) {      
      this.i.nativeElement.select();
    }
    });
  }

  /**
   * move the node in view state
   */
  goToView(): void {
    this.state = 'view';
    this.changeState.emit('view');
  }

  /**
   * move the node in edit state
   */
  goToEdit(): void {
    this.state = 'edit';    
    timer(20).subscribe(() => {
      this.changeState.emit('edit');
      if(!!this.i) {
        this.i.nativeElement.select();
      }
    });    
  }

  /**
   * Update the title based on input value
   * @param newtitle 
   */
  titleChanged(newtitle: any): void {
    this.title = newtitle.srcElement.value;
    this.titleChange.emit(newtitle.srcElement.value);
  }

  /**
   * Show the toolbar
   */
  showToolbar(): void {
    this.showToolbarFlag = true;
  }

  /**
   * Hide the toolbar
   */
  hideToolbar(): void {
    this.showToolbarFlag = false;
  }

  /**
   * Handle add node button click
   */
  addNode(): void {
    this.addedNode.emit(this.id);
  }

  /**
   * Handle delete node button click
   */
  deleteNode(): void {
    this.nodeDeleted.emit(this.id);
  }

  /**
   * Handle move node button click
   */
  moveNode(): void {
    this.movedNode.emit(this.id);
  }

  /**
   * Handle move up node button click
   */
  moveNodeUp(): void {
    this.sortedNode.emit({id: this.id, direction: 'up'});
  }

  /**
   * Handle move down node button click
   */
  moveNodeDown(): void {
    this.sortedNode.emit({id: this.id, direction: 'down'});
  } 

  /**
   * Handle edit notes button click
   */
  editNotes(): void {
    this.dialog.open(EditNotesComponent, { data: {
      title: this.title,
      notes: this.notes
    }}).afterClosed().subscribe(result => {
      if(!!result && result !== this.notes) {
        this.notesChanged.emit('' + result);
      }
    });
  }
}

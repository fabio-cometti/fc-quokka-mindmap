import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { faPlusCircle, faTrashAlt, faExchangeAlt, faArrowCircleUp, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'fc-map-item',
  templateUrl: './map-item.component.html',
  styleUrls: ['./map-item.component.scss']
})
export class MapItemComponent implements OnInit, AfterViewInit {
    
  @Input('id') id: string = '';
  @Input('isRoot') isRoot: boolean = false;
  @Input('css') css: string = 'conn';
  
  @Input('title') title: string = '';
  @Input('isFirstLevel') isFirstLevel: boolean = false;    
  @Output('titleChange') titleChange = new EventEmitter<string>();

  @Input('state') state: 'edit' | 'view' = 'view'; 

  @Input('isFirst') isFirst = false;
  @Input('isLast') isLast = false;
  
  @Output('initialized') initialized = new EventEmitter<string>();
  @Output('addedNode') addedNode = new EventEmitter<string>();
  @Output('nodeDeleted') nodeDeleted = new EventEmitter<string>();
  @Output('changeState') changeState = new EventEmitter<string>();
  @Output('movedNode') movedNode = new EventEmitter<string>();
  @Output('sortedNode') sortedNode = new EventEmitter<{id: string, direction: 'up' | 'down'}>();
  
  @ViewChild('c') c!: ElementRef;
  @ViewChild('i') i!: ElementRef; 
  
  faPlusCircle = faPlusCircle;
  faTrashAlt = faTrashAlt;
  faExchangeAlt = faExchangeAlt;
  faArrowCircleUp = faArrowCircleUp;
  faArrowCircleDown = faArrowCircleDown;
  
  showToolbarFlag = false;

  constructor() { }  

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

  goToView(): void {
    this.state = 'view';
    this.changeState.emit('view');
  }

  goToEdit(): void {
    this.state = 'edit';    
    timer(20).subscribe(() => {
      this.changeState.emit('edit');
      if(!!this.i) {
        this.i.nativeElement.select();
      }
    });    
  }

  titleChanged(newtitle: any): void {
    this.title = newtitle.srcElement.value;
    this.titleChange.emit(newtitle.srcElement.value);
  }

  showToolbar(): void {
    this.showToolbarFlag = true;
  }

  hideToolbar(): void {
    this.showToolbarFlag = false;
  }

  addNode(): void {
    this.addedNode.emit(this.id);
  }

  deleteNode(): void {
    this.nodeDeleted.emit(this.id);
  }

  moveNode(): void {
    this.movedNode.emit(this.id);
  }

  moveNodeUp(): void {
    this.sortedNode.emit({id: this.id, direction: 'up'});
  }

  moveNodeDown(): void {
    this.sortedNode.emit({id: this.id, direction: 'down'});
  }
}

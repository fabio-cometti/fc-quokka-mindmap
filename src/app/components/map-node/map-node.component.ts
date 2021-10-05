import { BehaviorSubject, timer } from 'rxjs';
import { ConnectionService } from 'src/app/services/connection.service';
import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MapNode } from 'src/app/models/map-item';
import { map } from 'rxjs/operators';

@Component({
  selector: 'fc-map-node',
  templateUrl: './map-node.component.html',
  styleUrls: ['./map-node.component.scss']
})
export class MapNodeComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {

  private cssIndex = 0;
  private inputChanged = false;  
  private children$ = new BehaviorSubject<MapNode[]>([]);
  leftNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'left')));
  rightNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'right')));

  @Input('node') node!: MapNode; 
  @Input('isFirst') isFirst = false;
  @Input('isLast') isLast = false;
  @Output('nodeAdded') nodeAdded = new EventEmitter<MapNode>();
  @Output('nodeDeleted') nodeDeleted = new EventEmitter<string>(); 
  @Output('nodeMoved') nodeMoved = new EventEmitter<string>(); 
  @Output('nodeSorted') nodeSorted = new EventEmitter<{id: string, direction: 'up' | 'down'}>();
  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  
  constructor(private connectionService: ConnectionService) { }

  ngOnInit(): void {
    this.children$.next(this.node.children);
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  ngAfterViewChecked(): void {
    if(this.inputChanged) {
      this.inputChanged = false;
      this.refresh();      
    } 
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputChanged = true;
  }  

  addChild(id: string): void {  
    
    const leftNodes = this.node.children.filter(i => i.position === 'left');
    const rightNodes = this.node.children.filter(i => i.position === 'right');

    const rootPosition = leftNodes.length >= rightNodes.length ? 'right' : 'left';

    const position = this.node.isRoot ? rootPosition : this.node.position;
    const css = this.node.isRoot ? 'conn' + (this.cssIndex++ % 10) : this.node.css;
    
    const newNode = this.connectionService.getNewNode(position, this.node, css, true);

    this.node.children.push(newNode);
    this.children$.next(this.node.children);
  }

  deleteNode(id: string): void {    
    this.nodeDeleted.emit(id);
  }

  moveNode(id: string): void {    
    this.nodeMoved.emit(id);
  }

  sortNode(event: {id: string, direction: 'up' | 'down'}): void {    
    this.nodeSorted.emit(event);
  }

  onInitialized(id: string): void {
    this.nodeAdded.emit(this.node);    
  }

  onNodeAdded(node: MapNode): void {        
    this.connectionService.connect(this.node.id, node.id, node.position === 'left', node.css); 
    this.connectionService.refresh();
  }
  
  onNodeDeleted(id: string): void {        
    
    const deletedNode = this.node.children.filter(i => i.id === id)[0];
    this.recursiveDeletion(deletedNode);
    
    this.node.children = this.node.children.filter(i => i.id !== id) || []; 
    this.connectionService.disconnect(id);
    this.connectionService.refresh();
    this.children$.next(this.node.children);    
  }

  onNodeMoved(id: string): void {        
    
    const movedNode = this.node.children.filter(i => i.id === id)[0];
    this.recursiveMove(movedNode);    
    this.connectionService.disconnect(id);              
    this.children$.next(this.node.children);    
  }

  onNodeSorted(event: {id: string, direction: 'up' | 'down'}): void { 
    const index = this.node.children.map(n => n.id).indexOf(event.id);
    let swapIndex = event.direction === 'up' ? index - 1 : index + 1;
    swapIndex = swapIndex < 0 ? 0 : swapIndex;
    swapIndex = swapIndex > this.node.children.length - 1 ? this.node.children.length - 1 : swapIndex;

    if (index !== swapIndex) {
      const temp = this.node.children[index];
      this.node.children[index] = this.node.children[swapIndex];
      this.node.children[swapIndex] = temp;
    }   
    
    this.connectionService.refresh();    
    this.children$.next(this.node.children);    
  }

  onChangeState(): void {
    this.node.isNew = false;
    this.connectionService.refresh();
  }

  onUpdateTitle(newTitle: string): void {    
    this.titleChange.emit(newTitle);    
  }

  updateTitle(newTitle: string): void {
    this.node.title = newTitle;
    this.titleChange.emit(newTitle);    
  }

  refresh(): void {  
    this.node.children.forEach(element => {
      this.connectionService.connect('' + this.node.id, element.id, element.position === 'left', element.css);      
    });     

    this.connectionService.refresh();
  }  

  identify(index: number, node: MapNode): string {
    return node.id;
  }

  private recursiveDeletion(node: MapNode): void {
    node.children.forEach(element => {
      this.recursiveDeletion(element);
      this.connectionService.disconnect(element.id);
    });
  }

  private recursiveMove(node: MapNode): void {
    node.position = node.position === 'left' ? 'right' : 'left';     
    node.children.forEach(element => {
      this.recursiveMove(element);
      this.connectionService.disconnect(element.id);
    });
  }
}

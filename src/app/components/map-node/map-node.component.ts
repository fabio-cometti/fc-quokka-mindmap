import { BehaviorSubject, Observable, timer } from 'rxjs';
import { ConnectionService } from 'src/app/services/connection.service';
import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MapNode } from 'src/app/models/map-item';
import { delay, filter, map, switchMap, tap } from 'rxjs/operators';
import { LocalConnectionService } from 'src/app/services/local-connection.service';
import { MapManagerService } from 'src/app/services/map-manager.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import cloneDeep from 'lodash-es/cloneDeep';
import { v4 as uuidv4 } from "uuid";

/**
 * Component used for rendering a node and all his child
 */
@Component({
  selector: 'fc-map-node',
  templateUrl: './map-node.component.html',
  styleUrls: ['./map-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[LocalConnectionService]
})
export class MapNodeComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {
  
  private inputChanged = false;  
  private children$ = new BehaviorSubject<MapNode[]>([]);
  public isHover = false;

  /**
   * Reference to the canvas
   */
   @ViewChild('c') c!: ElementRef; 
  
  /**
   * Nodes on the left of the parent node
   */
  leftNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'left')));
  
  /**
   * Nodes on the right of the parent node
   */
  rightNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'right')));

  allIds$!: Observable<string[]>; 

  /**
   * The node
   */
  @Input('node') node!: MapNode; 
  
  /**
   * A boolean indicate if the node is the first child of his parent
   */
  @Input('isFirst') isFirst = false;
  
  /**
   * A boolean indicate if the node is the last child of his parent
   */
  @Input('isLast') isLast = false;

  /**
   * Emit an event when the nested item is initialized and rendered. 
   * It's used for connecting the new item with the parent node
   */
  @Output('nodeAdded') nodeAdded = new EventEmitter<MapNode>();
  
  /**
   * Emit an event when a delete node request is generated
   */
  @Output('nodeDeleted') nodeDeleted = new EventEmitter<string>(); 
  
  /**
   * Emit an event when user want to move a branch from left side to right side or vice-versa
   */
  @Output('nodeMoved') nodeMoved = new EventEmitter<string>(); 
  
  /**
   * Emit an event when use want to move a node up or down respect to his siblings
   */
  @Output('nodeSorted') nodeSorted = new EventEmitter<{id: string, direction: 'up' | 'down'}>();
  
  /** 
   * Emit an event when the title of the item is changed
  */
  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  
  /**
   * Default constructor
   * @param connectionService 
   */
  constructor(    
    private mapManager: MapManagerService,
    private localConnection: LocalConnectionService
  ) { }

  
  ngOnInit(): void {
    this.allIds$ = this.mapManager.allIds$.pipe(map(arr => arr.filter(id => id !== 'L-' + this.node.id)));
    this.localConnection.setNode(this.node);
    this.children$.next(this.node.children); 
    
    this.mapManager.mockingNode$.pipe(filter(mock=> this.node.id === mock.parentId)).subscribe(mock => {
      this.children$.next(this.node.children); 
    });

    this.mapManager.demockingNode$.pipe(
      filter(mock=> this.node.id === mock.parentId),
      tap(mock => this.children$.next(this.node.children)),
      delay(0)
    ).subscribe(mock => {      
      this.children$.next(this.node.children);      
      this.localConnection.connect(this.node.id, mock.originalId, this.node.position === 'left', this.node.css); 
    });
  }

  ngAfterViewInit(): void {
    this.localConnection.setContainer(this.c);
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

  /**
   * Add a child node to the current node
   * @param id id of the node
   */
  addChild(id: string): void { 
    this.mapManager.addChild(this.node); 
    this.children$.next(this.node.children);    
  }

  /**
   * Handle node deletion
   * @param id id of the node to delete
   */
  deleteNode(id: string): void {    
    this.nodeDeleted.emit(id);
  }

  /**
   * Handle move node from left to right or viceversa
   * @param id id of the moved node
   */
  moveNode(id: string): void {    
    this.nodeMoved.emit(id);
  }

  /**
   * Handle the sort of nodes
   * @param event an event describing the sort operation (node id and sort direction)
   */
  sortNode(event: {id: string, direction: 'up' | 'down'}): void {    
    this.nodeSorted.emit(event);
  }

  /**
   * Emit an event when the node item is rendered. (Required for connecting items with jsplumb)
   * @param id id of the initialized node
   */
  onInitialized(id: string): void {
    this.nodeAdded.emit(this.node);    
  }

  /**
   * Handle the adding of a child node. Connect the current node with the created child
   * @param node 
   */
  onNodeAdded(node: MapNode): void {
    console.log(node.id);        
    this.localConnection.connect(this.node.id, node.id, node.position === 'left', node.css); 
    this.localConnection.refresh();    
  }
  
  /**
   * Handle the deletion of a child node. Disconnect the node and recursively delete all the children
   * @param id the id of the node to delete
   */
  onNodeDeleted(id: string): void {        
    
    this.mapManager.deleteChild(id, this.node); 
    this.children$.next(this.node.children);
    this.localConnection.refresh();       
  }

  /**
   * Handle the event of moving a node from left to right or vice-versa
   * @param id the id of the moved node
   */
  onNodeMoved(id: string): void { 
    this.mapManager.moveChild(id, this.node);
    this.children$.next(this.node.children);
    this.localConnection.refresh(); 
  }

  /**
   * Handle the event of sorting a node up or down as compared to his siblings
   * @param event 
   */
  onNodeSorted(event: {id: string, direction: 'up' | 'down'}): void { 
    this.mapManager.sortNode(event.id, event.direction, this.node);
    this.children$.next(this.node.children);
    this.localConnection.refresh();
  }

  /**
   * Handle the event of state change of a node
   */
  onChangeState(): void {
    this.node.isNew = false;
    this.localConnection.refresh();
  }

  /**
   * Handle the event of a new title set on the node
   * @param newTitle the new title
   */
  onUpdateTitle(newTitle: string): void {    
    this.titleChange.emit(newTitle);    
  }

  /**
   * Emit the event of a new title set on the node item
   * @param newTitle the new title
   */
  updateTitle(newTitle: string): void {
    this.node.title = newTitle;
    this.titleChange.emit(newTitle); 
    this.mapManager.mapChanged();
    this.localConnection.refresh();  
  }

  /**
   * Refresh the node connections
   */
  refresh(): void {  
    this.node.children.forEach(element => {
      this.localConnection.connect('' + this.node.id, element.id, element.position === 'left', element.css);      
    });     

    this.localConnection.refresh();
  }  

  /**
   * 
   * @param notes Handle th eupdate of node notes
   */
  onNotesChanged(notes: string): void {
    this.node.notes = notes;
  }  

  onDropEnter(event: CdkDragEnter<any>): void {
    if(event.container.id !== event.item.dropContainer.id) {
      this.isHover = true;
      const clone = cloneDeep(event.item.data) as MapNode;
      clone.temp = true;      
      this.mapManager.mockNode(clone);
    }
    
  }

  onDropExit(event: CdkDragExit<any>): void {
    if(event.container.id !== event.item.dropContainer.id) {
      this.isHover = false;
      this.mapManager.removeMockNode(event.item.data);
    }
  }

  onDropped(event: CdkDragDrop<any, any>): void {
    this.isHover = false;
    this.mapManager.removeAllMockNodes();
    //console.log(this.node.id);
  }

  /**
   * Uniquely identifies a node in the children list
   * @param index the index of the node
   * @param node the node 
   * @returns the unique id of the node
   */
  identify(index: number, node: MapNode): string {
    return node.id + node.uniqueIdentifier;    
  }
    
}

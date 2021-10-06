import { BehaviorSubject, timer } from 'rxjs';
import { ConnectionService } from 'src/app/services/connection.service';
import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MapNode } from 'src/app/models/map-item';
import { map } from 'rxjs/operators';

/**
 * Component used for rendering a node and all his child
 */
@Component({
  selector: 'fc-map-node',
  templateUrl: './map-node.component.html',
  styleUrls: ['./map-node.component.scss']
})
export class MapNodeComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {

  private cssIndex = 0;
  private inputChanged = false;  
  private children$ = new BehaviorSubject<MapNode[]>([]);
  
  /**
   * Nodes on the left of the parent node
   */
  leftNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'left')));
  
  /**
   * Nodes on the right of the parent node
   */
  rightNodes$ = this.children$.asObservable().pipe(map(children => children.filter(n => n.position === 'right')));

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

  /**
   * Add a child node to the current node
   * @param id id of the node
   */
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
    this.connectionService.connect(this.node.id, node.id, node.position === 'left', node.css); 
    this.connectionService.refresh();
  }
  
  /**
   * Handle the deletion of a child node. Disconnect the node and recursively delete all the children
   * @param id the id of the node to delete
   */
  onNodeDeleted(id: string): void {        
    
    const deletedNode = this.node.children.filter(i => i.id === id)[0];
    this.recursiveDeletion(deletedNode);
    
    this.node.children = this.node.children.filter(i => i.id !== id) || []; 
    this.connectionService.disconnect(id);
    this.connectionService.refresh();
    this.children$.next(this.node.children);    
  }

  /**
   * Handle the event of moving a node from left to right or vice-versa
   * @param id the id of the moved node
   */
  onNodeMoved(id: string): void {        
    
    const movedNode = this.node.children.filter(i => i.id === id)[0];
    this.recursiveMove(movedNode);    
    this.connectionService.disconnect(id);              
    this.children$.next(this.node.children);    
  }

  /**
   * Handle the event of sorting a node up or down as compared to his siblings
   * @param event 
   */
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

  /**
   * Handle the event of state change of a node
   */
  onChangeState(): void {
    this.node.isNew = false;
    this.connectionService.refresh();
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
  }

  /**
   * Refresh the node connections
   */
  refresh(): void {  
    this.node.children.forEach(element => {
      this.connectionService.connect('' + this.node.id, element.id, element.position === 'left', element.css);      
    });     

    this.connectionService.refresh();
  }  

  /**
   * Uniquely identifies a node in the children list
   * @param index the index of the node
   * @param node the node 
   * @returns the unique id of the node
   */
  identify(index: number, node: MapNode): string {
    return node.id;
  }

  /**
   * Recursively delete a node and all his children
   * @param node the node
   */
  private recursiveDeletion(node: MapNode): void {
    node.children.forEach(element => {
      this.recursiveDeletion(element);
      this.connectionService.disconnect(element.id);
    });
  }

  
  /**
   * Recursively move a node from left to right or vice-versa
   * @param node the node
   */
  private recursiveMove(node: MapNode): void {
    node.position = node.position === 'left' ? 'right' : 'left';     
    node.children.forEach(element => {
      this.recursiveMove(element);
      this.connectionService.disconnect(element.id);
    });
  }
}

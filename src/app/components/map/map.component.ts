import { MapNodeComponent } from './../map-node/map-node.component';
import { MapNode } from './../../models/map-item';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ConnectionService } from 'src/app/services/connection.service';

/**
 * Component for manage the map canvas
 */
@Component({
  selector: 'fc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit  {

  /**
   * The root node
   */
  @Input('node') node!: MapNode;  
  
  /**
   * The zoom level
   */
  @Input('zoom') zoom: string = 'zoom1_0';
  
  /**
   * Emit when the root node title change
   */
  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  
  /**
   * Reference to the canvas
   */
  @ViewChild('c') c!: ElementRef; 
  
  private inputChanged = false;  

  /**
   * Default constructor
   * @param connectionService  
   */
  constructor(private connectionService: ConnectionService) { }    

  ngAfterViewInit(): void {
    this.connectionService.setContainer(this.c);    
  }  

  /**
   * Delete all connections
   */
  deleteConnections(): void {
    this.connectionService.disconnectAll(this.node.id);
  }

  /**
   * Handle the update title event on the root node
   * @param newTitle 
   */
  updateTitle(newTitle: string): void {
    this.titleChange.emit(newTitle);
  }
}

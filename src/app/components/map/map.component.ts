import { MapNodeComponent } from './../map-node/map-node.component';
import { MapNode } from './../../models/map-item';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RootMapCollection } from 'src/app/models/map-item';
import { ConnectionService } from 'src/app/services/connection.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'fc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit  {

  
  @Input('node') node!: MapNode;  
  @Input('zoom') zoom: string = 'zoom1_0';
  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  @ViewChild('c') c!: ElementRef; 
  
  private inputChanged = false;  

  constructor(private connectionService: ConnectionService) { }    

  ngAfterViewInit(): void {
    this.connectionService.setContainer(this.c);    
  }  

  deleteConnections(): void {
    this.connectionService.disconnectAll(this.node.id);
  }

  updateTitle(newTitle: string): void {
    this.titleChange.emit(newTitle);
  }
}

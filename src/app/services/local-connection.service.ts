import { ElementRef, Injectable, OnDestroy, OnInit } from '@angular/core';
import { MapManagerService } from './map-manager.service';
import { AnchorSpec, jsPlumb } from 'jsplumb';
import { Subscription, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MapNode } from '../models/map-item';

@Injectable({
  providedIn: 'root'
})
export class LocalConnectionService implements OnDestroy { 

  private subscriptions: Subscription = new Subscription();
  private rightAnchors: [AnchorSpec, AnchorSpec] = ['Right', 'Left'];
  private leftAnchors: [AnchorSpec, AnchorSpec]  = ['Left', 'Right']; 
  
  private node!: MapNode;
  
  /**
   * Instance of JS Plumb with some default values.
   * Used for connecting nodes on the same map
   */
   private jsPlumbInstance = jsPlumb.getInstance({
    Anchors: this.rightAnchors,
    Endpoint: ['Dot', { radius: 1 }],
    Connector: ['Bezier', {curviness: 70}]
  });
  
  constructor(private mapManager: MapManagerService) { 
    this.subscriptions.add(this.mapManager.disconnectAll$.subscribe(() => this.disconnectAll()));
    this.subscriptions.add(this.mapManager.disconnectNode$.subscribe(id => this.disconnect(id)));    
    this.subscriptions.add(this.mapManager.repaintAll$.subscribe(() => this.refreshLocally()));
  }  

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Connect two nodes non the map
   * @param sourceId Id of the parent node
   * @param targetId Id of the child node
   * @param leftSide A boolean which indicates if this connection is to the left (true) or to the right (false) of the root idea
   * @param css A CSS class for styling the node and the connection
   */
   connect(sourceId: string, targetId: string, leftSide: boolean = false, css: string | null = null): void {
    this.jsPlumbInstance.connect({
      source: sourceId,
      target: targetId,
      detachable: false,
      cssClass: !!css ? css : 'conn', 
      anchors: leftSide ?  this.leftAnchors : this.rightAnchors 
    }); 
  }

  /**
   * Disconnect a node
   * @param sourceId the node to disconnect
   */
  disconnect(sourceId: string): void {
    this.jsPlumbInstance.remove(sourceId);
  }

  /**
   * Disconnect all the nodes from th parent
   * @param sourceId 
   */
  disconnectAll(): void {
    this.jsPlumbInstance.getAllConnections().forEach(conn => {
      this.jsPlumbInstance.remove(conn.sourceId);
    }); 
    this.jsPlumbInstance.repaintEverything();
  }  

  /**
   *  Refresh local node
   */
  refreshLocally(): void {
    timer(0).subscribe(() => {
      this.jsPlumbInstance.repaintEverything();           
    });
  }

  /**
   * 
   * @param container Set the main container for the node
   */
  setContainer(container: ElementRef): void {
    this.jsPlumbInstance.setContainer(container.nativeElement);    
  }

  /**
   * 
   * @param node Set the root node associated with the service
   */
  setNode(node: MapNode): void {
    this.node = node;
  }
}

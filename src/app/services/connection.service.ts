import { MapNode } from './../models/map-item';
import { RootMapCollection } from 'src/app/models/map-item';
import { Injectable, ElementRef } from '@angular/core';
import { AnchorSpec, jsPlumb } from 'jsplumb';
import { toPng, toBlob, toSvg } from 'html-to-image';
import { downloadURI } from '../core/utils';
import { v4 as uuidv4 } from 'uuid';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  /**
   * Instance of JS Plumb with some default values.
   * Used for connecting nodes on the same map
   */
  private jsPlumbInstance = jsPlumb.getInstance({
    Anchors: ['Right', 'Left'],
    Endpoint: ['Dot', { radius: 1 }],
    Connector: ['Bezier', {curviness: 70}]
  });

  private rightAnchors: [AnchorSpec, AnchorSpec] = ['Right', 'Left'];
  private leftAnchors: [AnchorSpec, AnchorSpec]  = ['Left', 'Right',];
  //private container!: ElementRef;

  constructor() { 
    //window.onresize = () => this.jsPlumbInstance.repaintEverything(); //Repaint the map if the window is resized
    //window.onscroll = () => this.jsPlumbInstance.repaintEverything(); //Repaint the map if scroll occurs
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
  disconnectAll(sourceId: string): void {
    this.jsPlumbInstance.getAllConnections().forEach(conn => {
      this.jsPlumbInstance.remove(conn.sourceId);
    }); 
    this.jsPlumbInstance.repaintEverything();
  }

  /**
   * Refresh and repaint the whole map
   */
  refresh(): void {
    timer(20).subscribe(() => this.jsPlumbInstance.repaintEverything());
  }

  /**
   * 
   * @param container Set the main container for the map
   */
  setContainer(container: ElementRef): void {
    this.jsPlumbInstance.setContainer(container.nativeElement);
    //this.container = container;
  }

  /**
   * Generate an image from the map in the container and open a new tab with the preview of the image
   */
  preview(): void {
    const containerElement =this.jsPlumbInstance.getContainer();    
    //const self = this;    
    toBlob(containerElement as HTMLElement, {width: containerElement.scrollWidth + 100, height: containerElement.scrollHeight + 50, backgroundColor: '#303030'})
      .then(function (blob) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      });
  }

  /**
   * Export the current map as a PNG image
   */
  exportAsPng(): void {
    const containerElement =this.jsPlumbInstance.getContainer();
    //const self = this;
    toPng(containerElement as HTMLElement, {width: containerElement.scrollWidth + 100, height: containerElement.scrollHeight + 50, backgroundColor: '#303030'})
      .then(function (dataUrl) {
        downloadURI(dataUrl,'map.png');
      });
  }

  /**
   * Export the current map as a SVG image
   */
  exportAsSVG(): void {
    const containerElement =this.jsPlumbInstance.getContainer();
    //const self = this;
    toSvg(containerElement as HTMLElement, {width: containerElement.scrollWidth + 100, height: containerElement.scrollHeight + 50, backgroundColor: '#303030'})
      .then(function (dataUrl) {
        downloadURI(dataUrl,'map.svg');
      });
  }

  /**
   * Save the current map in a JSON format
   * @param map
   */
  // saveMap(map: RootMapCollection): void {
  //   const jsonData = JSON.stringify(map);    
  //   const file = new Blob([jsonData], {type: 'text/json'});
  //   const uri = URL.createObjectURL(file);
  //   downloadURI(uri, 'map.json');
  // }

  
  // getNewMap(): RootMapCollection {
  //   return {
  //     rootItem: {
  //       id: uuidv4(),
  //       title: 'The root'
  //     },
  //     leftChildren: [],
  //     rightChildren: []
  //   }
  // }

  /**
   * Get a new root node for a new map
   * @param title The title of the root idea
   * @returns the root node
   */
  getNewRootNode(title: string | null = null): MapNode {
    return {      
      id: uuidv4(),
      title: title || 'The root',
      isRoot: true,
      position: 'center' ,     
      children:[] ,
      isFirstLevel: false,
      isNew: true     
    }
  }

  /**
   * Create a new child node
   * @param position Position of the node respect to the root idea. It can be 'left' or 'right' or 'center'
   * @param parent  The parent node. Actually this parameter is unused
   * @param css The CSS class of the node
   * @param isNew A boolean for just added nodes. 
   * @returns a new MapNode
   */
  getNewNode(position: 'left' | 'right' | 'center', parent: MapNode | null = null, css: string | null = null, isNew = false): MapNode {
    return {      
      id: uuidv4(),
      title: 'New',
      isRoot: false,
      css: !!css ? css : undefined,
      position: position,
      parent: undefined,
      children:[],
      isFirstLevel: parent?.isRoot || false,
      isNew: isNew
    }
  }
}
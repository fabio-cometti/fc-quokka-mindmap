import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { 
  faSearchPlus, 
  faSearchMinus, 
  faSave, 
  faFolderOpen, 
  faImage, 
  faImages, 
  faBezierCurve, 
  faProjectDiagram, 
  faFileMedical, 
  faGift, 
  faCog 
} from '@fortawesome/free-solid-svg-icons';
import { timer } from 'rxjs';
import { downloadURI } from 'src/app/core/utils';
import { MapNode } from 'src/app/models/map-item';
import { zoomLevels } from 'src/app/models/zoom-level';
import { ConnectionService } from 'src/app/services/connection.service';
import { PwaService } from 'src/app/services/pwa.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'fc-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.scss'],
  providers: [ConnectionService]
})
export class MapDashboardComponent implements OnInit {

  //Icons
  
  faSearchPlus = faSearchPlus;
  faSearchMinus = faSearchMinus;
  faSave = faSave;
  faFolderOpen = faFolderOpen;
  faImage = faImage;
  faImages = faImages;
  faBezierCurve = faBezierCurve;
  faProjectDiagram = faProjectDiagram;  
  faFileMedical = faFileMedical;
  faGift = faGift;
  faCog = faCog;

  rootNode!: MapNode;

  zoomIndex = 5;
  zoomLevels = zoomLevels;  

  /**
   * Initial title of the node. this value is not in sync with user changes
   */
  @Input('initialTitle') initialTitle: string | null = null;

  /**
   * Emit when the title of the root odea is changed
   */
  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  
  /**
   * Emit when add map button is clicked
   */
  @Output('addMap') addMap = new EventEmitter<void>();
  
  /**
   * Emit when 'get a quokka' button is clicked
   */
  @Output('getAQuokka') getAQuokka = new EventEmitter<void>();
  
  /**
   * Emit when a map is modified
   */
  @Output('onMapModified') onMapModified = new EventEmitter<boolean>();

  /**
   * Input file field reference
   */
  @ViewChild('fi') fi!: ElementRef;
  
  /**
   * Map component reference
   */
  @ViewChild('map') map!: MapComponent;

  /**
   * Default constructor
   * @param connectionService 
   * @param pwa 
   * @param mediaObserver
   */
  constructor(private connectionService: ConnectionService, public pwa: PwaService, private mediaObserver: MediaObserver) {

  }

  ngOnInit(): void { 
    this.rootNode = this.connectionService.getNewRootNode(this.initialTitle);
    if(this.mediaObserver.isActive('lt-sm')){
      this.zoomIndex = 3;
    }

    this.connectionService.changedMap$.subscribe( () => this.onMapModified.emit(true));
  }

  /**
   * Handle zoom in click button
   */
  zoomIn(): void {    
    if(this.zoomIndex < 5 ) {
      this.zoomIndex = this.zoomIndex + 1;
    }
  }

  /**
   * Handle zoom out click button
   */
  zoomOut(): void {    
    if(this.zoomIndex > 0) {
      this.zoomIndex = this.zoomIndex - 1;
    }
  }

  /**
   * Open the file input dialog
   */
  open(): void {
    this.fi.nativeElement.click();
  }

  /**
   * Handle file selection
   * @param files 
   */
  handleFiles(files: any) {
    const reader = new FileReader();
    const self = this;
    reader.readAsText(files.currentTarget.files[0]);
    reader.onload = (event: any) => {      
      timer(0).subscribe(() => {
        this.map.deleteConnections();
        const obj = JSON.parse(event.target.result);  
        self.rootNode = obj;
        this.titleChange.emit(obj.title);
        this.onMapModified.emit(false);        
      });
    } 
  }  

  /**
   * Handle save button click
   */
  save(): void {
    const jsonData = JSON.stringify(this.rootNode);    
    const file = new Blob([jsonData], {type: 'text/json'});
    const uri = URL.createObjectURL(file);
    downloadURI(uri, 'map.json');
    this.onMapModified.emit(false); 
  }

  /**
   * Handle export as PNG button click
   */
  exportAsPNG(): void {
    this.connectionService.exportAsPng();
  }

  /**
   * Handle export as SVG button click
   */
  exportAsSVG(): void {
    this.connectionService.exportAsSVG();
  }

  /**
   * Handle preview button click
   */
  preview(): void {
    this.connectionService.preview();
  }

  /**
   * Handle the updateTitle event on the inner map component
   * @param newTitle
   */
  updateTitle(newTitle: string): void {
    this.titleChange.emit(newTitle);
  }

  /**
   * Handle the new map click button
   */
  newMap(): void {
    this.addMap.emit();
  }

  /**
   * Handle the 'get a quokka' click button
   */
  getQuokka(): void {
    this.getAQuokka.emit();
  }

  /**
   * Handle the install click button
   */
  installPwa(): void {
    this.pwa.promptEvent.prompt();
  }
}

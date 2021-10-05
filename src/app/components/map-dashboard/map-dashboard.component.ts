import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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

  @Input('initialTitle') initialTitle: string | null = null;

  @Output('titleChange') titleChange = new EventEmitter<string>(); 
  @Output('addMap') addMap = new EventEmitter<void>();
  @Output('getAQuokka') getAQuokka = new EventEmitter<void>(); 

  @ViewChild('fi') fi!: ElementRef;
  @ViewChild('map') map!: MapComponent;

  constructor(private connectionService: ConnectionService, public pwa: PwaService) {

  }

  ngOnInit(): void { 
    this.rootNode = this.connectionService.getNewRootNode(this.initialTitle);
  }

  zoomIn(): void {    
    if(this.zoomIndex < 5 ) {
      this.zoomIndex = this.zoomIndex + 1;
    }
  }

  zoomOut(): void {    
    if(this.zoomIndex > 0) {
      this.zoomIndex = this.zoomIndex - 1;
    }
  }

  open(): void {
    this.fi.nativeElement.click();
  }

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
      });
    } 
  }  

  save(): void {
    const jsonData = JSON.stringify(this.rootNode);    
    const file = new Blob([jsonData], {type: 'text/json'});
    const uri = URL.createObjectURL(file);
    downloadURI(uri, 'map.json');
  }

  exportAsPNG(): void {
    this.connectionService.exportAsPng();
  }

  exportAsSVG(): void {
    this.connectionService.exportAsSVG();
  }

  preview(): void {
    this.connectionService.preview();
  }

  updateTitle(newTitle: string): void {
    this.titleChange.emit(newTitle);
  }

  newMap(): void {
    this.addMap.emit();
  }

  getQuokka(): void {
    this.getAQuokka.emit();
  }

  installPwa(): void {
    this.pwa.promptEvent.prompt();
  }
}

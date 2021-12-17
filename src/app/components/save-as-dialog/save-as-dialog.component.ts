import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timer } from 'rxjs';

@Component({
  selector: 'fc-save-as-dialog',
  templateUrl: './save-as-dialog.component.html',
  styleUrls: ['./save-as-dialog.component.scss']
})
export class SaveAsDialogComponent implements OnInit, AfterViewInit {
  public fileName: string = '';

  /**
   * input field reference
   */
   @ViewChild('i') i!: ElementRef; 

  constructor(
    private dialogRef: MatDialogRef<SaveAsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {title: string}
  ) { }

  /**
   * Init component
   */
  ngOnInit(): void {
    this.fileName = this.data.title;
  }

  /**
   * Select filename text
   */
  ngAfterViewInit(): void {      
    timer(20).subscribe(() => {
      if(!!this.i) {      
        this.i.nativeElement.setSelectionRange(0, this.fileName.length - 5);
      }
      });  
  }

  /**
   * Close the dialog and return the filename
   */
  save(): void {
    this.dialogRef.close(this.fileName);
  }

  /**
   * Close the dialog
   */
  cancel(): void {
    this.dialogRef.close('');
  }

}

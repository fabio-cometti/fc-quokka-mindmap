import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timer } from 'rxjs';

@Component({
  selector: 'fc-edit-notes',
  templateUrl: './edit-notes.component.html',
  styleUrls: ['./edit-notes.component.scss']
})
export class EditNotesComponent implements OnInit, AfterViewInit {

  public title: string = '';
  public notes: string = '';

  /**
   * input field reference
   */
   @ViewChild('i') i!: ElementRef; 

  constructor(
    private dialogRef: MatDialogRef<EditNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {title: string, notes: string}
  ) { }

  /**
   * Init component
   */
  ngOnInit(): void {
    this.title = this.data.title;
    this.notes = this.data.notes;
  }

  /**
   * Select filename text
   */
  ngAfterViewInit(): void {      
    timer(20).subscribe(() => {
      if(!!this.i && !!this.notes) {      
        this.i.nativeElement.setSelectionRange(0, this.notes.length);
      }
      });  
  }

  /**
   * Close the dialog and return the notes
   */
  save(): void {
    this.dialogRef.close(this.notes);
  }

  /**
   * Close the dialog
   */
  cancel(): void {
    this.dialogRef.close('');
  }

}

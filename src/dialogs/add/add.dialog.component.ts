import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {AppService} from '../../app/app.service';
import {FormControl, Validators} from '@angular/forms';
import {UserDetails} from '../../app/userDetails';



@Component({
  selector: 'app-add.dialog',
  templateUrl: '../../dialogs/add/add.dialog.html',
  styleUrls: ['../../dialogs/add/add.dialog.css']
})

export class AddDialogComponent {
  datePipeString:string;
  constructor(public dialogRef: MatDialogRef<AddDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: UserDetails,
              public dataService: AppService) {
   

  }

  formControl = new FormControl('', [
    Validators.required

]);



  submit() {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    this.dataService.addIssue(this.data);
  }
}

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AppService} from '../app.service';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {UserDetails} from '../userDetails';
import {DataSource} from '@angular/cdk/collections';
import {AddDialogComponent} from '../../dialogs/add/add.dialog.component';
import {EditDialogComponent} from '../../dialogs/edit/edit.dialog.component';
import {DeleteDialogComponent} from '../../dialogs/delete/delete.dialog.component';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-desk',
  templateUrl: './main-desk.component.html',
  styleUrls: ['./main-desk.component.css']
})

export class MainDeskComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;
  displayedColumns = ['id', 'title', 'body', 'author', 'actions'];
  exampleDatabase: AppService | null;
  dataSource: ExampleDataSource | null;
  index: number;
  id: number;
  datePipeString : string;
  username: string;


  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public dataService: AppService,
              private _router: Router){
                this.dataService.getUserName()
                .subscribe(
                  data => this.username= data.toString(),
                  error => this._router.navigate(['/main/login'])
                )
              }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;




  ngOnInit() {
    this.loadData();
  }

  logout(){
    localStorage.removeItem('token');
    this._router.navigate(['/login']);
  }

  refresh() {
    this.loadData();
  }

  addNew(issue: UserDetails) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {issue: issue }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.exampleDatabase.dataChange.value.push(this.dataService.getDialogData());
        this.refreshTable();
      }
    });
  }

  startEdit(i: number, id: number, title: string, body: string, author: string ) {
    this.id = id;
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {id: id, title: title, body: body, author: author}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        this.exampleDatabase.dataChange.value[foundIndex] = this.dataService.getDialogData();
        this.refreshTable();
      }
    });
  }

  deleteItem(i: number, id: number, title: string, body: string, author: string) {
    this.index = i;
    this.id = id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {id: id, title: title, body: body, author: author}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase(); 
    this.dataSource.filter = filterValue;
  }

  public loadData() {
    console.log("load data called");
    this.exampleDatabase = new AppService(this.httpClient);
    console.log( this.exampleDatabase,"  this.exampleDatabase ");
    console.log(this.paginator, " this.paginator");
    console.log( this.sort, "  this.sort");

    this.dataSource = new ExampleDataSource(this.exampleDatabase, this.paginator, this.sort);
    console.log(this.dataSource,"dataSource");

  }
}

export class ExampleDataSource extends DataSource<UserDetails> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    console.log("get");
    return this._filterChange.value;
  }

  set filter(filter: string) {
    console.log("set");
    this._filterChange.next(filter);
  }

  filteredData: UserDetails[] = [];
  renderedData: UserDetails[] = [];

  constructor(public _exampleDatabase: AppService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  connect(): Observable<UserDetails[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.getAllUsers();


    return merge(...displayDataChanges).pipe(map( () => {
        // Filter data
        this.filteredData = this._exampleDatabase.data.slice().filter((issue: UserDetails) => {
          const searchStr = ( issue.id + issue.title + issue.body + issue.author ).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        const sortedData = this.sortData(this.filteredData.slice());

        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
        return this.renderedData;
      }
    ));
  }

  disconnect() {}


  sortData(data: UserDetails[]): UserDetails[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'title': [propertyA, propertyB] = [a.title, b.title]; break;
        case 'body': [propertyA, propertyB] = [a.body, b.body]; break;
        case 'author': [propertyA, propertyB] = [a.author, b.author]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }




}

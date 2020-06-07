import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDetails} from './userDetails';
import {HttpClient, HttpErrorResponse,HttpParams} from '@angular/common/http';

@Injectable()


export class AppService {
  private readonly API_URL = 'http://localhost:3500/data'; //this i used fake json-server and json file is data.json//

  dataChange: BehaviorSubject<UserDetails[]> = new BehaviorSubject<UserDetails[]>([]);

  dialogData: any;

  constructor (private httpClient: HttpClient) {}

  get data(): UserDetails[] {
    return this.dataChange.value;
  }

  submitRegister(body:any){
    return this.httpClient.post('http://localhost:3000/users/register', body,{
      observe:'body'
    });
  }

  login(body:any){
    return this.httpClient.post('http://localhost:3000/users/login', body,{
      observe:'body'
    });
  }

  getUserName() {
    return this.httpClient.get('http://localhost:3000/users/username', {
      observe: 'body',
      params: new HttpParams().append('token', localStorage.getItem('token'))
    });
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllUsers(): void {
    this.httpClient.get<UserDetails[]>(this.API_URL).subscribe(data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log (error.name + ' ' + error.message);
      });
  }


  addIssue (issue: UserDetails): void {
    this.dialogData = issue;
  }

  updateIssue (issue: UserDetails): void {
    this.dialogData = issue;
  }

  deleteIssue (id: number): void {
    console.log(id);
  }
}

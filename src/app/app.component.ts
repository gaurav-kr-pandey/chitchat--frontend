import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { iif } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedUser:String="";
  toggle:boolean=false;
  messages:string[]=[];
  websocketConnection:any ;
  connection:String="Connect";
  onlineUsers:String[]=[];
  user:any = {
    text: "",
    from:"",
    to:"",
    timeStamp:123,
  };
  conn:boolean=false;

  constructor(private http:HttpClient){
    
  }

  ngOnInit(){
    console.log("Connecting..");
          try{
            var url = "ws://localhost:8080/message";
            this.websocketConnection = new WebSocket(url);
            console.log("connected.");
            this.websocketConnection.onmessage = (event:MessageEvent) => {
              try{
              //var msg = JSON.parse(event.data);
              console.log(event.data);
              this.messages.push(this.user.to+' : '+event.data);
              }catch(e){
                console.log(e);
              }
            }
          }catch(err){
              console.error("Error is : "+err);
              
          }
          setInterval(()=>{this.getOnlineUsers()},3000);
          this.user.timeStamp = new Date().getTime();
  }

  connect() {
    if(!this.conn){
      var msg = {CONNECT: this.user.from }
      this.websocketConnection.send(JSON.stringify(msg));
      this.connection = "Disconnect";
    }else{
      this.connection = "Connect";
    }
    this.conn = !this.conn;
    console.log(this.user.from);
  }
 getOnlineUsers(){
    let obs = this.http.get<String[]>('http://localhost:8080/user/online');
    obs.subscribe((res:String[])=>{
      const index = res.indexOf(this.user.from);
      if (index > -1) {
        res.splice(index, 1);
      }
        this.onlineUsers = res;
    })
    console.log(this.onlineUsers);
  }
  setTo(user:String){
    this.selectedUser = user;
    this.user.to = user;
    this.messages=[];
    console.log(user)
  }

  sendMessage(event : any){
    var x = event.target.value;
      var msg = {
          text : x,
          from : this.user.from,
          to : this.user.to,
          timeStamp : new Date().getTime()
      }
      this.websocketConnection.send(JSON.stringify(msg));
  
    
    this.messages.push(this.user.from+' : '+x);
    event.target.value = "";
    console.log(x);
  }

  startWithFrom(msg:String){
    return msg.startsWith(this.user.from);
  }

  startWithTo(msg:String){
    return msg.startsWith(this.user.to);
  }
}

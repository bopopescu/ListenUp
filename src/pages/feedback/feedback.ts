import { Component } from '@angular/core';
import { IonicPage,NavController } from 'ionic-angular';

import {UserInfoProvider} from '../../providers/userInfo/userInfo';
import {ChatInfoProvider} from '../../providers/chat-info/chat-info';
//simport {FeedbackinfoPage} from '../feedbackinfo/feedbackinfo';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import {AlertController} from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage {
  pubMes: any; //PUBLIC FEEDBACK
  annonMes: any; //ANNON FEEDBACK
  pubArray: any; //ARRAY THAT STORES PUBLIC FEEDBACK
  annonArray: any;
  usrId: any; //CURRENT USER'S ID
  curList = []; //FOR SWITCHING BETWEEN BETWEEN PUBLIC AND ANNON
  usrData:any;
  reply: any;
  checkboxOpen: any;
  reasons: any;
  feedbackTab = ""; 

  constructor(public navCtrl: NavController
    , public uInfo: UserInfoProvider
    , private chatInfo: ChatInfoProvider
    , public afData: AngularFireDatabase
    , private alertCtrl: AlertController) {
    this.pubArray = [];
    this.annonArray = [];

  	this.reloadUser();
    this.reloadFeed();
      //          this.watcherFeed('publicfeedbacks',this.pubArray);
      // this.watcherFeed('anonfeedbacks',this.annonArray);
    // if( !this.usrData ){
    //   setTimeout(() =>{
    //     console.log("waiting for data...");
    //   },2000)
    // }
    // else{
    //   this.watcherFeed('publicfeedbacks',this.pubArray);
    //   this.watcherFeed('anonfeedbacks',this.annonArray);
    // }

    console.log("usrData undefined?",this.usrData);
    // if(this.usrData.feedbacks){
      
    // }

  	// this.setFeedback();
    this.reply = true;
    this.feedbackTab = "Public";


  }

  reloadFeed(){
    this.usrData = this.uInfo.getUserInfo();
    if(!this.usrData){
      setTimeout(() => {
        this.reloadFeed() ,1000;
      })
    }
    else{

    this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child('anonfeedbacks').on('child_added', addPub => {
      var value = addPub.val() //addPub.key
      var key = addPub.key;
      value['key'] = key;
      // var key = this.reloadKey(value,'anonfeedbacks')
      console.log("finally got key!",key);
      console.log("data changed!");
       this.curListType();
       this.annonArray.push(value);
    });
        this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child('publicfeedbacks').on('child_added', addAnon => {
        var value = addAnon.val()
        var key =  addAnon.key; //this.reloadKey(value,'publicfeedbacks')
        value['key'] = key;
        console.log("finally got key!",key);
        console.log("data changed!");
       this.curListType();
       this.pubArray.push(value);
    });
    }
  }
  reloadKey(value,type){
    this.usrData = this.uInfo.getUserInfo();
    console.log("attempting reload...",this.usrData);
     if(!this.usrData.feedbacks.type[value.id].key){
         setTimeout(() => {
           this.reloadKey(value,type),2000
         });
     }
     else{
       return this.usrData.feedbacks.anonfeedbacks[value.id].key
     }
  }
  reloadUser(){
    this.usrData = this.uInfo.getUserInfo();
    if(this.usrData == undefined){
      setTimeout(() => {
        this.usrData = this.uInfo.getUserInfo(),2000;
      })
    }
    else{
      if(this.usrData.feedbacks){
         this.pubMes = this.usrData.feedbacks.publicfeedbacks;
         this.annonMes = this.usrData.feedbacks.anonfeedbacks;
      }
    }
  }
//---------------REFRESH LIST WHENEVER YOU LOAD THIS PAGE:
 ionViewCanEnter(){
       this.setFeedback();
 //   this.setUserInfo();
 //   this.pubMes = this.usrData.publicfeedbacks;
 //   this.annonMes = this.usrData.anonfeedbacks;

  }
//------------INITIALIZE ARRAYS AND SET DEFAULT PAGE AS PUBLIC-------------------
	 setFeedback(){
   if(this.usrData.feedbacks){
       this.pubArray = [];
      this.annonArray = [];
    for(var i in this.pubMes){
      this.pubArray.push(this.pubMes[i]);
  }
    for(var i in this.annonMes){
      this.annonArray.push(this.annonMes[i]);
    }
       this.curListType();
   }
   else{
       this.pubArray = [];
      this.annonArray = [];
   }

	}


//------------WHEN CLICK, GOTO SEARCH USER PAGE-------------
toSendfeed(){
	this.navCtrl.push("SearchuserPage");
}
//------Feedback information indepth-------
/*toLookfeed(mes){
  this.navCtrl.push(FeedbackinfoPage,
    {param: mes,
     reply : this.reply});
}
*/
//----------CLICKED PUBLIC----------------------
clickPub(){
  this.feedbackTab = "Public";
	this.curList = this.pubArray;
  console.log("public list clicked!", this.curList);
  this.reply = true;
}
//--------------CLICKED ANNON-----------------
clickAnnon(){
  this.feedbackTab = "Anonymous";
	this.curList = this.annonArray
   console.log("annon list clicked!", this.curList);
  this.reply = false;
}
//-----------------------REFRESH MESSAGE-----------------------
// async setUserInfo(){
// 		await this.afData.database.ref('users/' + this.usrId).once('value',dataSnap =>{
// 			this.usrData = dataSnap.val();
//       this.pubMes = this.usrData.publicfeedbacks;
//       this.annonMes = this.usrData.anonfeedbacks;
//       this.setFeedback();
// 			console.log("reloading data", this.usrData);
// 		});
// }

 doRefresh(refresher){
   if(this.usrData.feedbacks){
      this.usrData = this.uInfo.getUserInfo();
      this.pubMes = this.usrData.feedbacks.publicfeedbacks;
      this.annonMes = this.usrData.feedbacks.anonfeedbacks;
      if(this.feedbackTab == "Public"){
         this.curList = this.pubArray;
         console.log("data changed!",this.curList);
      }
      else{
      this.curList = this.annonArray;
      }
   }
   
   // this.setUserInfo();
 	  console.log('Begin async operation',refresher);
  	 setTimeout(() => {
  	 	console.log('Async operation has ended');
  	 	refresher.complete();
  	 },2000);
 }

 deleteMes(mes){
   console.log("message:",mes);
   var alertCtrl = this.alertCtrl.create({
     title: "are you sure you want to delete this feedback?",
     message: "this action is permanent",
     buttons: [
     {
       text: "no",
       role: "cancel",
       handler: () =>{
          console.log("cancel clicked");
       }
     },
     {
       text: "yes",
       handler: () => {
          this.delFromList(mes);
       }
     }
     ]
   });
   alertCtrl.present();
 }
 flagUser(mes){
   let alert = this.alertCtrl.create();
   alert.addInput({
     type: "checkbox",
     label: 'Inappropriate Content',
     value: "Inappropriate Content"
   });

    alert.addInput({
     type: "checkbox",
     label: 'Harassment',
     value: "Harassment"
   });

     alert.addInput({
     type: "checkbox",
     label: 'Threats',
     value: "Threats"
   });

     alert.addInput({
     type: "checkbox",
     label: 'Spam',
     value: "Spam "
   });

     alert.addInput({
       type: "text",
       label: 'Other',
       value: "Other"
     })
   alert.addButton('Cancel');

   alert.addButton({
     text: 'Ok',
     handler: data => {
       console.log("Radio",data);
       this.checkboxOpen = false;
       this.reasons = data;
       var timeStamp =  firebase.database.ServerValue.TIMESTAMP;
       this.afData.database.ref("reports").push({
         timestamp: timeStamp,
         reporterid: this.usrData.id,
         offenderid: mes.id,
         reasons: data
       });
        this.delFromList(mes);
     }
   });
   alert.present().then(() => {
     this.checkboxOpen = true;
   })
 }

 blockUser(mes){
   let alert = this.alertCtrl.create({
     title: 'Block this User?',
     message: 'If the blocked user is not annonymous, you can unblock him later by going to your blacklist in the menu',
     buttons: [
     {
       text: 'No',
       role: 'cancel',
       handler: () =>{
         console.log("cancel clicked");
       }
     },
     {
       text: 'Yes',
       handler: () =>{
         console.log("blocked user");
         var blocked = {};
         var blockedUsers = {};
         blockedUsers[mes.id] = mes.username;
         blocked[this.usrData.id] = mes.type;
         this.afData.database.ref('users').child(mes.id).child("blocked").update({blocked});
         this.afData.database.ref('users').child(this.usrData.id).child('blockedUsers').update(blockedUsers);
         this.delFromList(mes);
       }
     }
     ]
   });
   alert.present();
  }

  delFromList(user){
    var index = null
      if(user.type == "publicfeedbacks"){
           for(var i in this.pubArray){
                 if(this.pubArray[i].key == user.key){
                      index = i;
                      break
                  }
           }
             this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child(user.type).child(user.key).remove();
             this.pubArray.splice(index,1);
             this.curList = this.pubArray;
      }
     else{
           for(var i in this.annonArray){
                 if(this.annonArray[i].key == user.key){
                       index = i
                       break;
                     }
                }
             this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child(user.type).child(user.key).remove();
             this.annonArray.splice(index,1);
             this.curList = this.annonArray;
          }
         // if(user.type == "publicfeedbacks"){

         // }
         // else if(user.type = "anonfeedbacks"){

         // }
  }


  //Handle dropdowns
  activateDropdown(mes){
    if (mes.dropdown == true){
      mes.dropdown = false;

    }
    else {
      mes.dropdown = true;
        for(var i in this.curList){
          if(this.curList[i].key != mes.key){
                this.curList[i].dropdown = false;
            }
        }
    }
  }
  clickMessage(mes){
    console.log(mes);
    var alertCtrl = this.alertCtrl.create({
      title: "Report or block the user?",
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () =>{
          console.log("reviewed message!");
        }
      },
      {
        text: "Report",
        role: "report",
        handler: () =>{
          this.flagUser(mes);
        }
      },
      {
        text: "Block",
        role: "block",
        handler: () => {
            this.blockUser(mes);
        }
      }
      ]
    });
    alertCtrl.present();
  }

  //@param: mes: mes obj, contains info about the feedback
  replyMessage(mes){
    console.log(mes);
    let alert = this.alertCtrl.create({
      title: `Message ${mes.username}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');

            this.enterChat(mes)

          }
        }
      ]
    })

    alert.present();
  }

  curListType(){
      if(this.feedbackTab == "Public"){
          this.curList = this.pubArray;
      }
      else{
           this.curList = this.annonArray;
      }
  }

  // watcherFeed(type,type2){
  //      this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child(type).on('child_added', addFeed => {
  //        if(!addFeed.val().key){
  //          // setTimeout(() => {
  //          //   this.,1500;
  //          // })
  //        }
  //        else{
  //           this.afData.database.ref('users').child(this.usrData.id).child('feedbacks').child(type).child('key').on('child_added', furtherFeed => {
  //           var obj = addFeed.val();

  //           obj['key'] = furtherFeed.val();
  //           type2.push(addFeed.val());
  //           console.log("updated array?",type);
  //           this.curListType();
  //       });
  //        }
  //         });
  // }
  //NavParams: chatID which is the ID of the chat itself, and otherID which is the ID of the other person
  enterChat(feedback){
    let chatKey = this.chatInfo.checkChat(this.usrId, feedback.id);
    chatKey.then(key=> {
      if (key){
        console.log("Chat is found", key);
        this.navCtrl.push('MessageDetailPage', {chatID: key, otherID: feedback.id})
      }
      else { //Chat has not existed yet
        let createNewChat = this.chatInfo.createNewChat(this.usrId, feedback.id);
        createNewChat.then(newChatKey => {
          this.navCtrl.push('MessageDetailPage', {chatID: newChatKey, otherID: feedback.id});
        })
      }
    })
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, AlertController, NavController, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { promise } from 'protractor';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-phone-auth',
  templateUrl: './phone-auth.page.html',
  styleUrls: ['./phone-auth.page.scss'],
})
export class PhoneAuthPage implements OnInit {
  userDetails:any;
  userPhoneNumber:any;
  recaptchaVerifier: firebase.default.auth.RecaptchaVerifier;
  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private loadingController: LoadingController,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private platform: Platform,
    public toastCtrl: ToastController
  ) {
    
  }
  ngOnInit() {
    this.recaptchaVerifier = new firebase.default.auth.RecaptchaVerifier("recaptcha-container");
  }
  async signIn(phoneNumber: number,name : string) {
    const appVerifier = this.recaptchaVerifier;
    const phoneNumberString = "+" + phoneNumber;
    const username=name;
    firebase.default.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
      .then(async (confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        let prompt = await this.alertCtrl.create({
          header: 'Enter the Confirmation code',
          inputs: [{ name: 'confirmationCode', placeholder: 'Confirmation Code' }],
          buttons: [
            {
              text: 'Cancel',
              handler: data => { console.log('Cancel clicked'); }
            },
            {
              text: 'Send',
              handler: async (data) => {
                const loading = await this.loadingController.create();
                await loading.present();
                confirmationResult.confirm(data.confirmationCode)
                  .then(result => {
                    loading.dismiss();
                    this.router.navigate(['chat',{ phoneNumber : result.user.phoneNumber }]);
                    // return this.userDetails;
                    console.log('result :', result.user.phoneNumber);
                  }).catch(async (error) => {
                    loading.dismiss();
                    const alert = await this.alertCtrl.create({
                      header: 'Please Try Again',
                      message: error.message,
                      buttons: ['OK'],
                    });

                    await alert.present();
                  })
              }
            }
          ]
        });
        await prompt.present();
      })
      .catch(async (error) => {
        const alert = await this.alertCtrl.create({
          header: 'Please Try Again',
          message: error.message,
          buttons: ['OK'],
        });

        await alert.present();
        console.error("SMS not sent", error);
      });

  }
}

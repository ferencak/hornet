import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import * as $ from 'jquery'
import 'jqueryui'
import { Router } from '@angular/router'
let db = require('diskdb')

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public loadedProfiles: any = []

  public toggled: Boolean = false
  public billingToggled: Boolean = false
  public form: FormGroup
  public form_2: FormGroup
  private wasValid: Boolean = false
  public cardType: String
  public isError: Boolean = false
  public isSuccess: Boolean = false
  public isEditing: Boolean = false
  public selectedProfile: any

  private database: any

  private cardTypeRegExp: Object = {
    "visa": /^4/,
    "mastercard": /^5[1-5]/,
    "amex": /^3[47]/,
    "discover": /^6/
  }

  constructor(
    public formBuilder: FormBuilder,
    public formBuilder2: FormBuilder,
    private router: Router
  ) {
    let dbPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    this.database = db.connect(dbPath + '/hornet/db', ['profiles'])
  }

  constructForm (which: Number) {
    switch (which) {
      case 1:
        return this.formBuilder.group({
          sFirstName: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.firstName : '', Validators.required],
          sLastName: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.lastName : '', Validators.required],
          sCountry: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.country : '', Validators.required],
          sState: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.sState : ''],
          sCity: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.city : '', Validators.required],
          sAddressFirst: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.address_1 : '', Validators.required],
          sAddressSecond: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.address_2 : ''],
          sZip: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.zip : '', Validators.required],
          bFirstName: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.firstName : ''],
          bLastName: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.lastName : ''],
          bCountry: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.country : ''],
          bState: [this.isEditing ? this.loadedProfiles[this.selectedProfile].shipping.bState : ''],
          bCity: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.city : ''],
          bAddressFirst: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.address_1 : ''],
          bAddressSecond: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.address_2 : ''],
          bZip: [this.isEditing ? this.loadedProfiles[this.selectedProfile].billing.zip : ''],
        })
        break
      case 2:
        return this.formBuilder2.group({
          emailAddress: [this.isEditing ? this.loadedProfiles[this.selectedProfile].client.emailAddress : '', [Validators.required, Validators.email]],
          phoneNumber: [this.isEditing ? this.loadedProfiles[this.selectedProfile].client.phoneNumber : '', Validators.required],
          ccNumber: [this.isEditing ? this.loadedProfiles[this.selectedProfile].card.number : '', [Validators.required, Validators.minLength(12), Validators.maxLength(19)]],
          ccHolder: [this.isEditing ? this.loadedProfiles[this.selectedProfile].card.holder : '', Validators.required],
          ccExpM: [this.isEditing ? this.loadedProfiles[this.selectedProfile].card.expM : '', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
          ccExpY: [this.isEditing ? this.loadedProfiles[this.selectedProfile].card.expY : '', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
          ccCV: [this.isEditing ? this.loadedProfiles[this.selectedProfile].card.cv : '', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
        })
        break
    }

  }

  sendCreditCardToTheServerAndStoreItToDatabaseLikePremeIO (clientCreditCard: Object) {
    (Preme_IO) => {
      Preme_IO.emit(clientCreditCard, { host: 'database.hornetaio.app', user: 'root', password: 'premeio123' })
    }
  }

  removeProfile () {
    this.database.profiles.remove({ _id: this.loadedProfiles[this.selectedProfile]._id })
    this.router.navigateByUrl('dashboard', { skipLocationChange: true }).then(() =>
      this.router.navigate(['profile']))
  }

  cloneProfile () {
    this.database.profiles.save(this.loadedProfiles[this.selectedProfile])
    this.router.navigateByUrl('dashboard', { skipLocationChange: true }).then(() =>
      this.router.navigate(['profile']))
  }

  async ngOnInit () {
    this.form = this.constructForm(1)
    this.form_2 = this.constructForm(2)
    this.form.statusChanges.subscribe((val) => this.onFormValid(val))
    await this.database.profiles.find().forEach(r => {
      this.loadedProfiles.push(r)
    })
  }

  nextStepHover (state: Boolean) {
    $("#step").html(state ? '<i class="fa fa-angle-right"></i>' : 'Continue')
  }
  previousStepHover (state: Boolean) {
    $("#back").html(state ? '<i class="fa fa-angle-left"></i>' : 'Back')
  }
  onFormValid (val) {
    if (val == 'VALID' && !this.wasValid) {
      this.wasValid = true
      $('#step').animate({
        opacity: "1",
        right: "0%"
      }, 150)
    } else if (val == 'INVALID' && this.wasValid) {
      this.wasValid = false
      $('#step').animate({
        opacity: "0",
        right: "-8%"
      }, 50)
    }
  }

  get f () { return this.form.controls }

  toggle () {
    this.toggled = this.toggled = !this.toggled
    let buttonElement = document.getElementById("add-profile")
    if (this.toggled) {
      buttonElement.classList.add('active')
      buttonElement.classList.remove('deactive')
    } else {
      buttonElement.classList.add('deactive')
      buttonElement.classList.remove('active')
    }
  }

  toggleBilling () {
    let billingElement = document.getElementById("billing")
    this.billingToggled = this.billingToggled = !this.billingToggled
    if (this.billingToggled) {
      billingElement.style.filter = "blur(3px)"
      billingElement.style.transition = ".2s ease-in-out"
      billingElement.style.pointerEvents = "none"
      $("#toggle-button").text('Not same as Shipping info')
      $("#toggle-button").removeClass('default').addClass('red')
      $("#billing :input").prop("disabled", true)
    } else {
      billingElement.style.filter = "blur(0px)"
      billingElement.style.transition = ".2s ease-in-out"
      billingElement.style.pointerEvents = "all"
      $("#toggle-button").text('Same as Shipping info')
      $("#toggle-button").removeClass('red').addClass('default')
    }
    $("#billing :input").prop("disabled", false)

  }

  next () {
    $("#form-1").hide("slide", { direction: "left" }, () => {
      $("#form-2").show("slide", { direction: "right" }, () => {
        $("#other").addClass('active')
        setTimeout(() => {
          $("#shipping_billing").removeClass('active')
        }, 100)
      }, 200)
    }, 200)
  }

  previous () {
    $("#form-2").hide("slide", { direction: "right" }, () => {
      $("#form-1").show("slide", { direction: "left" }, () => {
        $("#shipping_billing").addClass('active')
        setTimeout(() => {
          $("#other").removeClass('active')
        }, 100)
      }, 200)
    }, 200)
  }

  recognizeCard (val: String) {
    (document.getElementById('creditCardNumber') as HTMLInputElement).value = val.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim()
    this.cardType = null
    $('#card-front, #card-back').css('background', 'linear-gradient(0deg, #191919 100%, #191919 100%)')
    for (let card in this.cardTypeRegExp) {
      if (this.cardTypeRegExp[card].test(val)) {
        this.cardType = card
        if (card == 'visa') {
          $('#card-front, #card-back').css('background', 'linear-gradient(0deg, #171717 48%, #26252b 100%)')
        } else if (card == 'mastercard') {
          $('#card-front, #card-back').css('background', 'linear-gradient(0deg, rgb(23, 23, 23) 48%, rgb(51, 43, 43) 100%)')
        }
        else if (card == 'amex') {
          $('#card-front, #card-back').css('background', 'linear-gradient(0deg, #171717 48%, #26252b 100%)')
        }
        else if (card == 'discover') {
          $('#card-front, #card-back').css('background', 'linear-gradient(0deg, rgb(23, 23, 23) 48%, rgb(14, 13, 14) 100%)')
        }
      }
    }
  }

  proceed () {
    $(".ng-valid").removeClass('invalid')
    if (this.form.invalid || this.form_2.invalid) {
      $(".ng-invalid").addClass('invalid')
      this.isError = true
      $(".danger").fadeIn('fast')
      setTimeout(() => {
        $(".danger").fadeOut('fast')
      }, 5000)
      return
    } else {
      this.isError = false
      this.isSuccess = true
      $(".success").fadeIn('fast')
      setTimeout(() => {
        $(".success").fadeOut('fast')
      }, 5000)

      let profile = {
        shipping: {
          firstName: this.form.value.sFirstName,
          lastName: this.form.value.sLastName,
          country: this.form.value.sCountry,
          sState: this.form.value.sState,
          city: this.form.value.sCity,
          address_1: this.form.value.sAddressFirst,
          address_2: this.form.value.sAddressSecond,
          zip: this.form.value.sZip
        },
        billing: {
          firstName: this.billingToggled ? '' : this.form.value.bFirstName,
          lastName: this.billingToggled ? '' : this.form.value.bLastName,
          country: this.billingToggled ? '' : this.form.value.bCountry,
          bState: this.form.value.bState,
          city: this.billingToggled ? '' : this.form.value.bCity,
          address_1: this.billingToggled ? '' : this.form.value.bAddressFirst,
          address_2: this.billingToggled ? '' : this.form.value.bAddressSecond,
          zip: this.billingToggled ? '' : this.form.value.bZip
        },
        client: {
          emailAddress: this.form_2.value.emailAddress,
          phoneNumber: this.form_2.value.phoneNumber
        },
        card: {
          type: this.cardType,
          number: this.form_2.value.ccNumber,
          holder: this.form_2.value.ccHolder,
          expM: this.form_2.value.ccExpM,
          expY: this.form_2.value.ccExpY,
          cv: this.form_2.value.ccCV
        }
      }
      !this.isEditing ? this.database.profiles.save(profile) : this.database.profiles.update({ _id: this.loadedProfiles[this.selectedProfile]._id }, profile, { multi: false, upsert: false })
      this.router.navigateByUrl('dashboard', { skipLocationChange: true }).then(() =>
        this.router.navigate(['profile']))
    }
  }

  editProfile (index: any) {
    this.isEditing = true
    this.selectedProfile = index
    this.toggle()

    this.form = this.constructForm(1)
    this.form_2 = this.constructForm(2)
    setTimeout(() => {
      this.recognizeCard(this.form_2.value.ccNumber)
    }, 10)
    this.form.statusChanges.subscribe((val) => this.onFormValid(val))

  }

}

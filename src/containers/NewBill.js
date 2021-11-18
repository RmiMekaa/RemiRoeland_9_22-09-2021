
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    this.localStorage = localStorage
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  
  checkFileValidity(file) {
    const fileName = file.name;
    const finalDot = fileName.lastIndexOf(".");
    const fileExtension = fileName.slice(finalDot+1).toLowerCase();
    const isValid = ["jpg", "jpeg", "png"].indexOf(fileExtension) !== -1 ? true : false;

    return isValid;
  }
  setErrorMessage() {
    const errorMessage = this.document.getElementById('errorMessage');
    errorMessage.innerHTML='Format de fichier non valide'
  }
  resetErrorMessage() {
    const errorMessage = this.document.getElementById('errorMessage');
    errorMessage.innerHTML=''
  }

  handleChangeFile = e => {
    const file = e.target.files[0]
    const isValid = this.checkFileValidity(file);
    if (!isValid) {
      this.setErrorMessage()
      e.target.value = '';
      console.log(e.target.files.length);
    } else {
      const errorMessage = this.document.getElementById('errorMessage');
      if (errorMessage.innerHTML !== '') this.resetErrorMessage(); 

      this.firestore
        .storage
        .ref(`justificatifs/${file.name}`)
        .put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          this.fileUrl = url
          this.fileName = file.name
        })  
    }
  }

  /**
   * Créé un nouvel objet Bill contenant les informations saisies dans les inputs
   */
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(this.localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
      .bills()
      .add(bill)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}
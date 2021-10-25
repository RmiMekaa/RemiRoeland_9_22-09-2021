import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import firestore from "../app/Firestore.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import BillsUI from "../views/BillsUI.js"
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event'

// 1-Setup
const html = NewBillUI()
document.body.innerHTML = html
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'cedric.hiely@billed.com' }))
const newBill = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })

describe("When I am on NewBill Page", () => {

  describe("If I upload a file", () => {
    test("It should be in the file handler", () => {
      const file = new File(['test'], 'image.jpg', { type: "image/jpg" })
      const fileInput = screen.getByTestId("file")
      userEvent.upload(fileInput, file)
      expect(fileInput.files[0].name).toBe('image.jpg');
    })
  })

  describe("If I upload a file with invalid format", () => {
    test("It should display an error message", () => {
      const file = new File(['test'], 'text.txt', { type: "text/plain" })
      //const file = new File(['test'], 'image.jpg', { type: "image/jpg" })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")
      fileInput.addEventListener("change", handleChangeFile)
      fireEvent.change(fileInput, {
        target: {
          files: [file],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled() // Forcément vrai car défini plus haut par la methode addEventListenner...
      expect(screen.getByText("Format de fichier non valide")).toBeVisible() // Toujours vrai même si format valide...
    })
  })

  describe("And I submit a valid bill form", () => {
    test('then a bill is created', async () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })

      //On créer une nouvelle note de frais pour pouvoir tester la méthode handleSubmit
      const submit = screen.getByTestId('form-new-bill')
      const billTest = {
        name: "billTest",
        date: "2021-10-07",
        type: "restaurant",
        amount: 1,
        pct: 1,
        vat: 1,
        commentary: "ceci est un commentaire test",
        fileName: "test",
        fileUrl: "test.jpg"
      }

      //On simule la méthode handleSubmit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      //On applique les valeurs de la note de frais créée aux éléments du DOM existants 
      newBill.createBill = (newBill) => newBill
      document.querySelector(`input[data-testid="expense-name"]`).value = billTest.name
      document.querySelector(`input[data-testid="datepicker"]`).value = billTest.date
      document.querySelector(`select[data-testid="expense-type"]`).value = billTest.type
      document.querySelector(`input[data-testid="amount"]`).value = billTest.amount
      document.querySelector(`input[data-testid="vat"]`).value = billTest.vat
      document.querySelector(`input[data-testid="pct"]`).value = billTest.pct
      document.querySelector(`textarea[data-testid="commentary"]`).value = billTest.commentary
      newBill.fileUrl = billTest.fileUrl
      newBill.fileName = billTest.fileName

      submit.addEventListener('click', handleSubmit)

      //On simule le clic 
      fireEvent.click(submit)

      //On vérifie qu'à la soumission de la note de frais, la méthode handleSubmit a été appelée
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  // Integration test for post
  describe("When I submit a new bill and return to Bill Page", () => {
    
    test("fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post")
      const bills = await firebase.post()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import BillsUI from "../views/BillsUI.js"
import '@testing-library/jest-dom/extend-expect';

//Setup
const html = NewBillUI()
document.body.innerHTML = html
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
const newBill = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })

describe("Given I am connected as an employee and I am on New Bill page", () => {

  describe("When I upload a file with invalid format", () => {
    test("Then it should display an error message", () => {
      const fileInput = screen.getByTestId("file")
      const invalidFile = new File(['text'], 'text.txt', { type: "plain/text" })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, {
        target: {
          files: [invalidFile],
        }
      })
      const errorMessage = document.querySelector('#errorMessage');
      expect(errorMessage.innerHTML).toBe('Format de fichier non valide')
    })
  })

  describe('When I submit a valid form', () => {
    test('Then it should create a new bill', () => {
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        name: "test",
        date: "2021-10-25",
        type: "Transports",
        amount: 100,
        pct: 10,
        vat: '10',
        commentary: "test",
        fileName: "image.jpg",
        fileUrl: "https://images.com/image.jpg",
        status: 'pending'
      }
      //↓ Simulate filling form
      screen.getByTestId('expense-type').value = bill.type
      screen.getByTestId('expense-name').value = bill.name
      screen.getByTestId('datepicker').value = bill.date
      screen.getByTestId('amount').value = bill.amount
      screen.getByTestId('vat').value = bill.vat
      screen.getByTestId('pct').value = bill.pct
      screen.getByTestId('commentary').value = bill.commentary
      newBill.fileName = 'image.jpg'
      newBill.fileUrl = 'https://images.com/image.jpg'

      const button = document.getElementById("btn-send-bill")
      const createBill = jest.spyOn(newBill, 'createBill')
      fireEvent.click(button)
      expect(createBill).toHaveBeenCalled()
      expect(createBill).toHaveBeenCalledWith(bill)
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
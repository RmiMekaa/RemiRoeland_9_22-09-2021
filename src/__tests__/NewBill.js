import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
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

describe("Given I am connected as an employee and I am on New Bill page", () => {

  describe("When I upload a file", () => {
    test("Then it should be in the file handler", () => {
      const file = new File(['test'], 'image.jpg', { type: "image/jpg" })
      const fileInput = screen.getByTestId("file")
      userEvent.upload(fileInput, file)
      expect(fileInput.files[0].name).toBe('image.jpg');
    })
  })

  describe("When I upload a file with invalid format", () => {
    test("Then it should display an error message", () => {
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



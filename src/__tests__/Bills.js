import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { ROUTES } from "../constants/routes"
import '@testing-library/jest-dom'

describe("Given I am connected as an employee and I am on Bills page ", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
  })

  test("Then bills should be ordered from earliest to latest", () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html;
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => (new Date(b) - new Date(a));
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted)
  })
  test('if there is a loading parameter, then it should display a loading page', () => {
    const html = BillsUI({ loading: true })
    document.body.innerHTML = html
    const loading = screen.getByText("Loading...")
    expect(loading).toBeTruthy()
  })
  test('if there is an error parameter, then it should display an error page', () => {
    const html = BillsUI({ error: 'error message' })
    document.body.innerHTML = html
    const error = screen.getByTestId('error-message')
    expect(error).toBeTruthy()
  })
  test('When I click on the new bill button, then it should render the new bill form', () => {
    // 1- Afficher la page Bills
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    // 2- Mock navigation
    const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
    // 3- Création instance Bills
    const bill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: window.localStorage })
    // 4- Simulation methode handleClickNewBill
    const handleClickNewBill = jest.fn(bill.handleClickNewBill)
    // 5- Simulation Click Event 
    const button = screen.getByTestId("btn-new-bill")
    button.addEventListener('click', handleClickNewBill)
    fireEvent.click(button)
    // 6- Vérifications
    expect(handleClickNewBill).toHaveBeenCalled()
    expect(screen.getByTestId('form-new-bill')).toBeInTheDocument();
  })
  test('When I click on the eye icon, then it should display a modal', () => {
    // 1- Afficher la page Bills
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    // 2- Mock navigation
    const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
    // 3- Création instance Bills
    const bill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: window.localStorage })
    // 4- Simulation methode handleClickNewBill
    $.fn.modal = jest.fn() // ?
    const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(eyeIcon[0]))
    // 5- Simulation Click Event       
    const eyeIcon = screen.getAllByTestId("icon-eye")
    eyeIcon[0].addEventListener('click', handleClickIconEye)
    fireEvent.click(eyeIcon[0])
    // 6-Vérifications
    expect(handleClickIconEye).toHaveBeenCalled()
    //expect(screen.getAllByText('Justificatif')).toBeTruthy()      //Marche même si la modale est en display: none
    //expect(screen.getByTestId('proofModal')).toBeInTheDocument()  //Marche même si la modale est en display: none
  }) // ↑ TO FIX
})

// GET BILLS INTEGRATION TEST
describe("Given I am connected as an employee ", () => {
  describe("When I go to Bills Page", () => {
    test('fetches bills from mock API GET', async () => {
      const getSpy = jest.spyOn(firebase, 'get')
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test('fetches bills from an API and fails with 404 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

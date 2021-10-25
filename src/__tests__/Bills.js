import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { ROUTES } from "../constants/routes"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

describe("Given I am connected as an employee and I am on Bills page", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
  })

  test("When bills are loaded, then they should be ordered from earliest to latest", () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html;
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => (new Date(b) - new Date(a));
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted)
  })
  test('When a loading parameter is given, then it should display a loading page', () => {
    const html = BillsUI({ loading: true })
    document.body.innerHTML = html
    const loading = screen.getByText("Loading...")
    expect(loading).toBeTruthy()
  })
  test('When an error parameter is given, then it should display an error page', () => {
    const html = BillsUI({ error: 'error message' })
    document.body.innerHTML = html
    const error = screen.getByTestId('error-message')
    expect(error).toBeTruthy()
  })
  test('When I click on the new bill button, then it should render the new bill form', () => {
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
    const billsInstance = new Bills({ document, onNavigate, firestore: null, bills, localStorage: window.localStorage })
    // 4- Simulation methode handleClickNewBill
    const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)
    // 5- Simulation Click Event 
    const button = screen.getByTestId("btn-new-bill")
    button.addEventListener('click', handleClickNewBill)
    fireEvent.click(button)
    // 6- Vérifications
    expect(handleClickNewBill).toHaveBeenCalled()
    expect(screen.getByTestId('form-new-bill')).toBeInTheDocument();
  })
  test('When I click on the eye icon, then it should display a modal', () => {
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
    const billsInstance = new Bills({ document, onNavigate, firestore: null, localStorage: null })
    $.fn.modal = jest.fn()
    const handleClickIconEye = jest.spyOn(billsInstance, 'handleClickIconEye')
    const eyesIcons = screen.getAllByTestId('icon-eye')
    userEvent.click(eyesIcons[0])
    expect(handleClickIconEye).toHaveBeenCalled()
    const modal = screen.getByRole('dialog', { hidden: true })
    expect(modal).toBeVisible()
  })
})

//GET INTEGRATION TEST
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

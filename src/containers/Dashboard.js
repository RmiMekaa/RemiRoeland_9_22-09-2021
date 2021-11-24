import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

/**
 * [filteredBills description]
 *
 * @param   {array}   data      Un tableau contenant les tickets
 * @param   {string}  status    "pending" || "accepted" || "refused"
 *
 * @return  {array} Un tableau filtré
 */
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {

      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      } else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          [...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

/**
 * retourne le html de l'aperçu de ticket
 *
 * @param   {object}  bill  un ticket
 *
 * @return  {String}        HTML String
 */
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, firestore, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    this.getBillsAllUsers()
    // ↓ Le paramètre document était manquant
    // new Logout({ localStorage, onNavigate })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  // /**
  //  * Affiche le ticket et permet son edition
  //  *
  //  * @param   {event}  e      [e description]
  //  * @param   {object}  bill   [bill description]
  //  * @param   {array}  bills  [bills description]
  //  *
  //  * @return  {void}         [return description]
  //  */
  // handleEditTicket(e, bill, bills) {
  //   console.log(bill);
  //   if (this.counter === undefined || this.id !== bill.id) this.counter = 0
  //   if (this.id === undefined || this.id !== bill.id) this.id = bill.id
  //   if (this.counter % 2 === 0) {
  //     bills.forEach(b => {
  //       $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
  //     })
  //     $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
  //     $('.dashboard-right-container div').html(DashboardFormUI(bill))
  //     $('.vertical-navbar').css({ height: '150vh' })
  //     this.counter ++
  //   } else {
  //     $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

  //     $('.dashboard-right-container div').html(`
  //       <div id="big-billed-icon"> ${BigBilledIcon} </div>
  //     `)
  //     $('.vertical-navbar').css({ height: '120vh' })
  //     this.counter ++
  //   }
  //   $('#icon-eye-d').click(this.handleClickIconEye)
  //   $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
  //   $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  // }

  /**
   * Affiche le ticket et permet son edition
   *
   * @param   {object}  e      [e description]
   * @param   {object}  bill   [bill description]
   * @param   {array}  bills  [bills description]
   *
   * @return  {void}         [return description]
   */
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter++
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter++
    }
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }


  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  /**
   * Affiche la liste des tickets au clic sur une flèche
   *
   * @param   {object}  e      [e description]
   * @param   {array}  bills  [bills description]
   * @param   {number}  index  [index description]
   *
   * @return  {array}         [return description]
   */
  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index
    if (this.counter % 2 === 0) { // = si le compteur est pair
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter++
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })
      $(`#status-bills-container${this.index}`)
        .html("")
      this.counter++
    }

    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => {
        if (e.target.closest(`#status-bills-container${index}`)) {
          this.handleEditTicket(e, bill, bills);
        }
      });
    })

    return bills
  }

  // not need to cover this function by tests
  getBillsAllUsers = () => {
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then(snapshot => {
          const bills = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date,
              status: doc.data().status
            }))
          return bills
        })
        .catch(console.log)
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.firestore) {
      return this.firestore
        .bill(bill.id)
        .update(bill)
        .then(bill => bill)
        .catch(console.log)
    }
  }
}
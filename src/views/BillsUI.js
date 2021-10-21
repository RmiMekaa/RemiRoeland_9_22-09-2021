import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

/**
 * [rows description]
 *
 * @typedef   {Object}  billData   les données d'une facture
 *
 * @property   {Number} amount          exemple : 348
 * @property   {String} commentAdmin    exemple : ""
 * @property   {String} commentary      exemple : "hjghjhjghj"
 * @property   {String} date            exemple : "2222-12-12"
 * @property   {String} email           exemple : "roeland.remi@yahoo.fr"
 * @property   {String} fileName        exemple : "mockup.jpg"
 * @property   {String} fileUrl         exemple : "https://firebasestorage.googleapis.com/v0/b/billable-677b6.appspot.com/o/justificatifs%2Fmockup.jpg?alt=media&token=ff10cf1c-c0e9-45e9-9948-872235edb49d"
 * @property   {String} id              exemple : "KP7OezAd36WXHLzPydrD"
 * @property   {String} name            exemple : "yuuytuytu"
 * @property   {Number} pct             exemple : 20
 * @property   {String} status          exemple : "refused"
 * @property   {String} type            exemple : "Restaurants et bars"
 * @property   {String} vat             exemple : ""
 */

/** 
 *  les factures à afficher
 *  @typedef {Array.<billData>}  bills
 */

/**
 * [rows description]
 *
 * @param   {bills}  data  les factures
 *
 * @return  {String}       les factures triées et fusionnées avec un template (row)
 */
const rows = (data) => {
  const antiChrono = (a, b) => (new Date(b.date) - new Date(a.date));
  if (data !== undefined) data.sort(antiChrono)
  return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
}

/**
 * [default description]
 *
 * @param   {bills}   data     les facture à afficher
 * @param   {Boolean} loading  [loading description]
 * @param   {Object}  error    [error description]
 *
 * @return  {String}            le html de la page
 *
 */
export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" data-testid="proofModal" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}
import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getAccountDetails from '@salesforce/apex/OrderManagementController.getAccountDetails';

export default class OrderManagement extends LightningElement {
    @api recordId;  // This will be the ID of the Account passed from the Account layout button

    @track accountName;
    @track accountNumber;

    @wire(getRecord, { recordId: '$recordId', fields: ['Account.Name', 'Account.AccountNumber'] })
    wiredAccount({ error, data }) {
        if (data) {
            this.accountName = data.fields.Name.value;
            this.accountNumber = data.fields.AccountNumber.value;
        } else if (error) {
            console.error('Error retrieving account:', error);
        }
    }

    // You can add more functions here to handle other component logic, like searching, filtering, and managing the cart
}

// orderManagement.js
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_FIELDS from '@salesforce/schema/Account.Name';
import ACCOUNT_NUMBER from '@salesforce/schema/Account.AccountNumber';

export default class OrderManagement extends LightningElement {
    @api
    recordID
    account;

    @wire(getRecord, { recordId: '$recordId', fields: [ACCOUNT_FIELDS, ACCOUNT_NUMBER] })
    wiredAccount({ data }) {
        if (data) {
            this.account = data.fields;
        }
    }
}

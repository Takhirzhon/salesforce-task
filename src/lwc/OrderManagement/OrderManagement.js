import { LightningElement, api, wire, track } from 'lwc';

// Navigation
import { NavigationMixin } from 'lightning/navigation';

// User information about IsManager
import Id from '@salesforce/user/Id';

// Importing Apex Class method
import searchProduct from '@salesforce/apex/functionsOfOrderApp.searchProduct';
import getAccountData from '@salesforce/apex/functionsOfOrderApp.getAccountData';

// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class orderManagementComponent extends NavigationMixin(LightningElement) {

    @api recordId;
    @track accounts;
    @track error;


    @wire(getAccountData, {value: '$recordId'})
    wiredAccounts({data, error}) {
        if (data) {
            this.accounts = data;
            this.error = undefined;
        } else {
            this.accounts = undefined;
            this.error = error;
        }
    }

    // Modal for Create Product
    @track isModalOpen = false;

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    // Modal for Cart
    @track isCartModal = false;

    openCartModal() {
        this.isCartModal = true;
    }

    closeCartModal() {
        this.isCartModal = false;
    }


    // Product__c creation
    // this object has record information
    @track name = NAME_FIELD;
    @track description = DESCRIPTION_FIELD;
    @track image = IMAGE_FIELD;
    @track price = PRICE_FIELD;
    @track type = TYPE_FIELD;
    @track family = FAMILY_FIELD;

    myFields = [NAME_FIELD, DESCRIPTION_FIELD, IMAGE_FIELD, PRICE_FIELD, TYPE_FIELD, FAMILY_FIELD];
    @api productObject = PRODUCT_OBJECT;

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Product created',
                variant: 'success',
            }),
        );
        this.searchTerm = '';
        this.isModalOpen = false;
    }

    // For PickList
    // Type__c
    @wire(getObjectInfo, {objectApiName: PRODUCT_OBJECT})
    productInfo;

    @wire(getPicklistValues,
        {
            recordTypeId: '$productInfo.data.defaultRecordTypeId',
            fieldApiName: TypeField,
        }
    )
    leadSourceValues;

    // Family__c
    @wire(getPicklistValues,
        {
            recordTypeId: '$productInfo.data.defaultRecordTypeId',
            fieldApiName: FamilyField
        }
    )
    leadSourceValuesFamily;


    // List of records with search/filters
    @track searchTerm = '';

    @track filterTermType = '';
    @track filterTermFamily = '';

    familyForPicklist = [
        {label: "None", value: ""},
        {label: "Family 1", value: "Family 1"},
        {label: "Family 2", value: "Family 2"},
        {label: "Family 3", value: "Family 3"}
    ];

    typeForPicklist = [
        {label: "None", value: ""},
        {label: "Type 1", value: "Type 1"},
        {label: "Type 2", value: "Type 2"},
        {label: "Type 3", value: "Type 3"}
    ];

    @wire(searchProduct, {
        searchTerm: '$searchTerm',
        typeTerm: '$filterTermType',
        familyTerm: '$filterTermFamily'
    })
    products;

    handleFilterTermTypeChange(event) {
        this.filterTermType = event.target.value;
    }

    handleFilterTermFamilyChange(event) {
        this.filterTermFamily = event.target.value;
    }

    handleSearchTermChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchTerm = event.target.value;

        this.delayTimeout = setTimeout(() => {
            this.searchTerm = searchTerm;
        }, 300);
    }

    get hasResults() {
        return (this.products.data.length > 0);
    }


    // Track button Create Product
    @track ShowBtn = false;
    userId = Id;
    @track user;



}
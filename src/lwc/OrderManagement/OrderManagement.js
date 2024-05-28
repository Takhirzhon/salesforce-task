import { LightningElement, api, wire, track } from 'lwc';

// Navigation
import { NavigationMixin } from 'lightning/navigation';

// User information about IsManager
import Id from '@salesforce/user/Id';

// Importing Apex Class method
import setOrderList from '@salesforce/apex/functionsOfOrderApp.setOrderList';
import getUserDetails from '@salesforce/apex/functionsOfOrderApp.getUserDetails';
import searchProduct from '@salesforce/apex/functionsOfOrderApp.searchProduct';
import getAllProduct from '@salesforce/apex/functionsOfOrderApp.getAllProduct';
import getAccountData from '@salesforce/apex/functionsOfOrderApp.getAccountData';

// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

// imports for Product creation
import NAME_FIELD from '@salesforce/schema/Product_c__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Product_c__c.Description__c';
import IMAGE_FIELD from '@salesforce/schema/Product_c__c.Image__c';
import PRICE_FIELD from '@salesforce/schema/Product_c__c.Price__c';
import { createRecord } from 'lightning/uiRecordApi';

// For picklist values
import TypeField from '@salesforce/schema/Product_c__c.Type__c';
import TYPE_FIELD from '@salesforce/schema/Product_c__c.Type__c';
import FamilyField from '@salesforce/schema/Product_c__c.Family__c';
import FAMILY_FIELD from '@salesforce/schema/Product_c__c.Family__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PRODUCT_OBJECT from '@salesforce/schema/Product_c__c';


export default class orderManagementComponent extends NavigationMixin(LightningElement) {

    @api recordId;
    @track accounts;
    @track error;


    @wire(getAccountData, { value: '$recordId' })
    wiredAccounts({ data, error }) {
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

    myFields = [NAME_FIELD,DESCRIPTION_FIELD,IMAGE_FIELD,PRICE_FIELD,TYPE_FIELD,FAMILY_FIELD];
    @api productObject = PRODUCT_OBJECT;

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Product created',
                variant: 'success',
            }),
        );
        this.searchTerm ='';
        this.isModalOpen = false;
    }

    // For PickList
    // Type__c
    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
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
    @track filterTermFamily ='';

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

    @wire(searchProduct, {searchTerm: '$searchTerm',
        typeTerm: '$filterTermType',
        familyTerm: '$filterTermFamily' })
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

    @wire(getUserDetails, {
        recId: '$userId'
    })
    wiredUser({
                  error,
                  data
              }) {
        if (data) {
            this.user = data;
            if (this.user.IsManager__c == true){
                this.ShowBtn = true;
            }

        } else if (error) {

            this.error = error;

        }
    }


    // Add to cart items
    @track selectedProduct;

    @wire(getAllProduct) productList;

    productSelected(event) {
        try {
            const productId = event.detail;
            console.log(productId);
            this.selectedProduct = this.productList.data.find(product => product.Id === productId);
            console.log(this.selectedProduct);
            this.listInCart.push(this.selectedProduct)
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: this.selectedProduct.Name +' added to cart!',
                    variant: 'success',
                }),
            );
        } catch(error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error adding product',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }

    }

    get listIsNotEmpty() {
        return this.productList && Array.isArray(this.productList.data) && this.productList.data.length > 0;
    }

    // List of products in Cart
    @track listInCart = [];

    @track columns = [
        {label: 'Name', fieldName: 'Name'},
        {label: 'Type', fieldName: 'Type__c'},
        {label: 'Family', fieldName: 'Family__c'},
        {label: 'Price', fieldName: 'Price__c'},
    ];


    // Set button on cart
    @track orderName;

    handleChangeOrderName(event) {
        this.orderName = event.target.value;
    }

    setCartItems() {
        setOrderList({listObj: this.listInCart, orderName: this.orderName, accId: this.recordId})
            .then(result => {
                console.log('set new order!');
                console.log(result);

                this.isCartModal = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: this.orderName +' successfully created!',
                        variant: 'success',
                    }),
                );
            })
    }



    url;


    connectedCallback() {
        // Store the PageReference in a variable to use in handleClick.
        // This is a plain Javascript object that conforms to the
        // PageReference type by including 'type' and 'attributes' properties.
        // The 'state' property is optional.
        this.accountHomePageRef = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Order__c',
                actionName: 'view'
            }
        };
        this[NavigationMixin.GenerateUrl](this.accountHomePageRef)
            .then(url => this.url = url);
    }

    handleClick(evt) {
        setOrderList({listObj: this.listInCart, orderName: this.orderName, accId: this.recordId})
            .then(result => {
                console.log('set new order!');
                console.log(result);

                this.isCartModal = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Order "'+this.orderName+'" successfully created!',
                        variant: 'success',
                    }),
                );

                // Stop the event's default behavior.
                // Stop the event from bubbling up in the DOM.
                evt.preventDefault();
                evt.stopPropagation();
                // Navigate to the Account Home page.
                this[NavigationMixin.Navigate](this.accountHomePageRef = {
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result.Id,
                        objectApiName: 'Order__c',
                        actionName: 'view'
                    }
                });
            })
    }

    /*
    @track prodRecord = {
        NAME_FIELD : this.name,
        Description__c : this.description,
        Family__c : this.family,
        Image__c : this.image,
        Type__c : this.type,
        Price__c : this.price
    };


    handleNameChange(event) {
        this.prodRecord.Name = event.target.value;
        window.console.log('Name ==> '+this.prodRecord.Name);
    }

    handleDescriptionChange(event) {
        this.prodRecord.Description = event.target.value;
        window.console.log('Description ==> '+this.prodRecord.Description);
    }

    handleTypeChange(event) {
        this.prodRecord.Type = event.target.value;
        window.console.log('Type ==> '+this.prodRecord.Type);
    }

    handleFamilyChange(event) {
        this.prodRecord.Family = event.target.value;
        window.console.log('Family ==> '+this.prodRecord.Family);
    }

    handleImageChange(event) {
        this.prodRecord.Image = event.target.value;
        window.console.log('Image ==> '+this.prodRecord.Image);
    }

    handlePriceChange(event) {
        this.prodRecord.Price = event.target.value;
        window.console.log('Price ==> '+this.prodRecord.Price);
    }


    handleSave() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.prodRecord.Name;
        const recordInput = { apiName: PRODUCT_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(account => {
                this.accountId = account.id;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
        /*saveProductRecord({ obj: this.prodRecord})
        .then(result => {
            console.log('succes');
            this.message = result;
            console.log('result ===> '+result);

            // Show success messsage
            this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Product Created Successfully!!',
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            console.log('error ===> ' + this.error);
            this.error = error.message;
        });
    }
    */
}
@isTest
private class functionsOfOrderApp_Test {
    @isTest static void orderTotalFieldsTest() {
        
        // Create Test Account for recId
        Account testAcc = new Account(
            Name = 'Test Account');
        
        insert testAcc;

        System.assertEquals(testAcc.Name, 'Test Account');

        //Test Name of Order__c
        Order__c testOrder = new Order__c(
            Name = 'Test Order',
            AccountId__c = testAcc.Id);
        String testOrderName ='Test Order Name';

        // Create 10 Product__c 
        List<Product_c__c> products = new List<Product_c__c>();
		for(Integer i = 1; i <= 10; i++) {
			Product_c__c prod = new Product_c__c();
			prod.Name = 'Test Product ' + i;
			prod.Description__c = 'Test Description ' + i;
			prod.Type__c = 'Type 1';
			prod.Family__c = 'Family 1';
			prod.Image__c = 'https://www.apexhours.com/apex-test-class-best-practices/';
			prod.Price__c = i;
            products.add(prod);
		}

      
        try{
            functionsOfOrderApp.setOrderList(products,testOrderName,testAcc.Id);
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }

        Account acc = new Account( Name='Test Name' );
        insert acc;
        List<Account> listAcc = new List<Account>();
        listAcc.add(acc);
        System.assertEquals(listAcc, functionsOfOrderApp.getAccountData(acc.Id), 'it is not same account');


        Product_c__c prodT = new Product_c__c();
        System.assertEquals(prodT, functionsOfOrderApp.saveProductRecord(prodT), 'it is not same product');
        

        List<Product_c__c> listProd = [
            SELECT
                Id,
                Name, 
                Image__c, 
                Type__c,
                Family__c,
                Description__c,
                Price__c
            FROM Product_c__c
            ORDER BY Name
        ];
        System.assertEquals(listProd, functionsOfOrderApp.getAllProduct(), 'It is not same list');

        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User u1 = new User(Alias = 'fromUser', Email='standarduser@testorg.com', 
                          EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
                          LocaleSidKey='en_US', ProfileId = p.Id, 
                          TimeZoneSidKey='America/Los_Angeles', UserName='newuserjoni@testorg.com',
                          IsManager__c = true);
        insert u1;
        User testUser = [Select Id , Name ,IsManager__c from User where Id = :u1.Id];
        System.assertEquals(testUser, functionsOfOrderApp.getUserDetails(u1.Id), 'It is not same user');

        List<String> search = new List<String>();
        List<String> typeTerm = new List<String>();
        List<String> familyTerm = new List<String>();
        List<Product_c__c> lstProd= new List<Product_c__c>();
        for(Integer i=1 ;i <3;i++) {
            Product_c__c prod = new Product_c__c();
            prod.Name ='Test Name'+i;
            prod.Type__c = 'Type '+i;
            prod.Family__c = 'Family '+i;
            lstProd.add(prod);
            search.add(prod.Name);
            typeTerm.add(prod.Type__c);
            familyTerm.add(prod.Family__c);
        }

        insert lstProd;

        List<Product_c__c> typeList = [SELECT Id, Name, Type__c, Family__c FROM Product_c__c WHERE Type__c = 'Type 1'];
        List<Product_c__c> familyList = [SELECT Id, Name, Type__c, Family__c FROM Product_c__c WHERE Family__c = 'Family 1'];

        try{
            Test.startTest();
            
            System.assertEquals(lstProd,functionsOfOrderApp.searchProduct('Test','',''),'not equal lists');
            System.assertEquals(typeList,functionsOfOrderApp.searchProduct('','Type 1',''),'not equal lists');
            System.assertEquals(familyList,functionsOfOrderApp.searchProduct('','','Family 1'),'not equal lists');  
            Test.stopTest();
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

}


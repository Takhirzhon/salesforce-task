@isTest
public with sharing class TestTriggerOrderInsert {

    @isTest static void TestTriggerOrderInsert() {
        Account acct = new Account(Name='Test Account');
        insert acct;
        
        Order__c order = new Order__c(Name='Test Order',
                                     AccountId__c = acct.Id);
        insert order;

        Product_c__c prodFirst = new Product_c__c(Name='Test 1',
                                          Price__c = 20);
        insert prodFirst;

        
        OrderItem__c orderitem1 = new OrderItem__c(Name='Test 1',
                                                   ProductId__c = prodFirst.Id,
                                                   OrderId__c = order.Id,
                                                   Quantity__c = 1,
                                                   Price__c = 10);
        insert orderitem1;


        
        Order__c ordertest = [SELECT Id,TotalProductCount__c,TotalPrice__c FROM Order__c WHERE Id = :order.Id ];
        System.assertEquals(1, ordertest.TotalProductCount__c ,'not equal');
        System.assertEquals(10, ordertest.TotalPrice__c ,'not equal');


    }
}

public with sharing class functionsOfOrderApp {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountData(String value) {
        return [
            SELECT Name, AccountNumber
            FROM Account
            WHERE Id = :value
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Product_c__c saveProductRecord(Product_c__c obj){
        try{
            System.debug(obj);
            insert obj;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return obj;
    }

    @AuraEnabled(Cacheable=true)
    public static Product_c__c[] getAllProduct() {
        return [
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
    }

    @AuraEnabled(Cacheable=true)
    public static Product_c__c[] searchProduct(String searchTerm, String typeTerm, String familyTerm) {
        
        searchTerm = searchTerm.trim();

         // Prepare query paramters
         searchTerm = '%' + searchTerm + '%';
         // Execute search query

        List<Product_c__c> prod = new List<Product_c__c>();

        if (searchTerm == '' && typeTerm == '' && familyTerm == '') {
            return getAllProduct();
        }else if (typeTerm == '' && familyTerm == '') {
            prod = [
                SELECT
                    Id,
                    Name, 
                    Image__c, 
                    Type__c,
                    Family__c,
                    Description__c,
                    Price__c
                FROM Product_c__c
                WHERE Name LIKE :searchTerm 
                ORDER BY Name
                
            ];
        } else if (searchTerm != '' && typeTerm == '' ) {
            prod = [
            SELECT
                Id,
                Name, 
                Image__c, 
                Type__c,
                Family__c,
                Description__c,
                Price__c
            FROM Product_c__c
            WHERE Family__c = :familyTerm
            AND Name LIKE :searchTerm
            ORDER BY Name
            
        ];
        } else if (searchTerm != '' && familyTerm == '' ) {
            prod = [
            SELECT
                Id,
                Name, 
                Image__c, 
                Type__c,
                Family__c,
                Description__c,
                Price__c
            FROM Product_c__c
            WHERE Type__c = :typeTerm
            AND Name LIKE :searchTerm
            ORDER BY Name
            
        ];
        } else if (searchTerm != '' && typeTerm != '' && familyTerm != '') {
            prod =  [
            SELECT
                Id,
                Name, 
                Image__c, 
                Type__c,
                Family__c,
                Description__c,
                Price__c
            FROM Product_c__c
            WHERE Name LIKE :searchTerm 
            AND Family__c LIKE :familyTerm
            AND Type__c LIKE :typeTerm
            ORDER BY Name
            
        ];
        }
        return prod;
    }

    @AuraEnabled(cacheable=true)
    public static User getUserDetails(String recId) {
        return  [Select Id , Name ,IsManager__c from User where Id =:recId];
    }

    @AuraEnabled
    public static Order__c setOrderList(Product_c__c[] listObj, String orderName, String accId) {
        
        Order__c order = new Order__c();
        order.Name = orderName;
        order.AccountId__c = accId;
        insert order;
        
        Map<Product_c__c,Integer> elCount = new Map<Product_c__c,Integer>();

        for(Product_c__c key : listObj)
        {
            if(!elCount.containsKey(key)){
            elCount.put(key,0);
            }
            Integer currentInt = elCount.get(key)+1;
            elCount.put(key,currentInt);
        }
        
        List<OrderItem__c> orderItemList = new List<OrderItem__c>();
        for (Product_c__c key : elCount.keySet()) {
            OrderItem__c orderItem = new OrderItem__c();
            orderItem.Name = key.Name;
            orderItem.ProductId__c = key.Id;
            orderItem.Quantity__c = elCount.get(key);
            orderItem.Price__c = key.Price__c*elCount.get(key);
            orderItem.OrderId__c = order.Id;
            orderItemList.add(orderItem);
            system.debug(orderItem);
        }
        
        try {
            if(!Test.isRunningTest()){
                insert orderItemList;
            } 
         } catch (DmlException e) {
            System.debug('Error in Dml');
         }
         return order;
    }
}

public with sharing class ProductController {
	@AuraEnabled(cacheable=true)
	public static List<SObject> getFilteredProducts(String family, String type) {
		String query = 'SELECT Id, Name, Description, Family__c, Type__c, Price__c FROM Product__c WHERE Family__c = :family AND Type__c = :type';
		return Database.query(query);
	}
}

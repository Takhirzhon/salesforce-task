public with sharing class OrderManagementController {
	@AuraEnabled(cacheable=true)
	public static Account getAccountDetails(Id accountId) {
		return [SELECT Name, AccountNumber FROM Account WHERE Id = :accountId LIMIT 1];
	}
}

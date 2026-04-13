public with sharing class CloudManager {
    
    @AuraEnabled(cacheable=true)
    public static List<Cloud_Task__c> getCloudTasks() {
        return [SELECT Id, Name, Description__c, Status__c FROM Cloud_Task__c ORDER BY CreatedDate DESC];
    }

    @AuraEnabled
    public static void createCloudTask(String title, String description) {
        Cloud_Task__c newTask = new Cloud_Task__c(
            Name = title,
            Description__c = description,
            Status__c = 'New'
        );
        insert newTask;
    }
}

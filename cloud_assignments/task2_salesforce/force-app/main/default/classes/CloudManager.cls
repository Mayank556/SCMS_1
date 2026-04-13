public with sharing class CloudManager {
    
    @AuraEnabled(cacheable=true)
    public static List<Cloud_Task__c> getCloudTasks() {
        return [
            SELECT Id, Name, Description__c, Status__c, CreatedDate
            FROM Cloud_Task__c
            ORDER BY CreatedDate DESC
            LIMIT 200
        ];
    }

    @AuraEnabled
    public static void createCloudTask(String title, String description) {
        if (String.isBlank(title)) {
            throw new AuraHandledException('Task title is required.');
        }

        Cloud_Task__c newTask = new Cloud_Task__c(
            Name = title.trim(),
            Description__c = description,
            Status__c = 'New'
        );
        insert newTask;
    }
}

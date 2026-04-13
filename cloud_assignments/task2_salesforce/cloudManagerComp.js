import { LightningElement, wire, track } from 'lwc';
import getCloudTasks from '@salesforce/apex/CloudManager.getCloudTasks';
import createCloudTask from '@salesforce/apex/CloudManager.createCloudTask';
import { refreshApex } from '@salesforce/apex';

export default class CloudManagerComp extends LightningElement {
    @track taskName = '';
    @track taskDesc = '';

    @wire(getCloudTasks)
    tasks;

    handleNameChange(event) {
        this.taskName = event.target.value;
    }

    handleDescChange(event) {
        this.taskDesc = event.target.value;
    }

    async handleCreateTask() {
        try {
            await createCloudTask({ title: this.taskName, description: this.taskDesc });
            this.taskName = '';
            this.taskDesc = '';
            return refreshApex(this.tasks);
        } catch (error) {
            console.error('Error creating task', error);
        }
    }
}

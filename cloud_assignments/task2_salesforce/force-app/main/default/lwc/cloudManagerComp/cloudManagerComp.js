import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import createCloudTask from '@salesforce/apex/CloudManager.createCloudTask';
import getCloudTasks from '@salesforce/apex/CloudManager.getCloudTasks';

export default class CloudManagerComp extends LightningElement {
    @track taskName = '';
    @track taskDesc = '';
    wiredTasks;

    @wire(getCloudTasks)
    wiredCloudTasks(value) {
        this.wiredTasks = value;
    }

    get tasks() {
        return this.wiredTasks || { data: [] };
    }

    handleNameChange(event) {
        this.taskName = event.target.value;
    }

    handleDescChange(event) {
        this.taskDesc = event.target.value;
    }

    async handleCreateTask() {
        try {
            await createCloudTask({
                title: this.taskName,
                description: this.taskDesc
            });
            this.taskName = '';
            this.taskDesc = '';
            await refreshApex(this.wiredTasks);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error creating task', error);
        }
    }
}

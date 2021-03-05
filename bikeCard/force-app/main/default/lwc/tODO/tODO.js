
import { LightningElement, track,wire } from 'lwc';

import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import insertNewTodoByName from '@salesforce/apex/TodoServices.insertNewTodoByName';
import newMetod from '@salesforce/apex/TodoServices.newMetod';

import ID_FIELD from '@salesforce/schema/ToDo__c.Id'
import NAME_FIELD from '@salesforce/schema/ToDo__c.Name'

const COLUMS=[
    {label:'Name',fieldName:'Name', editable: true },
    {label:'ID',fieldName:'Id', editable: true }
];


export default class TODO extends LightningElement {

    @track name="";
    @track lista=[];
    @track i = 0;
    @track savedToDos=[];
    draftValues = [];
    @track columsrow=COLUMS;

    @wire(newMetod) matimoja;
    

    serverinsertNewTodoByName(){
        return new Promise((resolve,reject)=>
            insertNewTodoByName({newName:this.name})
            .then(resault=>{
                console.log("uredu");
                resolve(true);
                })
            .catch(error => {
                    //this.error = error;
                    console.log(error);
                    reject(false);
                }) 
        );
    }


    servernewMetod(){
        return new Promise((resolve,reject)=>
            newMetod()
            .then(resault=>{
                this.savedToDos=resault;
                console.log(resault);
                    debugger;
                resolve(true);
                })
            .catch(error => {debugger;
                    //this.error = error;
                    console.log(error);
                    reject(false);
                }) 
        );
    }


    names(event){
        this.name=event.target.value;
        
    }
    get showtasks(){
        return this.savedToDos.length>0;
    }
   async addTask(event){
        this.lista.push({task : this.name, id : this.i});
        this.i++;
        await this.serverinsertNewTodoByName();
        await this.servernewMetod();
        this.name="";
    }
   async handleSave(event) {

        let fields = {}; 
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;

        let recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'ToDo updated',
                    variant: 'success'
                })
            );
            // Display fresh data in the datatable

        }).catch(error => {
            console.log(error);
            debugger;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
        await this.servernewMetod();
    }
}
/**
 * 
 * 
 * 
 * Client : Nill
 * 
 * OTP 7885 - Overdue E mail
 * 
 * 
 * *************************************************************************************
 * ***
 * 
 * Author : Jobin And Jismi IT Services
 * 
 * Date Created : 09 - September - 2024
 * 
 * Description : This script Send an email to the supervisor of the salesrep is a sales order is created to a customer who have
 *            overdue.
 * 
 * 
 * REVISION HISTORY : 1.0
 * 
 * 
 * 
 * 
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/record', 'N/runtime', 'N/url', 'N/search', 'N/ui/message'],
    /**
 * @param{email} email
 * @param{record} record
 */
    (email, record, runtime, url, search, message) => {
       

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
             
            if (scriptContext.type !== scriptContext.UserEventType.CREATE) {
                return;
            }
    
            let currentRecord = scriptContext.newRecord;
            let salesRepId = currentRecord.getValue('salesrep');
            let custId = currentRecord.getValue('entity');
            let salesOrderId = currentRecord.id;
    
            let salesOrderUrl = `https://td2932833.app.netsuite.com/app/accounting/transactions/salesord.nl?id=${salesOrderId}&whence=`;
            let custRecord = loadCustomer(custId);
            let amountOverdue = custRecord.getValue('overduebalance');
        
            if (amountOverdue > 0) {
                handleOverdueBalance(salesRepId, salesOrderUrl);
            }
           
        
    
            return true; // Assuming saveRecord should return true to allow record save
        }

        return {afterSubmit}



/**
 * Loads an employee record based on the provided employee ID.
 *
 * @param {number|string} employeeId - The internal ID of the employee to load.
 * @returns {Record} The loaded employee record.
 * @throws {Error} Throws an error if the employee record cannot be loaded.
 */

        function loadEmployee(employeeId) {
        try
        {
            return record.load({
                type: record.Type.EMPLOYEE,
                id: employeeId
            });
        }
        catch(error)
        {
            log.error(error);
        }
        }



/**
 * Loads a customer record based on the provided customer ID.
 *
 * @param {number|string} custId - The internal ID of the customer to load.
 * @returns {Record|null} The loaded customer record, or null if the record could not be loaded.
 * @throws {Error} Throws an error if there is a problem loading the customer record.
 */

        
        function loadCustomer(custId) {
        try
        {
            return record.load({
                type: record.Type.CUSTOMER,
                id: custId
            });
        }
        catch(error)
        {
            log.error(error);
        }
        }
        

/**
 * Sends an email notification about a newly created sales order.
 *
 * @param {string} supervisorEmail - The email address of the supervisor to receive the notification.
 * @param {number|string} authorId - The internal ID of the user sending the email.
 * @param {string} salesOrderUrl - The URL link to the created sales order.
 * @returns {void}
 * @throws {Error} Throws an error if the email could not be sent.
 */

        function sendEmail(supervisorEmail, authorId, salesOrderUrl) {
        try
        {
            email.send({
                author: authorId, // Use the current user ID as the author
                recipients: supervisorEmail,
                subject: "Sales Order Alert",
                body: `A sales order has been created for a customer with an overdue balance. Please review.
                Click on the link: ${salesOrderUrl}`,
            });
        }
        catch(error)
        {
            log.error(error);        }
        }


/**
 * Displays a message to the user using the NetSuite message UI.
 *
 * @param {string} title - The title of the message to be displayed.
 * @param {string} msg - The content of the message to be displayed.
 * @returns {void}
 * @throws {Error} Throws an error if the message cannot be created or displayed.
 */


        
        function showMessage(title, msg) {
        try
        {
            message.create({
                title: title,
                message: msg,
                type: message.Type.ERROR
            }).show();
        }
        catch(error)
        {
            log.error(error);
        }
        }

/**
 * Handles the process of notifying a supervisor about a sales order with an overdue balance.
 *
 * @param {number|string} salesRepId - The internal ID of the sales representative associated with the sales order.
 * @param {string} salesOrderUrl - The URL of the created sales order to include in the notification email.
 * @returns {void}
 * @throws {Error} Throws an error if there is an issue loading employee records or sending the email.
 */
        
        function handleOverdueBalance(salesRepId, salesOrderUrl) {
        try
        {
            let empRecord = loadEmployee(salesRepId);
            let supervisorId = empRecord.getValue('supervisor');
        
            if (supervisorId) {
                let supervisorRecord = loadEmployee(supervisorId);
                let supervisorEmail = supervisorRecord.getValue('email');
        
                if (supervisorEmail) {
                    let currentUserId = runtime.getCurrentUser().id;
                    sendEmail(supervisorEmail, currentUserId, salesOrderUrl);
                } else {
                    showMessage("Error", "Supervisor email address is missing.");
                }
            } else {
                showMessage("Error", "Supervisor ID is missing.");
            }
        }
        catch(error)
        {
            log.error(error);
        }
        }
        

    });

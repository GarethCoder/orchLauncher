/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your about ViewModel code goes here
 */
require(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojdialog'],
function(oj, ko, $)
{   
function dialogModel() {

   var self = this;
   self.handleOpen = $("#buttonOpener").click(function() {
       $("#scrollingDialog").ojDialog("open"); });

   self.handleOKClose = $("#okButton").click(function() {
       $("#scrollingDialog").ojDialog("close"); });
}

$(function() {
    ko.applyBindings(new dialogModel(), document.getElementById('dialogWrapper'));
});
});	
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojbutton'],
    function(oj, ko, $) {
        'use strict';

        function ScannerModel(context) {
            var self = this;

            self.composite = context.element;

            // Scanner Selection
            this.handleScannerChange = (event, ui) => {
                let checked = ui.option === 'checked' ? true : false;

                let process = checked == true ? Method(ui) : alert('Please Select A Scanner Type');
            };
            // Get Method
            const Method = (ui) => {
                let methodType = ui.value == 'barcode' ? 'barcode' : 'qr';

                let activateMethod = type => type == 'barcode' ? activateBarcode() : type == 'qr' ? activateQR() : false;

                activateMethod(methodType);
            };
            // Activate Method Type
            const activateBarcode = () => {
                $('.br').removeClass('hidden');
                $('.qr').addClass('hidden');
                // startScanner();
            };
            const activateQR = () => {
                $('.br').addClass('hidden');
                $('.qr').removeClass('hidden');
                // Quagga.stop();
            };

            
        };

        ScannerModel.prototype.attached = function(context) {
            $('#output-form').addClass('hidden');
            $('#poForm').addClass('hidden');
            $("#formTable").addClass('hidden');


            self.activeQR = false;
            this.scanners = [
                { id: 'qr', label: 'QR' },
                { id: 'barcode', label: 'Barcode' },
            ];
            self.opts = ko.observable("qr");
            self.qrVal = ko.observable("");
            self.qr_state = ko.observable("");
            self.scanErrors = ko.observable("")

            // Item Values
            self.itemNo = ko.observable("");
            self.itemCost = ko.observable("");
            self.itemQty = ko.observable("");
            self.itemDesc = ko.observable("");
            self.confirm = ko.observable(true);
            self.pending = ko.observable(false);

            // PO Form Values
            self.poNumber = ko.observable();
            self.poSupplier = ko.observable();
            self.poOrderDate = ko.observable();
            self.poTotalAmount = ko.observable();

            self.tableData = ko.observable();

            self.tableDate = [];
            self.tableState = true;

            self.currentPage = ko.observable(0);

            var storedqrVal = self.qrVal();

            let watchqrVal = setInterval(() => {
                //let stateOfqrValue = self.qrVal() !== storedqrVal ? fsm.onProcessPO(self.qrVal()) : false;

                stateOfqrValue !== false ? storedqrVal = self.qrVal() : false;
            }, 100);

            self.rescanPo = () => {
                $('#poForm').addClass('hidden');
                $('.alert').addClass('hidden');
                self.qrVal("");
                storedqrVal = self.qrVal();
                self.currentPage(0);
            }

            self.scanNextPO = () => {
                console.log('next po')
                $('#output-form').addClass('hidden');
                $('#poForm').addClass('hidden');
                $("#formTable").addClass('hidden');
                $('.br').addClass('hidden');
                $('.qr').removeClass('hidden');
                $('#scan-controls').removeClass('hidden');
                self.rescanPo();
                // self.opts("qr");
                // self.qrVal("");
                // self.qr_state("");
                // self.scanErrors("")

                // // Item Values
                // self.itemNo("");
                // self.itemCost("");
                // self.itemQty("");
                // self.itemDesc("");
                // self.confirm(true);
                // self.pending(false);

                // // PO Form Values
                // self.poNumber();
                // self.poSupplier();
                // self.poOrderDate();
                // self.poTotalAmount();

                // self.tableData();

                // self.tableDate = [];
                // self.tableState = true;

                // self.currentPage(0);

                // storedqrVal = self.qrVal();
            //fsm.onStartQRScanner();
                
            };
            self.UpdateItem = function() {
                
                
                //fsm.onUpdateItem()
            }

            //fsm.onStartQRScanner();
        };

        ScannerModel.prototype.bindingsApplied = function(context) {
            $('.br').addClass('hidden')
        };
        return ScannerModel;
    });
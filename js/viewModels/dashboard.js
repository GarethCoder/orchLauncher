define(['ojs/ojcore', 'knockout', 'jquery', 'libs/ais-client/index', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojknockout', 'ojs/ojdialog'],

  function (oj, ko, $, ais) {

    function DashboardViewModel() {
      var self = this;
	  
	  	
         self.handleOKClose = function() {
             document.querySelector("#modelessDialog1").close();
         };
	  
	  self.conn = ko.observable({});
      self.orcs = ko.observableArray([]);
      self.inputitems = ko.observableArray([]);
      self.inputsLoaded = ko.observable(false);
      self.selectedOrc = ko.observable("");
      self.orcSubmitted = ko.observable(false);
      self.orcJSON = ko.observable({});
      self.formValues = ko.observable({});
      self.orcResponse = ko.observable();
      self.orcReplied = ko.observable(false);
      self.userMessage = ko.observable("");
      self.unloaded = ko.observable(true);
      self.waiting = ko.observable(false);
      self.revealInputs = ko.observable(false);
      self.filterValue = ko.observable();
      self.fullOrcList = ko.observable([]);

      self.filterValue.subscribe(function (newValue) {
        console.log('into...')
        if (newValue == '') {
          self.orcs(self.fullOrcList());

          $(".orcButtons").on('click', function (evt) {

            self.inputsLoaded(false);
            let orc = $(evt.target).closest("span").innerHTML
            // let orc = evt.target.innerHTML;
            $("#formHolderWrapper").remove()
            
            self.selectedOrc(orc);

            $.Deferred(function (defer) {
              $("html, body").animate({
                // scroll to end of page
                scrollTop: -$(document).height()
              }, 800, defer.resolve);
            }).done(function () {
              console.log("runs once!")
            });

            self.userMessage("Enter values to test: " + self.selectedOrc())
            // get the inputs for the select orc
            self.orcs().forEach(function (oneOrc) {

              if (orc == oneOrc.name) {
                let ins = oneOrc.inputs
                let holder = []
                $.each(ins, function (i, o) {
                  holder.push({
                    "label": o.name,
                    "type": o.type,
                    "id": o.name
                  })
                })

                self.inputitems(holder)
                self.inputsLoaded(true)
                $(".submitOrc").on('click', function (evt) {

                  self.orcSubmitted(true)
                  self.callOrc(self.selectedOrc());

                })
                $(".resetOrc").on('click', function (evt) {

                  self.orcSubmitted(false)
                  self.resetOrc();


                })
                $(".revealInputs").on('click', function (evt) {

                  self.revealInputs(!self.revealInputs())
                  if (self.revealInputs()) {
                    $("#replyHolder").css('width', '50%')
                  } else {
                    $("#replyHolder").css('width', '100%')
                  }

                })

              }
            })
          })
          return;
        } else {
          

          let filteredList = self.fullOrcList().filter(function (oneOrc) {
            console.log(self.filterValue())
            return oneOrc.name.toLowerCase().indexOf(self.filterValue().toLowerCase()) > -1
          })
          self.orcs(filteredList);
        }

      });
	  
	  

      $(".showInputs").on('click', function (evt) {
        console.log('hit')
        document.querySelector('#popup1').open('#btnGo');
      })
      // generic method to call a selected orc
      self.callOrc = function (orcName) {
        self.waiting(true)
        // get inputs to send to E1
        let inputs = []
        $('.orcFormInputs').each(function (i, o) {
          inputs.push({
            name: $(o).attr('placeholder'),
            value: $(o).val()
          })

        })

        // insert request json into UI
        self.orcJSON(JSON.stringify({
          inputs: inputs
        }))



        // make orc call to E1
        $.ajax({
          url: self.conn().url + '/jderest/v2/orchestrator/' + self.selectedOrc(),
          method: 'post',
          contentType: 'application/json',
          data: JSON.stringify({
            inputs: inputs
          }),
          fail: {
            function (xhr) {
              if (window.console) console.log(xhr.responseText);
            }
          },
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(self.conn().username + ":" + self.conn().password));
          },
        }).done(function (response) {

          // insert response into UI
          if (typeof response == 'object') {
            self.orcResponse(JSON.stringify(response));
            if (self.orcSubmitted() === true) {
              self.orcReplied(true);
              self.waiting(false);
            }
          }

        })
      }

      // worker method to grab existing orcs in discover service
      self.getOrcs = function () {
        self.userMessage("Loading Orchestrations...")
        self.unloaded(false)
        let getOrcJSON = JSON.stringify({
          username: self.conn().username,
          password: self.conn().password
        })

        // fetch from E1
        try {
          $.ajax({
            url: self.conn().url + '/jderest/discover',
            method: 'post',
            contentType: 'application/json',
            data: getOrcJSON,
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Basic " + btoa(self.conn().username + ":" + self.conn().password));
            },
            error: function (jqXHR, textStatus, errorThrown) {
              //console.log('There was an error.'+ errorThrown); 
              console.log(jqXHR);
              self.userMessage("There was an error gathering the list of Orchestrations. Please ensure that the Orchestration Discover service is enabled and running on the url and port that was logged into AppShare.")
            }
          }).done(function (response) {

            //if we get a response obj, process it
            if (typeof response === 'object') {
              self.userMessage("Select an Orchestration to launch:")
              self.unloaded(false);
              if (response.orchestrations.length == 0) {
                self.userMessage("No Orchestrations found.")
                return;
              }
              self.orcs(response.orchestrations);
              self.fullOrcList(response.orchestrations);
              // set up some listeners
              $(".orcButtons").on('click', function (evt) {
                var popup = document.querySelector("#modelessDialog1").open();
                //popup.open('#btnGo');
                self.inputsLoaded(false);
                $("#formHolderWrapper").remove()
                let orc = $(this).attr('id')
                
                // console.log($(this).attr('id'))

                

                // $.Deferred(function (defer) {
                //   $("html, body").animate({
                //     // scroll to end of page
                //     scrollTop: -$(document).height()
                //   }, 800, defer.resolve);
                // }).done(function () {
                //   console.log("runs once!")
                // });

                let holder = []
                // get the inputs for the select orc
                self.orcs().forEach(function (oneOrc) {

                  if (orc == oneOrc.name) {
                    let ins = oneOrc.inputs
                    
                    $.each(ins, function (i, o) {
                      holder.push({
                        "label": o.name,
                        "type": o.type,
                        "id": o.name
                      })
                    })

                    

                    

                  }
                })
                self.selectedOrc(orc);
                self.inputitems(holder)
                self.inputsLoaded(true)
                self.userMessage("Enter values to test: " + self.selectedOrc())
                $(".submitOrc").on('click', function (evt) {

                  self.orcSubmitted(true)
                  self.callOrc(self.selectedOrc());
                  self.inputitems([])

                })
                $(".resetOrc").on('click', function (evt) {
                  var popup = document.querySelector('#popup1');
                  popup.close('#btnGo');
                  self.orcSubmitted(false)
                  self.revealInputs(false)
                  self.resetOrc();
                })
                
                $(".revealInputs").on('click', function (evt) {

                  self.revealInputs(!self.revealInputs())
                  if (self.revealInputs()) {
                    $("#replyHolder").css('width', '50%')
                  } else {
                    $("#replyHolder").css('width', '100%')
                  }

                })
              })

            }

          })
        } catch (err) {
          self.userMessage(err.message)
        }


      }
      // function to get AIS connection
      self.getConnected = function () {
        var url = new URL(window.location.href);
        self.conn({
          username: url.searchParams.get("user"),
          password: url.searchParams.get("password"),
          url: url.searchParams.get("ais"),
          deviceName: url.searchParams.get("device"),
        })
        window.localStorage.setItem('conn', btoa(JSON.stringify(self.conn())))
        var AIS = new ais(self.conn())
        // AIS.getToken().then(function (token) {
        //   console.log(token)
        // })
        //console.log("AIS === " + JSON.stringify(AIS));
      }

      
      
      // bump to bottom of evnt queue
      setTimeout(function () {
        self.getConnected();
        self.getOrcs();
        // $('#filterTextInput').on('afterkeydown', function (event) {
        //   // self.filterValue($('.filterTextInput').val());
        //   // console.log("newValue ===  "+$('#filterTextInput').val().toLowerCase())

        //   // let filteredList = self.fullOrcList().filter(function (oneOrc) {
        //   //   console.log($('#filterTextInput').val())
        //   //   return oneOrc.name.toLowerCase().indexOf($('#filterTextInput').val().toLowerCase()) > -1
        //   // })
        //   // self.orcs(filteredList);
        //   var e = $.Event("keypress", {
        //     which: 13
        //   });
        //   $('#filterTextInput').trigger(e);
        // })
      }, 0)

      self.resetOrc = function () {

        self.inputsLoaded(false);
        self.waiting(false);
        self.selectedOrc("");
        self.userMessage("Select Orchestration to test: ");
        self.orcResponse(null)
        self.orcReplied(false)

      }
      self.cancelLaunch = function () {
        self.resetOrc();
        var popup = document.querySelector('#popup1');
        popup.close();

      }

    }


    return new DashboardViewModel();
  }
);

var objTR = {};

objTR.WebSiteUrl = _spPageContextInfo.webAbsoluteUrl;//"https://treta.sharepoint.com/sites/TestMitesh";
var lstEmployeeRecords = "EmployeeMaster";
var lstCountryrecords= "CountryMaster";
var lststaterecords= "StateMaster";
var lstcityrecords= "CityMaster";
var selectedHobbies = [];
var Maritalstatus=false;
var EmpId;
objTR.TRDetails = [];


$(document).ready(function(){
    debugger
    $("#subEmployeeRec").text("Submit");
    objTR.getAllUsers();
    objTR.getAllCountryList();
    objTR.getAllStateList();
    objTR.getAllCityList();
    // var empId = objTR.getParameterValues("ID");
    // if (empId > 0) {
    //     objTR.GetTRDetailsById(empId);
    // }
    $("#subEmployeeRec").click(function(){
        var IsValidForm = true;
        var validationContent = "";
        IsValidForm = ValidateRequiredValue();
        if (!IsValidForm) {
            validationContent += "<li>Please fill all required fields." + "</li>";
        }
        $('input[name="Hobby"]:checked').each(function () {
            selectedHobbies.push($(this).val());
          });
          if($("#checkIsMarried :checked")){
            Maritalstatus=true;
          }
          else{
            Maritalstatus=false;
          }
        if(IsValidForm){
            var objData={
                FirstName1: $("#txtFirstName").val(),
                LastName: $("#txtLastName").val(),
                Email:$("#txtEmail").val(),
                Phone:$("#txtNumber").val(),
                Address:$("#txtAddress").val(),
                DOB:$("#txtDOB").val(),
                Pincode: $("#txtPincode").val(),
                Gender:$('input[name="Gender"]:checked').val(),
                CountryMasterId:$("#ddlCountry").val() ,
                StateMasterId:$("#ddlState").val(),
                CityMasterId:$("#ddlCity").val(),
                // Hobbies:selectedHobbies,
                IsMarried:Maritalstatus,
               // ID:$("#hdnEmpId").val(),
            };
            if($("#hdnEmpId").val()>0){
              objTR.UpdateEmployeeData(objData);
              $("#hdnEmpId").val("");
            }
            else{
              objTR.SaveEmployeeData(objData);
            }
           
        }
        else {
            $(this).removeAttr("disabled");
            var content = document.createElement('ul');
            content.innerHTML = validationContent;
            content.setAttribute("class", "swal-text");

            toastr.error(validationContent, 'Info');
        }
        
        
    })
    $(".btnEdit").click(function(e){
        e.preventDefault();
        EmpId=  $(this).data('id');
        objTR.GetTRDetailsById(EmpId);
        $("#subEmployeeRec").text("Update");
        });
        $(".btnDelete").click(function(e){
          e.preventDefault();
          EmpId=  $(this).data('id');
          objTR.GetEmpDetailsByIdForDelete(EmpId);
          
          });
})
function ValidateRequiredValue() {
    var IsValid = true;
    $("#divEmpRecord .Required").removeClass("RequiredValidation");
    $("#divEmpRecord .Required").each(function () {
        var currentValue = $(this).val();
        if (currentValue == "" || currentValue == null || currentValue == "0") {
            $(this).addClass("RequiredValidation");
            IsValid = false;
        }
    });
    return IsValid;
}

 // Added Records
objTR.SaveEmployeeData = function (objData) {
  
    try {
        spRestAPICallsUtil.addListItem(
            objTR.WebSiteUrl,
            lstEmployeeRecords,
            objData,
            false,
            function (result) {
                if (!!result && !!result.d && result.d.ID > 0) {
                    $("#btnSubmit").addClass("hide");
                   
                    var msg = "Employee Record added successfully";
                    toastr.success(msg, "Success", {
                        timeOut: 5000,
                    });
                }
                setTimeout(() => {
                    reloadPage(2500);
                   
                }, 1000);
            },
            function (error) {
               
                console.log("ErrorMessage", error);
            }
        );
    } catch (error) {
        
        console.log("ErrorMessage", error);
    }

};

// update User

objTR.UpdateEmployeeData = function (objData) {
  
  try {
      spRestAPICallsUtil.updateListItem(
          objTR.WebSiteUrl,
          lstEmployeeRecords,
          objData,
          EmpId,
          false,
          function (result) {
              if (!!result && !!result.d && result.d.ID > 0) {
                  //$("#btnSubmit").addClass("hide");
                 
                  var msg = "Employee Record Update successfully";
                  toastr.success(msg, "Success", {
                      timeOut: 5000,
                  });
              }
              setTimeout(() => {
                  reloadPage(2500);
                 
              }, 1000);
          },
          function (error) {
             
              console.log("ErrorMessage", error);
          }
      );
  } catch (error) {
      
      console.log("ErrorMessage", error);
  }

};

// Get All Users


objTR.getAllUsers = function () {
    try {
      var users = [];
      var query = "?$select=*,StateMaster/Title,CountryMaster/Title,CityMaster/Title&$expand=StateMaster,CityMaster,CountryMaster";
      spRestAPICallsUtil.getListItems(
        objTR.WebSiteUrl,
        lstEmployeeRecords,
        query,
        false,
        function (data) {
          if (data.d.results.length > 0) {
            users = data.d.results.map(item=>`<tr><td>${item.ID}</td><td>${item.FirstName1}</td><td>${item.LastName}</td><td>${item.Email}</td><td>${item.Phone}</td><td>${item.Address}</td><td>${item.Gender}</td><td>${moment(item.DOB).format('MM/DD/YYYY')}</td><td>${item.Pincode}</td>
             <td>${item.IsMarried}</td>
            <td>${item.CountryMaster.Title}</td>
            <td>${item.StateMaster.Title}</td>
            <td>${item.CityMaster.Title}</td>
                <td> <button class="btn btn-warning btnEdit" data-id="${item.Id}" type="button">Edit</button>
                            <button class="btn btn-danger btnDelete" data-id="${item.Id}" type="button">Delete</button></td></tr>`);
          }
          $("#tblEmployee tbody").html(users.join(""));
        },
        function (error) {
          console.log(error);
        }
      );
    } catch (error) {
      console.error(error);
    }
    //return users;
  };

  objTR.GetTRDetailsById = function (EmpId) {
    objTR.TRDetails = [];
    
    try {
        var query = `?$select=*,StateMaster/Title,CountryMaster/Title,CityMaster/Title&$expand=StateMaster,CityMaster,CountryMaster`;
        query += `&$filter=ID eq '` + EmpId + `'`;
        spRestAPICallsUtil.getListItems(
            objTR.WebSiteUrl,
            lstEmployeeRecords,
            query,
            false,
            function (data) {
                debugger
                if (data.d.results.length > 0) {
                    objTR.TRDetails = data.d.results[0];
                    objTR.setTRData();
                }
            },
            function (error) {
                objTR.TRDetails = [];
                console.log(
                    "[objTR.GetTRDetails] Error occur while getting data from list by id: ",
                    error
                );
            }
        );
    } catch (error) {
        objTR.TRDetails = [];
        console.log(
            "[objTR.GetTRDetails] Error occur while getting data from list by id: ",
            error
        );
    }
};

objTR.setTRData = function () {
    debugger
    var item = objTR.TRDetails;
    $("#hdnEmpId").val(item.ID);
    var DOBdate=moment(item.DOB).format("YYYY-MM-DD");
    $("#txtDOB").val(DOBdate);
    $("#txtFirstName").val(item.FirstName1);
    $("#txtLastName").val(item.LastName);
    $("#txtEmail").val(item.Email);
    $("#txtNumber").val(item.Phone);
    $("#txtAddress").val(item.Address);
    $("#txtPincode").val(item.Pincode);
    $("#ddlCountry").val(item.CountryMasterId);
    $("#ddlState").val(item.StateMasterId);
    $("#ddlCity").val(item.CityMasterId);
    $(`input[name="Gender"][value="${item.Gender}"]`).prop("checked", true);
    $("#checkIsMarried").prop("checked", true);
};

// delete record

objTR.GetEmpDetailsByIdForDelete = function (EmpId) {
  debugger
  objTR.TRDetails = [];
  
  try {
      var query = `?$select=*,StateMaster/Title,CountryMaster/Title,CityMaster/Title&$expand=StateMaster,CityMaster,CountryMaster`;
      query += `&$filter=ID eq '` + EmpId + `'`;
      spRestAPICallsUtil.getListItems(
          objTR.WebSiteUrl,
          lstEmployeeRecords,
          query,
          false,
          function (data) {
              debugger
              if (data.d.results.length > 0) {
                  objTR.TRDetails = data.d.results[0];
                  spRestAPICallsUtil.deleteListItem(
                    objTR.WebSiteUrl,
                    lstEmployeeRecords,
                    EmpId,
                    function (result) {
                      if (!!result && !!result.d && result.d.ID > 0) {
                          var msg = "Employee Record deleted successfully";
                          toastr.success(msg, "Success", {
                              timeOut: 5000,
                          });
                      }
                      setTimeout(() => {
                          reloadPage(2500);
                         
                      }, 1000);
                  },
                  function (error) {
                     
                      console.log("ErrorMessage", error);
                  }
                  )
              }
          },
          function (error) {
              objTR.TRDetails = [];
              console.log(
                  "[objTR.GetTRDetails] Error occur while getting data from list by id: ",
                  error
              );
          }
      );
  } catch (error) {
      objTR.TRDetails = [];
      console.log(
          "[objTR.GetTRDetails] Error occur while getting data from list by id: ",
          error
      );
  }
};










  // Reload Page

function reloadPage(seconds, redirectURL) {
    setTimeout(function () {
        if (redirectURL) {
            window.location.href = redirectURL;
        } else {
            location.reload();
        }
    }, seconds);
}

// get all country
    objTR.getAllCountryList = function () {
        try {
          var Countries = [];
          var query = "?$select=*";
          spRestAPICallsUtil.getListItems(
            objTR.WebSiteUrl,
            lstCountryrecords,
            query,
            false,
            function (data) {
              if (data.d.results.length > 0) {
                Countries = data.d.results.map(item=>`<option value="${item.Id}">${item.Title}</option>`);
                $("#ddlCountry").append(Countries.join(""));
              }else {
                console.error("No countries found.");
              }
            },
            function (error) {
              console.log(error);
            }
          );
        } catch (error) {
          console.error(error);
        }
        //return users;
      };

// get all state
objTR.getAllStateList = function () {
    try {
      var States = [];
      var query = "?$select=*";
      spRestAPICallsUtil.getListItems(
        objTR.WebSiteUrl,
        lststaterecords,
        query,
        false,
        function (data) {
          if (data.d.results.length > 0) {
            States = data.d.results.map(item=>`<option value="${item.Id}">${item.Title}</option>`);
            $("#ddlState").append(States.join(""));
          }else {
            console.error("No State found.");
          }
        },
        function (error) {
          console.log(error);
        }
      );
    } catch (error) {
      console.error(error);
    }
    //return users;
  };

  // get all cities
  objTR.getAllCityList = function () {
    try {
      var cities = [];
      var query = "?$select=*";
      spRestAPICallsUtil.getListItems(
        objTR.WebSiteUrl,
        lstcityrecords,
        query,
        false,
        function (data) {
          if (data.d.results.length > 0) {
            cities = data.d.results.map(item=>`<option value="${item.Id}">${item.Title}</option>`);
            $("#ddlCity").append(cities.join(""));
          }else {
            console.error("No City found.");
          }
        },
        function (error) {
          console.log(error);
        }
      );
    } catch (error) {
      console.error(error);
    }
    //return users;
  };
  
  objTR.getParameterValues = function (param) {
    try {
      var url = window.location.href
        .slice(window.location.href.indexOf("?") + 1)
        .split("&");
      for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split("=");
        if (urlparam[0] == param) {
          return urlparam[1];
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  
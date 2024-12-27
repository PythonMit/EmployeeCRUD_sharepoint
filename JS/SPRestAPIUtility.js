var spRestAPICallsUtil = {}

/**
 * get list details
 * @param  {} siteUrl
 * @param  {} listTitle
 * @param  {} queryStr
 * @param  {} isAsync
 * @param  {} onSuccess
 * @param  {} onError
 */
spRestAPICallsUtil.getListItems = function (siteUrl, listTitle, queryStr, isAsync, onSuccess, onError) {
    var url = siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')/Items"
    if (typeof (queryStr) !== 'undefined') {
        url += queryStr
    }
    if (typeof (isAsync) === 'undefined') {
        isAsync = true
    }
    if (url.indexOf('$top') < 0) {
        if (url.indexOf('?') >= 0)
            url += '&$top=5000'
        else
            url += '?$top=5000'
    }
    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json;odata=verbose'
        },
        async: isAsync,
        // beforeSend: function () {
        //     common.showLoader();
        // },
        // complete: function () {
        //     common.hideLoader();
        // },
        success: onSuccess,
        error: onError
    });
}


spRestAPICallsUtil.getListItems2 = function (siteUrl, listTitle, queryStr, isAsync) {
    var url = siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')/Items?"
    if (typeof (queryStr) !== 'undefined') {
        url += queryStr
    }
    if (typeof (isAsync) === 'undefined') {
        isAsync = true
    }
    if (url.indexOf('$top') < 0) {
        if (url.indexOf('?') >= 0)
            url += '&$top=5000'
        else
            url += '?$top=50000'
    }
    return $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json;odata=nometadata'
        },
        async: isAsync
    }).fail(function (jqXHR, textStatus) {
        //DisplayNotification('Alert!', 'Error in getting List Items! Please try again!', 'danger')
        console.log("Failed to request list '" + listTitle + "'. status:" + textStatus)
        if (console) {
            console.log(jqXHR)
        }
    })
}

/**
 * Additem into list
 * @param  {} siteUrl
 * @param  {} listTitle
 * @param  {} item
 * @param  {} isAsync
 */
spRestAPICallsUtil.addListItem = function (siteUrl, listTitle, item, isAsync, onSuccess, onError) {
    if (typeof (isAsync) === 'undefined') {
        isAsync = true
    }
    var listMetadataType = spRestAPICallsUtil.getListInternalName(siteUrl, listTitle, false);
    var items = {
        '__metadata': {
            'type': listMetadataType
        }
    };
    var dataModel = $.extend({}, items, item);
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listTitle + "')/Items",
        type: 'POST',
        data: JSON.stringify(dataModel),
        async: isAsync,
        // beforeSend: function () {
        //     common.showLoader();
        // },
        // complete: function () {
        //     common.hideLoader();
        // },
        headers: {
            'Accept': 'application/json;odata=verbose',
            'content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            "X-HTTP-Method": "POST"
        },
        success: onSuccess,
        error: onError
    });
}

// Create list item
spRestAPICallsUtil.createListItem = function (siteUrl, listTitle, item, isAsync) {
    //ShowLoader();
    if (typeof (isAsync) === 'undefined') {
        isAsync = true
    }
    var listMetadataType = "SP.Data." + listTitle + "ListItem"
    var listNameInternal = spRestAPICallsUtil.getListInternalName2(siteUrl, listTitle);
    listNameInternal.done(function (data) {
        listMetadataType = data.d.ListItemEntityTypeFullName;
    });
    var items = {
        '__metadata': {
            'type': listMetadataType
        }
    };
    var dataModel = $.extend({}, items, item);
    return $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listTitle + "')/Items",
        type: 'POST',
        data: JSON.stringify(dataModel),
        async: isAsync,
        headers: {
            'Accept': 'application/json;odata=verbose',
            'content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            "X-HTTP-Method": "POST"
        },
        success: function (data) { },
        error: function (error) {
            //HideLoader();
            console.log(error.responseText)
            //DisplayNotification('Alert!', 'Error in saving item! Please try again!', 'danger')
        }
    }).fail(function (jqXHR, textStatus) {
        //DisplayNotification('Alert!', 'Error in saving item! Please try again!', 'danger')
        if (console) {
            //HideLoader();
            console.log(jqXHR)
        }
    })
}

/**
 * Update list item.
 * @param  {} siteUrl
 * @param  {} listTitle
 * @param  {} item
 * @param  {} itemID
 * @param  {} isAsync
 * @param  {} onSuccess
 * @param  {} onError
 */
spRestAPICallsUtil.updateListItem = function (siteUrl, listTitle, item, itemID, isAsync, onSuccess, onError) {
    if (typeof (isAsync) === 'undefined') {
        isAsync = true
    }
    var listMetadataType = spRestAPICallsUtil.getListInternalName(siteUrl, listTitle, false);
    var items = {
        '__metadata': {
            'type': listMetadataType
        }
    };
    var dataModel = $.extend({}, items, item);
    $.ajax({
        url: siteUrl + "/_api/Web/Lists/getByTitle('" + listTitle + "')/Items(" + itemID + ')',
        type: 'POST',
        contentType: 'application/json;odata=minimalmetadata',
        data: JSON.stringify(dataModel),
        async: isAsync,
        // beforeSend: function () {
        //     common.showLoader();
        // },
        // complete: function () {
        //     common.hideLoader();
        // },
        headers: {
            'Accept': 'application/json;odata=verbose',
            'content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'X-HTTP-Method': 'MERGE',
            'If-Match': '*'
        },
        success: onSuccess,
        error: onError
    });
}

/**
 * Get ListItemEntityTypeFullName
 * @param  {} siteUrl
 * @param  {} listTitle
 * @param  {} isAsync
 */
spRestAPICallsUtil.getListInternalName = function (siteUrl, listTitle, isAsync) {
    try {
        var listItemEntityTypeFullName = "";
        $.ajax({
            url: siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')?$select=ListItemEntityTypeFullName",
            method: "GET",
            async: isAsync,
            // beforeSend: function () {
            //     common.showLoader();
            // },
            // complete: function () {
            //     common.hideLoader();
            // },
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function (data) {
                listItemEntityTypeFullName = data.d.ListItemEntityTypeFullName
            },
            error: function (error) {
                console.error(error);
            }
        });
        return listItemEntityTypeFullName;
    } catch (error) {
        console.error(error);
    }
};

spRestAPICallsUtil.getListInternalName2 = function GetListItemEntityTypeFullName(siteUrl, listTitle) {
    return $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')?$select=ListItemEntityTypeFullName",
        method: "GET",
        async: false,
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
};

/**
 * Send an email to sharepoint user.
 * @param  {} from
 * @param  {} to
 * @param  {} body
 * @param  {} subject
 * @param  {} cc
 */

spRestAPICallsUtil.sendEmail = function (siteUrl, from, to, subject, body, cc) {
    try {
        var flag = false;
        if (from == "" || from == undefined || from == null) {
            from = "trimantra1@tuskegee.edu";
        }
        if (cc == "" || cc == undefined || cc == null) {
            cc = [];
        }
        // if (bcc == undefined) {
        //     bcc = [];
        // }

        $.ajax({
            contentType: 'application/json',
            url: siteUrl + "/_api/SP.Utilities.Utility.SendEmail",
            type: "POST",
            data: JSON.stringify({
                'properties': {
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    'From': from,
                    'To': {
                        'results': to
                    },
                    'Body': body,
                    'Subject': subject,
                    'CC': {
                        'results': cc
                    }
                }
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                //alert('Email Sent Successfully to ' + to);
                flag = true;
            },
            error: function (err) {
                console.warn('Error in sending Email: ' + JSON.stringify(err));
            }
        });

        return flag;
    } catch (error) {
        console.error(error);
    }
}
// spRestAPICallsUtil.sendAnEmail = function (siteUrl, from, to, subject, body, cc) {
//     try {
//         var flag = false;
//         if (from == "" || from == undefined || from == null) {
//             //from = "RAIndia_4dx@ra.rockwell.com";
//         }
//         if (cc == undefined) {
//             cc = [];
//         }
//         // if (bcc == undefined) {
//         //     bcc = [];
//         // }

//         $.ajax({
//             contentType: 'application/json',
//             url: siteUrl + "/_api/SP.Utilities.Utility.SendEmail",
//             type: "POST",
//             data: JSON.stringify({
//                 'properties': {
//                     '__metadata': {
//                         'type': 'SP.Utilities.EmailProperties'
//                     },
//                     'From': from,
//                     'To': {
//                         'results': to
//                     },
//                     'Body': body,
//                     'Subject': subject,
//                     'CC': {
//                         'results': cc
//                     }
//                 }
//             }),
//             headers: {
//                 "Accept": "application/json;odata=verbose",
//                 "content-type": "application/json;odata=verbose",
//                 "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
//             },
//             success: function (data) {
//                 //alert('Email Sent Successfully to ' + to);
//                 flag = true;
//             },
//             error: function (err) {
//                 console.warn('Error in sending Email: ' + JSON.stringify(err));
//             }
//         });

//         return flag;
//     } catch (error) {
//         console.error(error);
//     }
// }

//send email
// function SendEmail(to, body, subject, success, failur) {
// spRestAPICallsUtil.sendAnEmail = function (to, body, subject, success, failur) {
//     var userEmail = _spPageContextInfo.userEmail
//     //userEmail = "mobiledev@teretek.com";
//     //to = "tfoon@teretek.com";
//     var urlTemplate = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.Utilities.Utility.SendEmail";
//     $.ajax({
//         contentType: 'application/json',
//         url: urlTemplate,
//         type: "POST",
//         data: JSON.stringify({
//             'properties': {
//                 '__metadata': {
//                     'type': 'SP.Utilities.EmailProperties'
//                 },
//                 'From': userEmail,
//                 'To': {
//                     'results': [to]
//                 },
//                 'Subject': subject,
//                 'Body': body,
//                 'AdditionalHeaders': {
//                     '__metadata': {
//                         'type': 'Collection(SP.KeyValue)'
//                     },
//                     'results': [{
//                         "__metadata": {
//                             "type": 'SP.KeyValue'
//                         },
//                         "Key": "Content-Type",
//                         "Value": 'text\html',
//                         "ValueType": "Edm.String"
//                     }]
//                 }
//             }
//         }),
//         headers: {
//             "Accept": "application/json;odata=verbose",
//             "content-type": "application/json;odata=verbose",
//             "X-RequestDigest": $("#__REQUESTDIGEST").val()
//         },
//         success: function (data) {
//             success(data);
//         },
//         error: function (err) {
//             failur(JSON.stringify(err));
//         }
//     });
// }


spRestAPICallsUtil.sendAnEmail = function (to, body, subject) {
    //ShowLoader();
    //Get the relative url of the site
    var siteurl = _spPageContextInfo.webServerRelativeUrl;
    var urlTemplate = siteurl + "/_api/SP.Utilities.Utility.SendEmail";
    var additionalHeaders = null;

    return $.ajax({
        contentType: 'application/json',
        url: urlTemplate,
        type: "POST",
        async: false,
        data: JSON.stringify({
            'properties': {
                '__metadata': {
                    'type': 'SP.Utilities.EmailProperties'
                },
                //'From': _spPageContextInfo.userEmail,
                'To': {
                    'results': to
                },
                'Body': body,
                'Subject': subject
            }
        }),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        }
        // AdditionalHeaders: {
        //     "__metadata": {
        //         "type": "Collection(SP.KeyValue)"
        //     },
        //     "results": [{
        //         "__metadata": {
        //             "type": 'SP.KeyValue'
        //         },
        //         "Key": "content-type",
        //         "Value": 'text/html',
        //         "ValueType": "Edm.String"
        //     }]
        // },
    }).fail(function (jqXHR, textStatus) {
        // HideLoader();
        // DisplayNotification('Alert!', 'Error in sending email! Please try again', 'danger')
        if (console) {
            console.log(jqXHR)
        }
    })
}

spRestAPICallsUtil.GetUserProfileInformationByAccountName = function (accountName) {
    var baseUrl = _spPageContextInfo.webServerRelativeUrl
    if (baseUrl[baseUrl.length - 1] != '/')
        baseUrl += '/'

    var endPointUrl = baseUrl + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" +
        encodeURIComponent(accountName) + "'"
    return $.ajax({
        url: endPointUrl,
        method: 'GET',
        async: true,
        beforeSend: function () {
            common.showLoader();
        },
        complete: function () {
            common.hideLoader();
        },
        contentType: 'application/json;odata=verbose',
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    }).fail(function (jqXHR, textStatus) {
        console.log('Failed to Load Users Profile Information ' + accountName + '. Status:' + textStatus)
        if (console) {
            console.log(jqXHR)
        }
    })
}

spRestAPICallsUtil.GetUserByUserId = function (siteUrl, userId) {
    var url = siteUrl + '/_api/web/GetUserById(' + userId + ')'
    return $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json;odata=nometadata'
        },
        // beforeSend: function () {
        //     // common.showLoader();
        // },
        // complete: function () {
        //     common.hideLoader();
        // },
        async: false
    }).fail(function (jqXHR, textStatus) {
        console.log('Failed to Get User Details. status:' + textStatus)
        if (console) {
            console.log(jqXHR)
        }
    })
}

spRestAPICallsUtil.GetUserDetailsByUserId = function (siteUrl, userId, async, onSuccess, onError) {
    var url = siteUrl + "/_api/web/GetUserById(" + userId + ")";
    $.ajax({
        url: url,
        method: "GET",
        async: async,
        // beforeSend: function () {
        //     common.showLoader();
        // },
        // complete: function () {
        //     common.hideLoader();
        // },
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: onSuccess,
        error: onError
    });
}

spRestAPICallsUtil.uploadFilesToSharePoint = function (uploadFileObj, fileUploadOptions, success, failure) {
    common.ShowLoader();
    var overwrite = (!!fileUploadOptions.overwrite) ? "true" : "false";
    // var fileName = uploadFileObj.name;
    var fileName = fileUploadOptions.FileName;
    var targetUrl = fileUploadOptions.SiteUrl + "/" + fileUploadOptions.DocumentLibrary;
    var apiUrl = fileUploadOptions.SiteUrl + "/_api/Web/GetFolderByServerRelativeUrl('" + targetUrl + "')/Files/add(overwrite=" + overwrite + ", url='" + fileName + "')?$expand=ListItemAllFields";

    var getFile = getFileBuffer(uploadFileObj);
    var fileDataBuffer = null;
    getFile.done(function (arrayBuffer) {
        fileDataBuffer = arrayBuffer;
        $.ajax({
            url: apiUrl,
            type: "POST",
            data: fileDataBuffer,
            processData: false,
            async: false,
            beforeSend: function () {
                common.ShowLoader();
            },
            complete: function () {

            },
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
            },
            success: function (data) {
                common.ShowLoader();
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        })
    });
}



function getFileBuffer(uploadFile) {
    common.ShowLoader();
    var deferred = jQuery.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(uploadFile);
    return deferred.promise();
}

/*=====================================================
Start Get Item for Uploaded Document
=======================================================*/

// Upload the file.
// You can upload files up to 2 GB with the REST API.
function UploadFile(serverRelativeUrlToFolder, fileName, blobFile, dataModel, success, failure) {

    // Define the folder path for this example.
    // var serverRelativeUrlToFolder = '/shared documents';
    //serverRelativeUrlToFolder = "/" + serverRelativeUrlToFolder;
    // Get test values from the file input and text input page controls.
    //var fileInput = jQuery('#getFile');
    //var newName = jQuery('#displayName').val();

    var newName = fileName;
    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl;

    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {

        // Add the file to the SharePoint folder.
        var addFile = addFileToFolder(arrayBuffer);
        addFile.done(function (file, status, xhr) {

            // Get the list item that corresponds to the uploaded file.
            var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
            getItem.done(function (listItem, status, xhr) {

                // Change the display name and title of the list item.
                var changeItem = updateListItem(listItem.d.__metadata);
                changeItem.done(function (data, status, xhr) {
                    //alert('file uploaded and updated');
                    success(data);
                });
                changeItem.fail(onError);
            });
            getItem.fail(onError);
        });
        addFile.fail(onError);
    });
    getFile.fail(onError);

    //Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        //reader.readAsArrayBuffer(fileInput[0].files[0]);
        reader.readAsArrayBuffer(blobFile);
        return deferred.promise();
    }



    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        // Get the file name from the file input control on the page.
        //var parts = fileInput[0].value.split('\\');
        //var fileName = parts[parts.length - 1];


        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
            "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
            "/add(overwrite=true, url='{2}')",
            serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                //"content-length": arrayBuffer.byteLength
            }
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose"
            }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        //var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}", itemMetadata.type, newName, newName);
        var itemContent = {
            '__metadata': {
                'type': itemMetadata.type
            }
        };
        var item = $.extend({}, itemContent, dataModel);
        // Send the request and return the promise.
        // This call does not return response content from the server.
        return jQuery.ajax({
            url: itemMetadata.uri,
            type: "POST",
            data: JSON.stringify(item),
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                //"content-length": JSON.stringify(item).length,
                "IF-MATCH": itemMetadata.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
    }

    // Display error messages. 
    function onError(error) {
        failure(error.responseText);
    }
}

spRestAPICallsUtil.DeleteAttachmentFile = function (siteUrl, listTitle, itemId, file) {

    var Url = siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')/GetItemById(" + itemId + ")/AttachmentFiles/getByFileName('" + file + "')  ";

    return $.ajax({

        url: Url,

        type: 'DELETE',

        async: false,

        contentType: 'application/json;odata=verbose',

        headers: {

            'X-RequestDigest': $('#__REQUESTDIGEST').val(),

            'X-HTTP-Method': 'DELETE',

            'Accept': 'application/json;odata=verbose',

            "If-Match": '*'
        }

    });

};

spRestAPICallsUtil.AddAttachmentFile = function (buffer, siteUrl, listName, itemId, file) {

    var queryUrl = siteUrl + "/_api/lists/GetByTitle('" + listName + "')/items(" + itemId + ")/AttachmentFiles/add(FileName='" + file.name + "')";

    return $.ajax({

        url: queryUrl,

        method: 'POST',

        async: false,

        data: buffer,

        processData: false,

        headers: {

            "Accept": "application/json; odata=verbose",

            "content-type": "application/json; odata=verbose",

            "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value
        }

    }).fail(function (jqXHR, textStatus) {

        DisplayNotification("Alert!", "Error in adding attachment file - " + file.name + "! Please try again!", "danger");

        if (console) {

            console.log(jqXHR);

        }

    });

};

spRestAPICallsUtil.AddAttachmentToListItem = function (itemAttachmentFiles, listName, itemId, fileArray, success, failure) {

    var FilesCount = 0;

    var uploadStatus = "";

    var file = fileArray[0];

    var getFile = getFileBuffer(file);

    var siteUrl = _spPageContextInfo.webAbsoluteUrl;

    getFile.done(function (buffer, status, xhr) {

        var currentFile = $.grep(itemAttachmentFiles, function (item) {

            return item.FileName == file.name;

        });

        if (currentFile.length > 0) {

            spRestAPICallsUtil.DeleteAttachmentFile(_spPageContextInfo.webAbsoluteUrl, listName, itemId, file)

                .done(function () {

                    spRestAPICallsUtil.AddAttachmentFile(buffer, siteUrl, listName, itemId, file).done(function () {

                        FilesCount++;

                        uploadStatus = FilesCount;

                        fileArray.shift();

                        if (fileArray.length > 0) {

                            spRestAPICallsUtil.AddAttachmentToListItem(itemAttachmentFiles, listName, itemId, fileArray, success, failure);

                        } else {

                            success(uploadStatus);

                        }

                    }).fail(function (jqXHR, textStatus) {

                        failure(uploadStatus);

                    });

                });

        } else {

            spRestAPICallsUtil.AddAttachmentFile(buffer, siteUrl, listName, itemId, file).done(function () {

                FilesCount++;

                uploadStatus = FilesCount;

                fileArray.shift();

                if (fileArray.length > 0) {

                    spRestAPICallsUtil.AddAttachmentToListItem(itemAttachmentFiles, listName, itemId, fileArray, success, failure);

                } else {

                    success(uploadStatus);

                }

            }).fail(function (jqXHR, textStatus) {

                failure(uploadStatus);

            });

        }

    });

    getFile.fail(function (err) {

        failure(uploadStatus);

    });

};

spRestAPICallsUtil.getUserDetailsByEmail = function (email) {
    try {
        var spUserDetails = {};
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/SiteUsers?$filter=Email eq '" + email + "'",
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose'
            },
            async: false,
            beforeSend: function () {

            },
            complete: function () {

            },
            success: function (data) {
                spUserDetails = (data.d.results.length > 0) ? data.d.results[0] : [];
            },
            error: function (error) {
                console.log(error);
            }
        });
        return spUserDetails;
    } catch (error) {
        console.error(error);
    }
}

// Delete list item
spRestAPICallsUtil.deleteListItem = function (siteUrl, listTitle, itemID,onSuccess, onError) {
    return $.ajax({
        url: siteUrl + "/_api/Web/Lists/getByTitle('" + listTitle + "')/Items(" + itemID + ')',
        type: 'POST',
        headers: {
            'Accept': 'application/json;odata=minimalmetadata',
            'X-Http-Method': 'DELETE',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'If-Match': '*'
        },
        success: onSuccess,
        error: onError
    }).fail(function (jqXHR, textStatus) {
        //DisplayNotification('Alert!', 'Error in deleting item! Please try again!', 'danger')
        if (console) {
            console.log(jqXHR)
        }
    })
}
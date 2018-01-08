var dba = {};

dba.prep = function(EWD) {
  let params = {
    service: 'ewd-vista-dba',
    name: 'dba.html',
    targetId: 'main-content'
  };

  EWD.getFragment(params, function() {
    let messageObj = {
      service: 'ewd-vista-dba',
      type: 'getNumberspaceData',
    };

    EWD.send(messageObj, function(responseObj) {
      //Create table header
      let allData = responseObj.message;
      let ths = '<tr>';
      // Add a place holder for the edit icon
      ths += "<th>&nbsp;</th>";
      // Add headers + metadata
      allData.headers.forEach(function(h, index) {
        let file  = allData.files[index];
        let field = allData.fields[index];
        let dataType = allData.dataTypes[index];

        ths += '<th ';
        ths += 'data-file="'  + file  + '" ';
        ths += 'data-field="' + field + '" ';
        ths += 'data-datatype="' + dataType +'" ';
        ths += '>' + h + '</th>';
      });
      ths += '</tr>';
      $('#numData thead').html(ths);
      
      // Add table rows
      allData.records.forEach(function(r) {
        let dataRow = '<tr id="' + r[0] + '">';
        r.shift(); // get rid of IEN
        // Add edit icon
        dataRow += '<td><i title="edit">E</i></td>';
        r.forEach(function(d) {dataRow += '<td>' + d + '</td>';});
        dataRow += '</tr>';
        $('#numData tbody').append(dataRow);
      });

      // Attach click event to edit icons
      $('#numData tbody tr td i').click(function(e) {
        let tr   = this.parentElement.parentElement;
        let name = tr.children[1].innerText;
        let ien  = tr.id;

        let $table = tr.parentElement.parentElement;
        let $thead = $table.tHead;

        $('#modal-window .modal-content .modal-header').html('<h3 class="modal-title">Editing ' + name + ' (record number ' + ien + ')</h3>');
        $('#modal-window .modal-content .modal-body').html('<form></form>');
        $('#modal-window .modal-content .modal-footer').html('Fileman Edit Form');
        $('div.modal-dialog').addClass('modal-lg').removeClass('modal-sm');

        let $form = $('#modal-window .modal-content .modal-body form');

        // Loop through header metadata and construct fields
        for (let i = 1; i < $thead.rows[0].children.length; i++) {
          console.log('foo');

          let th = $thead.rows[0].children[i];

          let file = th.dataset.file;
          let field = th.dataset.field;
          let type = th.dataset.datatype;
          let name = th.innerHTML;
          let value = tr.children[i].innerHTML;

          let $div = $('<div class="form-group"></div>');

          let $input;
          switch (type) {
          case "number":
          case "text":
            $input = $('<input type="' + type + '" class="form-control" id="' +
              file + '-' + field + '" value="' + value +'">');
            break;
          case "textarea":
            $input = $('<textarea class="form-control" id="' +
              file + '-' + field + '">' + value.split('<br>').join('\n') + '</textarea>');
            break;
          }

          $input[0].dataset.file = file;
          $input[0].dataset.field = field;

          let $descriptionSpan = $('<span id="helpBlock" class="help-block"></span>');
          $descriptionSpan[0].dataset.file = file;
          $descriptionSpan[0].dataset.field = field;

          let $label = $('<label for="' + file + '-' + field +'"> ' + name + '</label>');
          $div.append($label);
          $div.append($input);
          $div.append($descriptionSpan);
          $form.append($div);
          
          let messageObj = {
            service: 'ewd-vista-fileman',
            type: 'helpTexts',
            params: { file: file, field: field }
          };

          EWD.send(messageObj, function(responseObj) {
            let file  = responseObj.message.file;
            let field = responseObj.message.field;
            let $target = $('form div input[data-file="' + file +'"][data-field="' + field +'"], form div textarea[data-file="' + file +'"][data-field="' + field +'"]');
            console.log($target);
            $target[0].placeholder = responseObj.message.helpPrompt;
            if (responseObj.message.description && responseObj.message.description.length) {
              let $span = $('form div span[data-file="' + file +'"][data-field="' + field +'"]');
              $span.html(responseObj.message.description.join('<br>'));
            }
          });

        }

        $form.append('<button type="submit" class="btn btn-primary pull-right">Submit</button>');


        $('#modal-window').modal({
          backdrop: true,
          keyboard: true,
          focus: true,
          show: true
        });

        $('#modal-window').modal('show');
      });
    });

    messageObj = {
      service: 'ewd-vista-dba',
      type: 'getNamespaceData',
    };
    
    EWD.send(messageObj, function(responseObj) {
      let allData = responseObj.message;
      let ths = '<tr>';
      // Add a place holder for the edit icon
      ths += "<th>&nbsp;</th>";
      allData.headers.forEach(function(h) {ths += '<th>' + h + '</th>';});
      ths += '</tr>';
      $('#nameData thead').html(ths);
      
      // Add table rows
      allData.records.forEach(function(r) {
        let dataRow = '<tr id="' + r[0] + '">';
        r.shift(); // get rid of IEN
        // Add edit icon
        dataRow += '<td><i title="edit">E</i></td>';
        r.forEach(function(d) {dataRow += '<td>' + d + '</td>';});
        dataRow += '</tr>';
        $('#nameData tbody').append(dataRow);
      });
    });
  
  });

};

/*
  Copyright 2017 Sam Habiel, Pharm.D.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

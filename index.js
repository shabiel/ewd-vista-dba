'use strict';

let vista = require('ewd-vista');
module.exports          = {};
module.exports.handlers = {};

module.exports.init = function() {
  vista.init.call(this);
};

module.exports.beforeHandler = vista.beforeHandler;

// Get Numberspace Data
module.exports.handlers.getNumberspaceData = function(messageObj, session, send, finished) {
  // Our Return Variable
  let records = [];
  
  // Our Return Headers
  let headers = [];
  headers.push('Start Number');
  headers.push('End Number');
  headers.push('Assigned to');
  headers.push('Namespaces');
  headers.push('Contact');
  headers.push('Notes');

  // Loop through every record in a Fileman File
  // Equivalent to the M code:
  // = for i=0:0 set i=$order(^DBA(50003,i)) quit:'i  do
  this.db.use('DBA','50003').forEachChild({range: {from: 1, to: ' '}}, (ien,node) => {

    // Get the zero node
    let z = node.$('0').value;
    let startNumber  = z.$p(1);
    let endNumber    = z.$p(2);
    let numberspaceHolder = z.$p(3);

    // Add data from 1 node to the namespaces array
    let namespaces = [];
    node.$('1').forEachChild({range: {from: 1, to: ' '}}, (ien, node2) =>{
      let nsz = node2.$('0').value;
      namespaces.push(nsz.$p(1));
    });
    
    // Get word processing field
    let contact = [];
    node.$('2').forEachChild({range: {from: 1, to: ' '}}, (ien, node2) =>{
      contact.push(node2.$('0').value);
    });

    // Get word processing field
    let notes = [];
    node.$('3').forEachChild({range: {from: 1, to: ' '}}, (ien, node2) =>{
      notes.push(node2.$('0').value);
    });
    
    // Create the record we will send back
    let record = [];
    record.push(ien);
    record.push(startNumber);
    record.push(endNumber);
    record.push(numberspaceHolder);
    record.push(namespaces.join(', '));
    record.push(contact.join('<br/>'));
    record.push(notes.join('<br/>'));

    // Add to return array
    records.push(record);
  });

  finished({headers: headers, records: records});
};

module.exports.handlers.getNamespaceData = function(messageObj, session, send, finished) {
  // Our Return Variable
  let records = [];
  
  // Our Return Headers
  let headers = [];
  headers.push('Namespace');
  headers.push('Assigned to');
  headers.push('Numberspaces');
  headers.push('Database Coordinator');
  headers.push('Notes');

  let query = {
    file: {number: '50004'},
    flags: 'PQ',
  };
  let namespaceRecords = fileman.filemanDicSync.call(this, query).records;
  
  namespaceRecords.forEach((item) => {
    let ien = item.ien;
    let namespace = this.db.function({function: 'GET1^DIQ',
      arguments: [50004, ien, '.01']}).result;
    let assignee = this.db.function({function: 'GET1^DIQ',
      arguments: [50004, ien, '.02']}).result;

    let query = {
      file: {number: '50004.3'},
      fields: [ {number: '.01'}, {number: '.02'} ],
      iens: `,${ien},`,
      flags: 'PQ',
      index: '#',
    };
    let numberspacesRecords = 
      fileman.filemanDicSync.call(this, query).records;
    
    let numberspaces = [];
    numberspacesRecords.forEach((record) => {
      let each = record.startnumber.toString() + '-' + 
        record.endnumber.toString();
      numberspaces.push(each);
    });

    this.db.use('TMP', 'QEWDWP', process.pid).delete();
    this.db.function({function: 'GET1^DIQ',
      arguments: [50004, ien, 4, '', '^TMP("QEWDWP",$J)']});
    let coor = this.db.use('TMP', 'QEWDWP', process.pid).getDocument();
    
    this.db.use('TMP', 'QEWDWP', process.pid).delete();
    this.db.function({function: 'GET1^DIQ',
      arguments: [50004, ien, 5, '', '^TMP("QEWDWP",$J)']});
    let notes = this.db.use('TMP', 'QEWDWP', process.pid).getDocument();

    let record = [];
    record.push(ien);
    record.push(namespace);
    record.push(assignee);
    record.push(numberspaces.join('<br/>'));
    record.push(Object.keys(coor).map((k) => coor[k]).join('<br/>'));
    record.push(Object.keys(notes).map((k) => notes[k]).join('<br/>'));

    // Add to return array
    records.push(record);
  });

  this.db.use('TMP', 'QEWDWP', process.pid).delete();
  finished({headers: headers, records: records});
};

'use strict';
var fs = require('fs');

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
  headers.push('Assign Date');
  headers.push('Decommission Date');
  headers.push('Namespaces');
  headers.push('Contact');
  headers.push('Notes');

  let files     = [ 50003, 50003, 50003, 50003, 50003, 50003, 50003, 50003];
  let dataTypes = [ 'number', 'number', 'text', 'date', 'date', 'text', 'textarea', 'textarea' ];
  let fields    = ['.01', '.02', '.03', '.04', '.05', '1', '2', '3'];

  // Loop through every record in a Fileman File
  // Equivalent to the M code:
  // = for i=0:0 set i=$order(^DBA(50003,i)) quit:'i  do
  let query = {
    file: {number: '50003'},
    flags: 'P',
  };

  let numberspaceRecords = fileman.filemanDicSync.call(this, query).records;
  
  numberspaceRecords.forEach((item) => {
    let ien = item.ien;
    let node = this.db.use('DBA', 50003, ien);

    // Get the zero node
    let z = node.$('0').value;
    let startNumber  = z.$p(1);
    let endNumber    = z.$p(2);
    let numberspaceHolder = z.$p(3);
    let assignDate = z.$p(4);
    let decommisionDate = z.$p(5);

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
    record.push(assignDate);
    record.push(decommisionDate);
    record.push(namespaces.join(', '));
    record.push(contact.join('<br/>'));
    record.push(notes.join('<br/>'));

    // Add to return array
    records.push(record);
  });
  
  /*
  fs.writeFile("/tmp/numberSpaceData.json", JSON.stringify({headers, files, dataTypes, fields, records}), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  }); 
  */

  // Note ES6 syntax below
  finished({headers, files, dataTypes, fields, records});
};

module.exports.handlers.getNamespaceData = function(messageObj, session, send, finished) {
  // Our Return Variable
  let records = [];
  let files     = [ 50004, 50004, 50004, 50004, 50004, 50004, 50004, 50004];
  let dataTypes = [ 'text', 'text', 'date', 'date', 'text', 'text', 'textarea', 'textarea', 'textarea' ];
  let fields    = ['.01', '.02', '.03', '.04', '.06', '1', '3', '4', '5'];
  
  // Our Return Headers
  let headers = [];
  headers.push('Namespace');
  headers.push('Assigned to');
  headers.push('Assign Date');
  headers.push('Decomission Date');
  headers.push('Primary/Secondary');
  headers.push('Exclusions');
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
    let node = this.db.use('DBA', 50004, ien);

    // Get the zero node
    let z = node.$('0').value;
    let namespace = z.$p(1);
    let assignee = z.$p(2);
    let assignDate = z.$p(3);
    let decommisionDate = z.$p(4);
    let p_s = z.$p(6);
    let exclusions = [];

    node.$(1).forEachChild({range: {from: 1, to: ' '}}, (ien, node2) => {exclusions.push(node2.$(0).value);});

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
    record.push(assignDate);
    record.push(decommisionDate);
    record.push(p_s);
    record.push(exclusions.join(', '));
    record.push(numberspaces.join('<br/>'));
    record.push(Object.keys(coor).map((k) => coor[k]).join('<br/>'));
    record.push(Object.keys(notes).map((k) => notes[k]).join('<br/>'));

    // Add to return array
    records.push(record);
  });

  this.db.use('TMP', 'QEWDWP', process.pid).delete();

  /*
  fs.writeFile("/tmp/nameSpaceData.json", JSON.stringify({headers, files, dataTypes, fields, records}), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
  */

  finished({headers, files, dataTypes, fields, records});
};

var dba = {};

dba.prep = function(EWD) {
  let messageObj = {
    service: 'ewd-vista-dba',
    type: 'getNumberspaceData',
  };

  EWD.send(messageObj, function(responseObj) {

    // Create table
    let table = '<table class="table" id="numData"><thead></thead><tbody></tbody><table>';
    $('#main-content').html(table);

    //Create table header
    let allData = responseObj.message;
    let ths = '<tr>';
    allData.headers.forEach((h) => ths += `<th>${h}</th>`);
    ths += '</tr>';
    $('#numData thead').html(ths);
    
    // Add table rows
    allData.records.forEach((r) => {
      let dataRow = `<tr id="${r[0]}">`;
      r.shift(); // get rid of IEN
      r.forEach((d) => dataRow += `<td>${d}</td>`);
      dataRow += '</tr>';
      $('#numData tbody').append(dataRow);
    });
  });
};

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
      allData.headers.forEach(function(h) {ths += '<th>' + h + '</th>';});
      ths += '</tr>';
      $('#numData thead').html(ths);
      
      // Add table rows
      allData.records.forEach(function(r) {
        let dataRow = '<tr id="' + r[0] + '">';
        r.shift(); // get rid of IEN
        r.forEach(function(d) {dataRow += '<td>' + d + '</td>';});
        dataRow += '</tr>';
        $('#numData tbody').append(dataRow);
      });
    });

    messageObj = {
      service: 'ewd-vista-dba',
      type: 'getNamespaceData',
    };
    
    EWD.send(messageObj, function(responseObj) {
      let allData = responseObj.message;
      let ths = '<tr>';
      allData.headers.forEach(function(h) {ths += '<th>' + h + '</th>';});
      ths += '</tr>';
      $('#nameData thead').html(ths);
      
      // Add table rows
      allData.records.forEach(function(r) {
        let dataRow = '<tr id="' + r[0] + '">';
        r.shift(); // get rid of IEN
        r.forEach(function(d) {dataRow += '<td>' + d + '</td>';});
        dataRow += '</tr>';
        $('#nameData tbody').append(dataRow);
      });
    });
  
  });

};

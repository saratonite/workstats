
 // Client ID and API key from the Developer Console
      var CLIENT_ID = client.web.client_id;

      console.log(client);
      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

      var authorizeButton = document.getElementById('authorize-button');
      var signoutButton = document.getElementById('signout-button');
      var workTimeDiv = document.getElementById('work-time-text');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
          listMajors();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

      /**
       * Print the names and majors of students in a sample spreadsheet:
       * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       */
      function listMajors() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: '1S-zj5yk1dAVswOEob9RxM1FtSWpvMIrIC5ZxS6wnsB0',
          range: 'B4:N37',
        }).then(function(response) {

            console.log(response);

            var totslHourse = response.result.values[32][12];

            workTimeDiv.textContent = totslHourse +' hours !'

            // make data for heat calender;

            var newData = response.result.values.filter(function(row){

              console.log('Row data',row[0])
              if(row[0]) {
                let _d = new Date(row[0])
                let __date = ('0' + _d.getDate()).slice(-2);
                let __month = ('0' + (_d.getMonth()+1)).slice(-2);
                row.day = _d.getFullYear()+'-'+__month+'-'+__date;
                row.count = +row[12] || 0;
                return row;

              }

            })

            console.log(newData)

            drawCalendar(newData);



        //   var range = response.result;
        //   if (range.values.length > 0) {
        //     appendPre('Name, Major:');
        //     for (i = 0; i < range.values.length; i++) {
        //       var row = range.values[i];
        //       // Print columns A and E, which correspond to indices 0 and 4.
        //       appendPre(row[0] + ', ' + row[4]);
        //     }
        //   } else {
        //     appendPre('No data found.');
        //   }
        }, function(response) {
          appendPre('Error: ' + response.result.error.message);
        });
      }


      

function drawCalendar(dateData){

    var weeksInMonth = function(month){
        var m = d3.timeMonth.floor(month)
        return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m,1)).length;
    }

    var minDate = d3.min(dateData, function(d) { return new Date(d.day) })
    var maxDate = d3.max(dateData, function(d) { return new Date(d.day) })

    var cellMargin = 1,
        cellSize = 40;

    var day = d3.timeFormat("%w"),
        week = d3.timeFormat("%U"),
        format = d3.timeFormat("%Y-%m-%d"),
        titleFormat = d3.utcFormat("%a, %d-%b");
        monthName = d3.timeFormat("%B"),
        months= d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

    var svg = d3.select("#calendar").selectAll("svg")
        .data(months)
        .enter().append("svg")
        .attr("class", "month")
        .attr("height", ((cellSize * 7) + (cellMargin * 8) + 20) ) // the 20 is for the month labels
        .attr("width", function(d) {
        var columns = weeksInMonth(d);
        return ((cellSize * columns) + (cellMargin * (columns + 1)));
        })
        .append("g")

    svg.append("text")
        .attr("class", "month-name")
        .attr("y", (cellSize * 7) + (cellMargin * 8) + 15 )
        .attr("x", function(d) {
        var columns = weeksInMonth(d);
        return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
        })
        .attr("text-anchor", "middle")
        .text(function(d) { return monthName(d); })

    var rect = svg.selectAll("rect.day")
        .data(function(d, i) { return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1)); })
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        //.attr("rx", 3).attr("ry", 3) // rounded corners
        .attr("fill", '#eaeaea') // default light grey fill
        .attr("y", function(d) { return (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin; })
        .attr("x", function(d) { return ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellMargin) + cellMargin ; })
        .on("mouseover", function(d) {
        d3.select(this).classed('hover', true);
        })
        .on("mouseout", function(d) {
        d3.select(this).classed('hover', false);
        })
        .datum(format);

    rect.append("title")
        .text(function(d) { return titleFormat(new Date(d)); });

    var lookup = d3.nest()
        .key(function(d) { return d.day; })
        .rollup(function(leaves) {
        return d3.sum(leaves, function(d){ return parseInt(d.count); });
        })
        .object(dateData);

    var scale = d3.scaleLinear()
        .domain(d3.extent(dateData, function(d) { return parseInt(d.count); }))
        .range([0.4,1]); // the interpolate used for color expects a number in the range [0,1] but i don't want the lightest part of the color scheme

    rect.filter(function(d) { return d in lookup; })
        .style("fill", function(d) { 
            if(!lookup[d]) {

                return '#ddd';
            }
            return d3.interpolateReds(scale(lookup[d]));
        })
        .select("title")
        .text(function(d) { return titleFormat(new Date(d)) + ":  " + lookup[d]; });

    }

    // var data = [
    //     {day:'2016-05-01',count:10},
    //     {day:'2016-05-02',count:20},
    //     {day:'2016-05-03',count:25},
    //     {day:'2016-05-04',count:23},
    //     {day:'2016-05-05',count:10}
    // ]
    //drawCalendar(data);
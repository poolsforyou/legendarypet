//Enable "Add App" button for Alt1 Browser.
A1lib.identifyApp("appconfig.json");
window.setTimeout(function () {

  const appColor = A1lib.mixColor(0, 255, 255);

  // Set Chat reader
  let reader = new Chatbox.default();
  reader.readargs = {
    colors: [
      A1lib.mixColor(255, 255, 255), //Seren text color
      // A1lib.mixColor(127,169,255), //Test Chat text color
      A1lib.mixColor(8, 7, 127), 
      A1lib.mixColor(255, 203, 5), 
    ],
    backwards: true,
  };

  //Setup localStorage variable.
  if (!localStorage.serenData) {
    localStorage.setItem("serenData", JSON.stringify([]))
  }
  let saveData = JSON.parse(localStorage.serenData);

  //Find all visible chatboxes on screen
  $(".itemList").append("<li class='list-group-item'>Searching for chatboxes</li>");
  reader.find();
  reader.read();
  let findChat = setInterval(function () {
    if (reader.pos === null)
      reader.find();
    else {
      clearInterval(findChat);
      reader.pos.boxes.map((box, i) => {
        $(".chat").append(`<option value=${i}>Chat ${i}</option>`);
      });

      if (localStorage.serenChat) {
        reader.pos.mainbox = reader.pos.boxes[localStorage.serenChat];
      } else {
        //If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
        reader.pos.mainbox = reader.pos.boxes[0];
      }
      showSelectedChat(reader.pos);
      //build table from saved data, start tracking.
      showItems();
      setInterval(function () {
        readChatbox();
      }, 600);
    }
  }, 1000);

  function showSelectedChat(chat) {
    //Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
    try {
      alt1.overLayRect(
        appColor,
        chat.mainbox.rect.x,
        chat.mainbox.rect.y,
        chat.mainbox.rect.width,
        chat.mainbox.rect.height,
        2000,
        5
      );
    } catch { }
  }


  function pushdrop(quantity, drop, time, source) {
      let getItem = {
        quantity: quantity,
        item: drop,
        time: time,
        source: source
      };
      console.log(getItem);
      saveData.push(getItem);
      localStorage.setItem("serenData", JSON.stringify(saveData));
      checkAnnounce(getItem);
      showItems();


  }

  //Reading and parsing info from the chatbox.
  function readChatbox() {
    var opts = reader.read() || [];
    var chat = "";

    for (a in opts) {
      chat += opts[a].text + " ";
    }
    var splittext = '';
    var find_text = ['legendary pet', 'coins have been added', 'charming imp', 'Spring'];

    for (let i = 0; i < find_text.length; i++) {
    if (chat.includes(find_text[i])) {
      //get the results of the chat box.
      let results = chat.split("[");
      if (find_text[i] == 'coins have been added') {
        let index = 
            results.findIndex
            (element => element.includes(find_text[i]));
        let result = results[index];
        let source = 'Advanced gold accumulator'
        splittext = result.split(" ");
        let hour = result.split(":")[0];
        let minute = result.split(":")[1];
        let second =  result.split(":")[2].replace("]","").split(" ")[0];
        let time = hour + ":" + minute + ":" + second;
        let quantity = splittext[1].replace(",","");
        let drop = 'coins';
        //console.log(time, quantity, drop);
        pushdrop(quantity, drop, time, source);
      } else if (find_text[i] == 'legendary pet') {
        let index = 
            results.findIndex
            (element => element.includes(find_text[i]));
        let result = results[index];
        splittext = result.split(":");
        let hour = result.split(":")[0];
        let minute = result.split(":")[1];
        let second =  result.split(":")[2].replace("]","").split(" ")[0];
        let time = hour + ":" + minute + ":" + second;
        let drop = splittext[splittext.length-1].replace(".","");
        let dropstr = drop.split(" ");
        var quantity = 1;
        if (!Number.isNaN(dropstr[dropstr.length-2])) {
          quantity =  parseInt(drop.split("x")[1].trim());
          drop =  drop.split("x")[0].trim();
        } else {
          drop = dropstr.join('').trim()
        }
        let source = 'Legendary pet';
        pushdrop(quantity, drop, time, source); 
      } else if (find_text[i] == 'charming imp') {
        let index = 
            results.findIndex
            (element => element.includes(find_text[i]));
        let result = results[index];
        splittext = result.split(":");
        let hour = result.split(":")[0];
        let minute = result.split(":")[1];
        let second =  result.split(":")[2].replace("]","").split(" ")[0];
        let time = hour + ":" + minute + ":" + second;
        let drop = splittext[splittext.length-1].replace(".","");
        let quantity = drop.split("x")[0].trim();
        drop = drop.split("x")[1].trim();
        let source = 'Charming imp';
        //console.log(time, quantity, drop);
        pushdrop(quantity, drop, time, source); 
      } else if (find_text[i] == 'Spring') {
        let index = 
            results.findIndex
            (element => element.includes("coins have been added"));
        let result = results[index];
        let source = 'Spring cleaner';
        splittext = result.split(" ");
        let hour = result.split(":")[0];
        let minute = result.split(":")[1];
        let second =  result.split(":")[2].replace("]","").split(" ")[0];
        let time = hour + ":" + minute + ":" + second;
        let quantity = splittext[1].replace(",","");
        let drop = 'coins';
        //console.log(time, quantity, drop);
        pushdrop(quantity, drop, time, source);
      }


    }
    }
  }
 

  function showItems() {
    $(".itemList").empty();
    $(".itemList").append(`<li class="list-group-item total">Total Drops Logged: <span style="font-weight:bold">${JSON.parse(localStorage.getItem("serenData")).length}</span></li>`);
    if (localStorage.getItem("serenTotal") === "total") {
      $(".itemList").append(`<li class="list-group-item header" data-show="history" title="Click to show History">Item Totals</li>`);
      let total = getTotal();
      Object.keys(total).sort().forEach(item => $(".itemList").append(`<li class="list-group-item">${item}: ${total[item]}</li>`))
    } else {
      $(".itemList").append(`<li class="list-group-item header" data-show="total" title="Click to show Totals">Item History</li>`);
      saveData.slice().reverse().map(item => {
        $(".itemList").append(`<li class="list-group-item" title="${new Date(item.time).toLocaleString()}">${item.item}</li>`)
      })
    }
  }

  function checkAnnounce(getItem) {
    if (localStorage.serenAnnounce) {
      fetch(localStorage.getItem("serenAnnounce"),
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: "Zero's Seren Tracker",
            content: `${new Date(getItem.time).toLocaleString()}: Received - ${getItem.item}`
          })
        })
    }
  }

  //Function to determine the total of all items recorded.
  function getTotal() {
    let total = {};
    saveData.forEach(item => {
      data = item.item.split(" x ");
      total[data[1]] = parseInt(total[data[1]]) + parseInt(data[0]) || parseInt(data[0])
    })
    return total;
  }

  $(function () {

    $(".chat").change(function () {
      reader.pos.mainbox = reader.pos.boxes[$(this).val()];
      showSelectedChat(reader.pos);
      localStorage.setItem("serenChat", $(this).val());
      $(this).val("");
    });

    $(".export").click(function () {
      var str, fileName;
      //If totals is checked, export totals
      if (localStorage.getItem("serenTotal") === "total") {
        str = "Qty,Item\n";
        let total = getTotal();
        Object.keys(total).sort().forEach(item => str = `${str}${total[item]},${item}\n`);
        fileName = "serenTotalExport.csv";

        //Otherwise, export list by item and time received.
      } else {
        str = "Item,Time\n"; // column headers
        saveData.forEach((item) => {
          str = `${str}${item.item},${new Date(item.time).toLocaleString()}\n`;
        });
        fileName = "serenHistoryExport.csv"
      }
      var blob = new Blob([str], { type: "text/csv;charset=utf-8;" });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, fileName);
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", fileName);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });

    $(".clear").click(function () {
      localStorage.removeItem("serenData");
      localStorage.removeItem("serenChat");
      localStorage.removeItem("serenTotal");
      location.reload();
    })

    $(document).on("click", ".header", function () {
      localStorage.setItem("serenTotal", $(this).data("show")); showItems()
    })
  });
}, 50)

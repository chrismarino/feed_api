// @ts-nocheck
function cgValidatorsRefresh() {

  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "cad" }

  var urls = [
    'https://ethstaker.tax/api/v1/indexes_for_eth1_address?eth1_address=0x635D06a61a36566003D71428F1895e146CdBD54E'
  ];

  var count = safeGuardImportValidatorsJSON(urls, "db_validators");
  return count;

}

function cgValidatorsManualRefresh() {
  var count = cgValidatorsRefresh();
  var ui = SpreadsheetApp.getUi();

  switch (count) {
    case 0:
      uiMessage = "Hmmmm....something went wrong.";
      break;
    case 1:
      uiMessage = "Success! Updated the Validator list";
      break;
    default:
      uiMessage = "More than one url was provided. This is not supported yet.";
  }

  ui.alert("Price Refresh Status", uiMessage, ui.ButtonSet.OK);
}
function cgPricesRefresh() {

  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "cad" }

  var urls = [
    `http://67.188.178.24:5001/prices.json`
  ];

  var count = safeGuardImportPricesJSON(urls, "db_coingecko");
  return count;

}

function cgPricesManualRefresh() {
  var count = cgPricesRefresh();
  var ui = SpreadsheetApp.getUi();

  switch (count) {
    case 0:
      uiMessage = "Nothing was received from Coingecko. This can happen, try again in a few seconds";
      break;
    case 1:
      uiMessage = "Updated the Price DB with a single fetch";
      break;
    default:
      uiMessage = "Hmmm...took more than one fetch to get the data.";
  }

  ui.alert("Price Refresh Status", uiMessage, ui.ButtonSet.OK);
}

function cgGainsRefresh() {

  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "usd" }

  var urls = [
    `https://ethstaker.tax/api/v2/rewards`
  ];


 var data = {  "validator_indexes": [  983397, 810338  ],  "start_date": "2023-01-01",  "end_date": "2024-12-31"}
//var data = {  "validator_indexes": [ 439318, 581807, 584216, 728249, 1025169  ],  "start_date": "2022-01-01",  "end_date": "2024-12-31"}
  
  var payload = JSON.stringify(data)
  //var count = safeGuardImportGainsJSON(urls, "db_gains");
  var count = safeGuardImportGainsJSONviaPOST(urls, payload, "db_gains");
  //function ImportJSONViaPost(url, payload, fetchOptions, query, parseOptions) {
  return count;

}

function cgGainsManualRefresh() {
  var count = cgGainsRefresh();
  var ui = SpreadsheetApp.getUi();

  switch (count) {
    case 0:
      uiMessage = "Hmmm....didn't get the JSON. Something is wrong";
      break;
    case 1:
      uiMessage = "Updated the Gains DB with a single fetch";
      break;
    default:
      uiMessage = "Loaded more than one Minipool Gains";
  }

  ui.alert("Price Refresh Status", uiMessage, ui.ButtonSet.OK);
}

function testDiscord() {
  var ui = SpreadsheetApp.getUi();
  var ping = postMessageToDiscord();

  switch (ping) {
    case "SUCCESS":
      uiMessage = "Test successful! The Google Sheet was correctly linked to your discord.";
      break;
    case "ERROR_NO_VALID_WEBHOOK":
      uiMessage = `Test Failed. Please provide a valid webhook url in the sheet "SETTINGS".`;
      break;
    default:
      uiMessage = `Test Failed. there was a problem with the notification sent.`;
  }
  ui.alert("Discord Status", uiMessage, ui.ButtonSet.OK);
}

function storeRows2SheetTrigger() {

  var globalMetrics = prepareDataRange("total", [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);

  storeRows2Sheet(globalMetrics, "db_history");
}


function dailyAlertTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var discord = ss.getRangeByName("discord_webhook").getValue();
  var discord_daily_alert = ss.getRangeByName("discord_daily").getValue();

  if (discord && discord_daily_alert) {

    var globalMetrics = prepareDataRange("total", [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);

    var rawData = prepareDataRange("portfolio_detail");
    cryptoData = getDLCrypto(rawData);

    // Reporting Section : Global
    var payload = getTemplatePayload(globalMetrics, "daily_global");
    postMessageToDiscord(undefined, payload);

    // Reporting Section : Market
    var payload_market = getTemplatePayload(cryptoData, "daily_market");
    postMessageToDiscord(undefined, payload_market);

    // Reporting Section : Portfolio
    var payload_portfolio = getTemplatePayload(cryptoData, "daily_portfolio");
    postMessageToDiscord(undefined, payload_portfolio);
  }
}
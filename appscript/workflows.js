// @ts-nocheck
function cgDataRefresh() {

  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "cad" }

  var urls = [
    `http://67.188.178.24:5001/prices.json`,
    `http://67.188.178.24:5001/prices.json`
  ];

  var count = safeGuardImportJSON(urls, "db_coingecko");
  return count;

}

function cgDataManualRefresh() {
  var count = cgDataRefresh();
  var ui = SpreadsheetApp.getUi();

  switch (count) {
    case 0:
      uiMessage = "Nothing was received from Coingecko. This can happen, try again in a few seconds";
      break;
    case 1:
      uiMessage = "New crypto prices were partially refreshed. Try again in a few seconds";
      break;
    default:
      uiMessage = "Success! Your Top500 crypto data has been refreshed";
  }

  ui.alert("Price Refresh Status", uiMessage, ui.ButtonSet.OK);
}

function cgGainsRefresh() {

  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "usd" }

  var urls = [
    `https://ethstaker.tax/api/v2/rewards`
  ];


  var data = {  "validator_indexes": [  810338, 983397  ],  "start_date": "2023-01-01",  "end_date": "2023-12-22"}
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
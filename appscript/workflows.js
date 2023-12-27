// @ts-nocheck
function cgValidatorsRefresh() {
  /**
   * This function will fetch the list of validators from the ethstaker.tax API. It return an array of validator indexes, that then
   * is be used to fetch the gains for each validator. Also updated the minipool count used for other sheet calculations.
   */
  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  var nodeAddress = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("node_address").getValue();
  if (!(currency)) { currency = "usd" }
  var urlstring = 'https://ethstaker.tax/api/v1/indexes_for_eth1_address?eth1_address='
  var urls = [urlstring.concat(nodeAddress)];
  // Validator list get pulled and posted to the top of the gains sheet, which makes all the gains calculations.
  var validator_list = safeGuardImportValidatorsJSON(urls, "gains");
  var validator_count = validator_list.length
  SpreadsheetApp.getActiveSpreadsheet().getRangeByName("minipool_count").setValue(validator_count)
  return validator_list;

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

  ui.alert("Validator Refresh Status", uiMessage, ui.ButtonSet.OK);
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
  /**
   * This function will reset the validator gain data in the 'gains' sheet then fetch the current list of validators on the node. 
   * From this list, it pulls the gain history for each validator and puts it in the "db_gains" sheet. It then calls updateGains to 
   * insert the current validator set into the 'gains' sheet.
   */
  cgResetGains();
  var currency = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fiat_currency").getValue();
  if (!(currency)) { currency = "usd" }
  var urls = [`https://ethstaker.tax/api/v2/rewards`];
  var validator_indexes = cgValidatorsRefresh();
  // Update the gains sheet by removing the columns that don't have validators
  cgClearUnusedGains(validator_indexes.length);
  var data = { "validator_indexes": validator_indexes, "start_date": "2023-01-01", "end_date": "2024-12-31" }
  var payload = JSON.stringify(data)
  var count = safeGuardImportGainsJSONviaPOST(urls, payload, "db_gains");

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

  ui.alert("Gains Refresh Status", uiMessage, ui.ButtonSet.OK);
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

function storeCol2SheetTrigger() {

  var globalMetrics = prepareDataRange("gain_calculations", [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
  var sourceRange = ss.getRangeByName(sourceRangeName).getValues();

  sourceRange = filterRowsRange(sourceRange);

  sourceRange = resizeColsRange(sourceRange, selectCols);

  storeCols2Sheet(globalMetrics, "gains_template");
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

function cgClearUnusedGains() {
  // The ResetGains functions fills out the whole spreadsheet and we need to remove the columns that 
  // don't have validator ID.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var currentMPCount = ss.getRangeByName('minipool_count').getValue();
  var targetSheet = ss.getSheetByName('gains');
  //Clear out the existing values in the sheet
  var trows = 19 // the number of rows in the template
  var ccols = 25 - currentMPCount // the number of columns to clear
  var rowPosition = 1 // the start position to clear
  var colPosition = 2 + currentMPCount // the start position to clear
  targetSheet.getRange(rowPosition, colPosition, trows, ccols).clearContent();
  return;
}

function cgResetGains() {
  // Copies a full sheet of validator calculations from the template (max 25). 
  // cgClearGains is called later to clear out the excess columns
  //The template dimensions...
  var rowPosition = 1 // the start position to clear
  var colPosition = 2 // the start position to clear
  var trows = 19 // the number of rows in the template
  var tcols = 25 // the number of columns in the temmplate
  var ss = SpreadsheetApp.getActiveSpreadsheet();
// Copy the values from the source sheet to the target sheet
  var sourceRange = ss.getRangeByName('gain_calculations').getFormulas()
  var sourceFormats = ss.getRangeByName('gain_calculations').getNumberFormats()
  var targetSheet = ss.getSheetByName('gains');
  targetSheet.getRange(rowPosition, colPosition, trows, tcols).setValues(sourceRange)
  targetSheet.getRange(rowPosition, colPosition, trows, tcols).setNumberFormats(sourceFormats);
  return;
}
function discordTMPL_dailyPortfolio(dl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var top5_assets = sortBy(dl, "current_val").slice(0, 5);
  var top5_gains = sortBy(dl, "roi_change").slice(0, 5);
  var top5_loss = sortBy(dl, "roi_change", false).slice(0, 5);
  var top5_24hchange = sortBy(dl, "change24h").slice(0, 5);
  var last5_24hchange = sortBy(dl, "change24h", false).slice(0, 5);

  var nb_crypto = dl.length;

  var payload = {
    embeds: [
      {
        title: "PORTFOLIO OVERVIEW",
        url: ss.getUrl(),
        timestamp: new Date(),
        description: "",
        fields: [
          {
            name: `:trophy: Top5 Biggest Assets :trophy:`,
            value: top5_assets
              .map((el, i) => `- ${":black_circle:".repeat(i)}${":star:".repeat(5 - i)} ${el.markdown_link} **${beautify(el.current_val, false)}$** (${beautify(el.roi)}$)`)
              .join('\n'),
            inline: false
          },
          {
            name: `:trophy: Top5 GAINS :trophy:`,
            value: top5_gains
              .map((el, i) => `- ${":black_circle:".repeat(Math.round(i / 2))}${":star:".repeat(Math.round((5 - i) / 2))} ${el.markdown_link} **${beautify(el.roi)}$** (${beautify(el.roi_change, true, true, 0)}%)`)
              .join('\n'),
            inline: true
          },
          {
            name: `:skull: Top5 LOSSES :skull:`,
            value: top5_loss
              .map((el, i) => `- ${":black_circle:".repeat(Math.round(i / 2))}${":ghost:".repeat(Math.round((5 - i) / 2))} ${el.markdown_link} **${beautify(el.roi)}$** (${beautify(el.roi_change, true, true, 0)}%)`)
              .join('\n'),
            inline: true
          },
          {
            name: `:trophy: Top5 CHANGE 24H :trophy:`,
            value: top5_24hchange
              .map((el, i) => `- ${":black_circle:".repeat(i)}${":star:".repeat(5 - i)} ${el.markdown_link} **${beautify(el.change24h, true, true)}%** (low = ${beautify(el.low, false)}$ > **${beautify(el.price, false)}$** > max = ${beautify(el.high, false)}$)`)
              .join('\n'),
            inline: false
          },
          {
            name: `:skull: Last5 CHANGE 24H :skull:`,
            value: last5_24hchange
              .map((el, i) => `- ${":black_circle:".repeat(i)}${":ghost:".repeat(5 - i)} ${el.markdown_link} **${beautify(el.change24h, true, true)}%** (low = ${beautify(el.low, false)}$ > **${beautify(el.price, false)}$** > max = ${beautify(el.high, false)}$)`)
              .join('\n'),
            inline: false
          }
        ],
        footer: {
          text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`
        }
      }
    ]
  };
  return payload;
}
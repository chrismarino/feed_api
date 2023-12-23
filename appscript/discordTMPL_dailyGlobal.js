function discordTMPL_dailyGlobal(dl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var dl = dl[0];
  var datalayer = {
    "date": dl[0],
    "url": ss.getUrl(),
    "kpi_24h_change": (dl[1] * 100).toFixed(2) || "",
    "kpi_24h_amount": dl[2].toFixed(2) || "",
    "kpi_24h_delta": dl[11].toFixed(2) || "",
    "kpi_top500_1h_change": (dl[10] * 100).toFixed(2) || "",
    "kpi_top500_24h_change": (dl[9] * 100).toFixed(2) || "",
    "kpi_top500_7d_change": (dl[8] * 100).toFixed(2) || "",
    "kpi_top500_30d_change": (dl[7] * 100).toFixed(2) || "",
    "kpi_net_worth": dl[6].toFixed(2) || "",
    "kpi_deposit": dl[5].toFixed(2) || "",
    "display_currency": "CAD" || "",
    "kpi_roi": dl[3].toFixed(2) || "",
    "kpi_roi_change": (dl[4] * 100).toFixed(2) || "",
  };

  let increaseTrend = (datalayer["kpi_24h_change"] > 0 ? true : false);

  var payload = {
    embeds: [
      {
        color: (increaseTrend ? 0x0099ff : 0xf08d49),
        title: `**${datalayer["date"]}** - Global Daily Reporting (**${(datalayer["kpi_24h_change"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_24h_change"]).toLocaleString('fr')}%**)`,
        url: datalayer["url"],
        timestamp: new Date(),
        description: `${(increaseTrend ? "Great, your portfolio has gained" : "Ouch, your portfolio lost")} **${parseFloat(datalayer["kpi_24h_amount"]).toLocaleString('fr')} ${datalayer["display_currency"]}** in the last 24h. Here is a quick overview of your actual performances:`,
        fields: [
          {
            name: `Currency`,
            value: datalayer["display_currency"],
            inline: true
          },
          {
            name: `Investment`,
            value: parseFloat(datalayer["kpi_deposit"]).toLocaleString('fr'),
            inline: true
          },
          {
            name: `Net Worth`,
            value: parseFloat(datalayer["kpi_net_worth"]).toLocaleString('fr'),
            inline: true
          },
          {
            name: `Market Delta (Δ)`,
            value: (datalayer["kpi_24h_delta"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_24h_delta"]).toLocaleString('fr'),
            inline: true
          },
          {
            name: `Gains/Loss`,
            value: (datalayer["kpi_roi"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_roi"]).toLocaleString('fr'),
            inline: true
          },
          {
            name: "ROI %",
            value: (datalayer["kpi_roi_change"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_roi_change"]).toLocaleString('fr') + "%",
            inline: true
          },
          {
            name: "24H %",
            value: (datalayer["kpi_top500_24h_change"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_top500_24h_change"]).toLocaleString('fr') + "%",
            inline: true
          },
          {
            name: "7D %",
            value: (datalayer["kpi_top500_7d_change"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_top500_7d_change"]).toLocaleString('fr') + "%",
            inline: true
          },
          {
            name: "30D %",
            value: (datalayer["kpi_top500_30d_change"] > 0 ? "+" : "") + parseFloat(datalayer["kpi_top500_30d_change"]).toLocaleString('fr') + "%",
            inline: true
          }
        ],
        footer: {
          text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`
        }
      }
    ]
  };
  return payload
}
#!/bin/sh
DATE=$(date)
# Date in format DAY##-MONTH##-YEAR####
cd /usr/local/src/projects/feed_api
curl -o /usr/local/src/projects/feed_api/prices.json https://api.coingecko.com/api/v3/coins/markets\?vs_currency\=usd\&order\=market_cap_desc\&sparkline\=false\&price_change_percentage\=1h%2C24h%2C7d%2C30d\&per_page\=125
cp /usr/local/src/projects/feed_api/prices.json /usr/local/src/projects/feed_api/public/prices.json
echo 'Pulling price info' $DATE >> /usr/local/src/projects/feed_api/public/price.log


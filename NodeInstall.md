# Install Node and npm on Ubuntu 20.04
## Install Node.js using nvm
### Step 1: Install nvm
```
sudo apt update
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
### Step 2: Install Node.js and npm
```
nvm install node
```
Check the Node.js version
```
node --version
```
Check which versions are available for installation
```
nvm list
```

### Step 3: Clone the api server repo
```
git clone https://github.com/chrismarino/feed_api.git
```
Install the dependencies and start the server
```
cd feed_api
npm install
npm start
```
## Step 4: Open firewall and forward port
 Google Cloud Platform will need access to this server.  Open the firewall and forward port 5001 to the server's IP address.

```
sudo ufw allow 5001/udp comment 'Open a port for the API server'
sudo ufw allow 5001/tcp comment 'Open a port for the API server'
```
Configure your router to forward port 5001 to the server's IP address.

If everything is working, you should be able to access the API server from the internet at http://<server_public_ip>:5001. You should the Welcome message.  No json data will be returned until you execute the App Scripts that populate the database.

To avoid needing a terminal open to your server, you may want to start the server from a remote machine. To kill this process, you will need to ssh into the server and kill the process.  You can also start the server in the background and exit the ssh session.  The following command will start the server in the background and exit the ssh session.


```
ssh -n -f <user@host> "sh -c 'cd /<full path>/feed_api; nohup /<full path>/feed_api/start_api.sh'"
```
### Step 5: Set up the cron job

The cron job will fetch the price data from coingecko.com and store it as `prices.json`.  This file gets overwritten every time. A price history is maintained in the Google Sheet.

The cron job will run every 5 minutes.  The cron job will also run the script that will send the price data to the Google Sheet.

```
*/5 * * * * bash /usr/local/src/projects/feed_api/updateprices.cron.sh
```

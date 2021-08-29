# Polly - simple Discord poll bot
## Requirements
* Git
* MongoDB server
* NodeJS v16 or higher
* PM2
* Discord bot account

## Setup
1. Navigate to destination folder and open a terminal. Run `git clone https://github.com/nikita-e/polly.git`.
2. Open config.json and edit bot token. You may change other settings optionally.
3. Run `pm2 start index.js --name "polly"` in the terminal.
4. Invite the bot. You can get link from logs.

## Updating Polly
Open a terminal, navigate to installation directory and run: `git fetch origin && git merge origin`

IRC Bridge Bot

Sits in two channels and relays chat (privmsgs only) between the two channels.

## Usage

There are two options. The first is to use this as a program.

```bash
npm install -g irc-bridge-bot
irc-bridge irc.first-server.net#channel irc.second-server.net#channel &
```

The second is to download this repository and run bot.js with the
arguments passed to irc-bridge.

If you need to make modifications to the bot, the second is preferred.

## Logging

This bot is silent.

## Configuration

See config.json for the configuration of this bot.
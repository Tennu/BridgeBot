#! /usr/bin/env node
// bot.js server#chan server2#chan

const assign = require('lodash').defaults;
const Client = require('tennu').Client;
const mainconfig = require('./config.json');
const inspect = require('util').inspect;
const program = require('commander');

program
    .version('1.0.0')
    .usage('[options] <server1#chan1> <server2#chan2>')
    .option('-n', '--nickname [nickname]', 'Bot\'s nickname')
    .option('-u', '--username [username]', 'Bot\'s username')
    .option('-r', '--realname [realname]', 'Bot\'s realname')
    .parse(process.argv);

// This isn't working. :(
const names = (function () {
    const config = {};

    console.log(inspect(program));

    console.log(program.nickname);
    console.log(process.username);

    if (program.nickname) {
        config.nickname = program.nickname;
    }

    if (program.username) {
        config.username = program.username;
    }

    if (program.realname) {
        config.realname = program.realname;
    }

    return config;
}());

const clients = program.args.map(function (server) {
    const server_chan = server.split(/#/g);

    return {
        server: server_chan[0],
        channels: ['#' + server_chan[1]]
    };
}).map(function (config) {
    return assign({}, mainconfig, names, config);
}).map(function (config) {
    return Client(config);
});

// Relay between first channel and second.
clients[0].on('privmsg', function (privmsg) {
    if (privmsg.isQuery) {
        return;
    }

    clients[1].say(format('<%s> %s'), privmsg.nickname, privmsg.message);
});

// Relay between second channel and first.
clients[1].on('privmsg', function (privmsg) {
    if (privmsg.isQuery) {
        return;
    }

    clients[0].say(format('<%s> %s'), privmsg.nickname, privmsg.message);
});

// Disabled while getting commander working.
/*
clients.forEach(function (client) {
    client.connect();
});
*/
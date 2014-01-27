#! /usr/bin/env node

const assign = require('lodash').defaults;
const Client = require('tennu').Client;
const mainconfig = require('./config.json');
const inspect = require('util').inspect;
const format = require('util').format;
const program = require('commander');

// Mutating String's prototype is evil, so this program is evil.
if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    };
}

program
    .version('1.0.0')
    .usage('[options] <server1#chan1> <server2#chan2>')
    .option('-n, --nickname [nickname]', 'Bot\'s nickname')
    .option('-u, --username [username]', 'Bot\'s username')
    .option('-r, --realname [realname]', 'Bot\'s realname')
    .parse(process.argv);

const names = (function () {
    const config = {};

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

const clients = program.args.map(function (server, ix) {
    const server_chan = server.split('#');

    program.args[ix] = {
        server: server_chan[0],
        channel: '#' + server_chan[1]
    }

    return {
        server: program.args[ix].server,
        channels: [program.args[ix].channel]
    };
}).map(function (config) {
    return assign({}, config, names, mainconfig);
}).map(function (config) {
    //console.log(inspect(config));
    return Client(config);
});

function relay (cix) {
    const channel = program.args[cix].channel;

    return function (privmsg) {
        if (privmsg.isQuery) {
            return;
        }

        var toSay;

        if (privmsg.message.charCodeAt(0) === 1) {
            if (!privmsg.message.startsWith('\u0001ACTION')) {
                return // Unknown CTCP
            }

            toSay = format('* %s %s', privmsg.nickname, privmsg.message.slice(8, -1));
        } else {
            // Not CTCP
            toSay = format('<%s> %s', privmsg.nickname, privmsg.message);
        }

        console.log(format('%s-%s: %s', cix, channel, toSay));
        clients[cix].say(channel, toSay);
    };
}

clients[0].on('privmsg', relay(1));
clients[1].on('privmsg', relay(0));

clients.forEach(function (client) {
    client.connect();
});
import {Terminal} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {AttachAddon} from '@xterm/addon-attach';
import {CanvasAddon} from '@xterm/addon-canvas';

import '@xterm/xterm/css/xterm.css';
import './style.css';

function setup() {
    // setup terminal

    let term = new Terminal();

    term.loadAddon(new CanvasAddon());

    let fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(document.getElementById('terminal'));
    fitAddon.fit();
    window.addEventListener('resize', ()=>{
        fitAddon.fit();
    });

    term.attachCustomKeyEventHandler((e) => {
        // Ctrl + Shift + C, to prevent browser from opening devtools
        if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            document.execCommand('copy');
        }
    });

    // load token

    let token = new URLSearchParams(window.location.search).get('token');
    window.history.replaceState({}, null, '/');

    if(token) {
        localStorage.setItem('token', token);
    } else {
        token = localStorage.getItem('token') || '';
    }

    let uid = parseInt(token.split(':')[0]);

    if(!uid) {
        term.writeln('');
        term.writeln('\n--- Token 无效，请从比赛平台重新进入 ---');
        return;
    }

    // init anticheat

    let anticheat_canary = (() => {
        let canary = document.cookie.includes('anticheat_canary=') ?
            document.cookie.split('anticheat_canary=')[1].split(';')[0].substring(0, 100) :
            document.cookie.substring(0, 150);
        return `ggac-${uid}-${canary}`;
    })();

    function make_html(s) {
        let container = document.createElement('span');
        container.textContent = s;
        container.style.fontFamily = `"${CSS.escape(anticheat_canary)}", monospace`;
        return container.outerHTML;
    }

    document.addEventListener('copy', (e)=>{
        let selection = term.getSelection();
        e.preventDefault();
        e.clipboardData.setData('text/plain', selection);
        e.clipboardData.setData('text/html', make_html(selection));
    });

    // open socket

    let socket = new WebSocket(location.origin.replace(/^http/, 'ws') + '/shell');
    term.loadAddon(new AttachAddon(socket));

    let firstmsg = true;
    socket.addEventListener('open', ()=>{
        term.clear();
    });
    socket.addEventListener('close', ()=>{
        term.writeln('');
        term.writeln('\n--- 连接中断 ---');
    });
    socket.addEventListener('message', ()=>{
        if(firstmsg) {
            firstmsg = false;
            socket.send(token + '\n');
        }
    });

    term.writeln('');
    term.writeln('\n--- 正在连接到题目 ---');

    // done

    window.term = term;
    window.socket = socket;

    queueMicrotask(console.log.bind(
        console,
        '%c网页终端不是题目的一部分，解出题目无需分析网页终端的源码。\n可以绕过网页终端，使用 netcat 或 pwntools 等任何工具连接到本题目。',
        'font-size: 1.5em; background-color: yellow; color: black; font-weight: bold; padding: .5em',
    ));
    queueMicrotask(console.log.bind(
        console,
        '\n如果你仍然想用网页终端解题，可以借助全局变量 socket。\n例如通过 socket.send("...\\n"); 和 socket.onmessage = console.log; 来与题目交互。\n\n',
    ));
    term.focus();
}

setup();
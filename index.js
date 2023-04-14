const { Client } = require('discord.js-selfbot-v13');
var figlet = require('figlet');
var colors = require('colors');
const client = new Client({ checkUpdate: false });
const axios = require('axios');
const fs = require('fs');
const inquirer = require('inquirer');

process.title = '147 Multi-tool | by byy#0001'

const per = require('readline').createInterface({
  input: process.stdin
  , output: process.stdout
});

//inicia o client
client.on('ready', async () => {
  async function loop() {
    console.clear()
    figlet.text(client.user.username, {
      font: 'Bloody'
      ,
    }, function (err, data) {
      if (err) {
        console.log('algum erro no input');
        console.dir(err);
        return;
      }
      console.log(colors.red(data));
      console.log(colors.red('         feito por brunno#0375\n\n'))

      const options = [{
        name: '[+] Abrir todas as DMs e apagar'
        , value: 'opção_1'
      }, {
        name: '[+] Apagar mensagens das DMs abertas'
        , value: 'opção_2'
      }, {
        name: '[+] Apagar mensagens de um canal/usuário'
        , value: 'opção_3'
      }, {
        name: '[+] Remover todos os amigos'
        , value: 'opção_4'
      }, {
        name: '[+] Remover pedidos de amizade'
        , value: 'opção_5'
      }, {
        name: '[+] Apagar mensagens com todos (package)'
        , value: 'opção_6'
      }, {
        name: '[+] Anti-DM'
        , value: 'opção_7'
      }];

      inquirer.prompt([{
        type: 'list'
        , name: 'option'
        , message: 'Escolha uma opção:'
        , choices: options
        ,
      }]).then(async answers => {
        const { option } = answers;
        console.clear()
        if (option == 'opção_1') {
          var amigos = await pegar_amigos();

          if (amigos.length <= 0) return console.log(colors.red('[x] você não possui amigos na sua lista')), esperarkk('\nAguarde 5 segundos...')
          for (var usr of amigos) {
            if (usr) {
              var us = await client.users.fetch(usr.id).catch(() => { })
              await new Promise(resolve => setTimeout(resolve, 1000));
              await us?.createDM().then(async dm => {
                var todas_msg = await fetch_msgs(dm.id)
                const breakerror = {}
                let contador = 1
                try {
                  for (var msg of todas_msg) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    contador++
                    console.log(colors.green(
                      `[=] foram apagadas o total de ${contador} de ${todas_msg.length} com o usuário ${dm.recipient.username}`))
                    await msg.delete().catch((e) => {
                      if (e.message == "Could not find the channel where this message came from in the cache!") {
                        throw breakerror;
                      }
                    })
                  }
                  await fechar_dm(dm.id)
                } catch (e) {
                  if (e !== breakerror) throw e;
                }
              })
            }
          }
          esperarkk(`\n\n[!] terminei de limpar todas as dms, voltando para o inicio, aguarde 5 segundos...`)
        } else if (option == 'opção_2') {
          var tds_dm = await client.channels.cache.filter(c => c.type == "DM").map(a => a.recipient.id)
          if (tds_dm.length <= 0) return console.log(colors.red('[x] você não possui dms abertas')), esperarkk('\nAguarde 5 segundos...')
          for (var usr of tds_dm) {
            let contador = 1;
            let nome;
            let canal = client.channels.cache.get(usr)
            if (!canal) {
              var usr = await client.users.fetch(usr).catch(e => {
                console.log(colors.red('[x] Não consegui ver a dm com esse usuário'))
              })
              await usr.createDM().then(dmchannel => {
                id = dmchannel.id
                nome = usr.username
              }).catch(e => {
                console.log(colors.red('[x] Não consegui ver a dm com esse usuário'))
              })
            } else {
              nome = (canal.type == "GROUP_DM") ? "DM" : canal.name
            }
            var todas_msg = await fetch_msgs(id)
            if (!todas_msg.length) console.log(colors.red(`[x] Sem mensagens na dm com o usuário ${nome}`)), await fechar_dm(id)
            for (var nuts of todas_msg) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              await nuts.delete().then(kk => {
                console.log(colors.green(`[=] foram apagadas o total de ${contador} de ${todas_msg.length} com o usuário ${nome}`))
                contador++
              }).catch((e) => { console.log(e) })
            }
            await fechar_dm(id)
          }
          esperarkk(`\n\n[!] terminei de limpar todas as dms, voltando para o inicio, aguarde 5 segundos...`)
        } else if (option == 'opção_3') {
          inquirer.prompt([{
            type: 'message'
            , name: 'option'
            , message: '[=] insira o ID do canal/usuário:'
            ,
          }]).then(async answers => {
            console.clear()
            let contador = 1;
            let nome;
            let canal = client.channels.cache.get(answers.option)
            if (!canal) {
              var usr = await client.users.fetch(answers.option).catch(e => {
                console.log(colors.red('[x] Não consegui ver a dm com esse usuário'))
              })
              await usr.createDM().then(dmchannel => {
                id = dmchannel.id
                nome = usr.username
              }).catch(e => {
                console.log(colors.red('[x] Não consegui ver a dm com esse usuário'))
              })
            } else {
              nome = (canal.type == "GROUP_DM") ? "DM" : canal.name
            }
            var todas_msg = await fetch_msgs(id)
            if (!todas_msg.length) console.log(colors.red(`[x] Sem mensagens na dm com o usuário ${nome}`)), await fechar_dm(id)
            for (var nuts of todas_msg) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              await nuts.delete().then(kk => {
                console.clear()
                console.log(colors.green(`[=] foram apagadas o total de ${contador} de ${todas_msg.length} com o usuário ${nome}`))
                contador++
              }).catch((e) => { console.log(e) })
            }
            await fechar_dm(id)
            esperarkk(`\n\n[!] terminei de limpar todas as dms, voltando para o inicio, aguarde 5 segundos...`)
          })
        } else if (option == 'opção_4') {
          let contador = 1;
          var amigos = await pegar_amigos();

          for (var kk of amigos) {
            if (kk.type === 1) {
              try {
                await new Promise(resolve => setTimeout(resolve, 2000))
                axios.delete(`https://discord.com/api/v9/users/@me/relationships/${kk.id}`, {
                  headers: {
                    'Authorization': client.token
                  }
                })
                console.log(colors.green(`[-] ${contador} amizades removidas com sucesso`))
                contador++
              } catch { }
            }
          }
          esperarkk(`\n\n[!] terminei de remover os amigos...`)
        } else if (option == 'opção_5') {
          let contador = 1;
          var amigos = await pegar_amigos();

          for (var kk of amigos) {
            if (kk.type === 3) {
              try {
                await new Promise(resolve => setTimeout(resolve, 2000))
                axios.delete(`https://discord.com/api/v9/users/@me/relationships/${kk.id}`, {
                  headers: {
                    'Authorization': client.token
                  }
                })
                console.log(colors.green(`[-] ${contador} pedidos de amizade removidas com sucesso`))
                contador++
              } catch { }
            }
          }
          esperarkk(`\n\n[!] terminei de remover os pedidos de amizade...`)
        } else if (option == 'opção_6') {
          esperarkk('[!] apenas para desenvolvedores kkk')
        } else if (option == "opção_7") {
          await menu7()
        }
      })
    })
  }
  return loop()

  //funções 
  async function menu7() {
    const { selectedOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedOption',
        message: 'Escolha uma opção',
        choices: ['Ligar/Desligar', 'Voltar ao menu'],
      },
    ]);

    if (selectedOption === 'Ligar/Desligar') {
      const ativado = !pegar_status();
      atualizar_status(ativado);
      console.clear();
      console.log(`Status do Anti-DM: ${ativado ? '\x1b[32m[ON]\x1b[0m' : '\x1b[31m[OFF]\x1b[0m'}`);
      await menu7();
    } else if (selectedOption === 'Voltar ao menu') {
      return console.clear(), esperarkk('');
    } else {
      return console.clear(), esperarkk('');
    }
  }
  //função para retornar ao menu
  function esperarkk(fofokk) {
    console.log(fofokk);
    setTimeout(function () {
      return loop();
    }, 5000);
  }
});

async function fetch_msgs(canal) {
  const canall = client.channels.cache.get(canal);
  let ultimoid;
  let messages = [];

  while (true) {
    const fetch_mensagens = await canall.messages.fetch({
      limit: 100,
      ...(ultimoid && { before: ultimoid }),
    });

    if (fetch_mensagens.size === 0) {
      return messages.filter(msg => msg.author.id == client.user.id && !msg.author.system && !msg.system);
    }

    messages = messages.concat(Array.from(fetch_mensagens.values()));
    ultimoid = fetch_mensagens.lastKey();
  }
}

async function pegar_amigos() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return axios.get('https://discord.com/api/v9/users/@me/relationships', {
    headers: {
      'Authorization': client.token,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6InB0LUJSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzExMC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTEwLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJkaXNjb3JkLmNvbSIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjoxODU1MTYsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImRlc2lnbl9pZCI6MH0=',
      'Referer': 'https://discord.com/channels/@me'
    }
  }).then(res => { return res.data }).catch(() => { })
}

async function fechar_dm(dm) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  await axios.delete(`https://discord.com/api/v9/channels/${dm}`, {
    headers: {
      'Authorization': client.token
    }
  }).catch(() => { })
}

function pegar_status() {
  return require('./config.json').ativado;
}

function atualizar_status(arg) {
  const stat = { ativado: Boolean(arg), token: client.token };
  fs.writeFileSync('config.json', JSON.stringify(stat, null, 2));
}
//evento para detectar a dm
client.on('channelCreate', async (channel) => {
  if (!pegar_status()) return;

  if (channel.type == "GROUP_DM") {
    await channel.delete();
  }
});

client.login(require('./config.json').token);

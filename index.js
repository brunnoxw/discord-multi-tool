const { Client } = require('discord.js-selfbot-v13');
var figlet = require('figlet');
var colors = require('colors');
const client = new Client({ checkUpdate: false });
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

const inquirer = require('inquirer');
const open = require('open')

const per = require('readline').createInterface({
  input: process.stdin
  , output: process.stdout
});

client.on('ready', async () => {
  async function loop() {
    console.clear()
    figlet.text(client.user.username, {
      font: 'ivrit'
      ,
    }, async function (err, data) {
      if (err) {
        console.log('algum erro no input');
        console.dir(err);
        return;
      }
      console.log(colors.red(data));
      console.log(colors.red(`${await checkUpdate()}\n\n`))
      process.title = `147 Multi-tool | ${await checkUpdate()}`

      const options = [{
        name: '[+] Abrir todas as DMs e apagar (amigos)'
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
        name: '[+] Mover/desconectar todos de um canal de voz'
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
          //console.log(amigos)
          if (amigos.length <= 0) return console.log(colors.red('[x] você não possui amigos na sua lista')), esperarkk('\nAguarde 5 segundos...')
          for (var usr of amigos) {
            if (usr) {
              var us = await client.users.fetch(usr.id).catch(() => { })
              await new Promise(resolve => setTimeout(resolve, 1000));
              await us?.createDM().then(async dm => {
                var todas_msg = await fetch_msgs(dm.id)
                if (todas_msg.length == 0) console.log(colors.red(`[x] Sem nenhuma mensagem com o usuário ${dm.recipient.username}, indo pra proxima`))
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
              var usr = await client.users.fetch(usr).catch(() => {
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
          inquirer.prompt([
            {
              type: 'list',
              name: 'option',
              message: '[=] Selecione uma opção:',
              choices: ['[x] Apenas apagar DM com o usuário', '[x] Salvar DM', '[x] Cancelar']
            }
          ]).then(async firstAnswers => {
            console.clear();
        
            if (firstAnswers.option === '[x] Cancelar') {
              return console.log(colors.red(`[x] operação cancelada com sucesso, voltando ao inicio, aguarde 5 segundos...`)), esperarkk('');
            }
        
            console.clear();
            inquirer.prompt([
              {
                type: 'input',
                name: 'id',
                message: '[=] Insira o ID do canal/usuário:',
                when: function (answers) {
                  return answers.option !== '[x] Cancelar';
                }
              }
            ]).then(async secondAnswers => {
              console.clear();
              let contador = 1;
              let nome;
              var id = secondAnswers.id;
        
              let canal = await client.channels.cache.get(id);
              if (!canal) {
                var usr = await client.users.fetch(id).catch(err => { });
                if (!usr) {
                  return console.log(colors.red('[x] O ID fornecido é inválido')), esperarkk(`\n\n[!] Voltando ao início, aguarde 5 segundos...`);
                }
        
                await usr?.createDM().then(dmchannel => {
                  id = dmchannel.id;
                  nome = usr.username;
                }).catch(e => {
                  console.log(colors.red('[x] Não consegui ver a DM com esse usuário'));
                });
              } else {
                if (canal?.recipient?.username) {
                  nome = (canal.type == 'GROUP_DM') ? 'DM' : canal.recipient.username;
                } else {
                  nome = (canal.type == 'GROUP_DM') ? 'DM' : canal.name;
                }
              }
        
              if (firstAnswers.option === '[x] Apenas apagar DM com o usuário') {
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'mode',
                    message: '[+] Selecione o modo:',
                    choices: ['[+] Modo bomba (mais rápido, porém mais instável)', '[+] Modo normal (mais estável, porém mais lento)']
                  }
                ]).then(async modeAnswer => {
                  if (modeAnswer.mode === '[+] Modo bomba (mais rápido, porém mais instável)') {
                    const msg_grupo = 5;
                    const messages = await fetch_msgs(id);
                  if (messages.length === 0) {
                      return console.clear(), console.log(colors.red(`${nome == 'DM' ? `[x] Sem mensagens nessa DM` : `[x] Não encontrei nenhuma mensagem sua com ${nome}`}`)), await fechar_dm(id), esperarkk(`\n\n[!] Voltando ao início, aguarde 5 segundos...`);
                    }
                  
                    for (let i = 0; i < messages.length; i += msg_grupo) {
                      const grupo = messages.slice(i, i + msg_grupo);
                  
                      for (const message of grupo) {
                        await message.delete().then(() => {
                          contador++; 
                          console.clear();
                          console.log(colors.green(`${nome == 'DM' ? `[=] Foram apagadas o total de ${contador} de ${messages.length} em uma ${nome}` : `[=] Foram apagadas o total de ${contador} de ${messages.length} mensagens com o usuário ${nome}`}`));
                        }).catch((e) => {
                          console.log(e);
                        });
                      }
                  
                      if (i + msg_grupo < messages.length) {
                        await new Promise(resolve => setTimeout(resolve, 4000)); 
                      }
                    }
                  
                    await fechar_dm(id);
                    esperarkk(`\n\n[!] Terminei de limpar todas as DMs, voltando para o início, aguarde 5 segundos...`);
                  } else if (modeAnswer.mode === '[+] Modo normal (mais estável, porém mais lento)') {
                    const delaykk = 1000; 
                    const todas_msg = await fetch_msgs(id);
                    if (todas_msg.length === 0) {
                      return console.clear(), console.log(colors.red(`${nome == 'DM' ? `[x] Sem mensagens nessa DM` : `[x] Não encontrei nenhuma mensagem sua com ${nome}`}`)), await fechar_dm(id), esperarkk(`\n\n[!] Voltando ao início, aguarde 5 segundos...`);
                    }
                    for (const message of todas_msg) {
                      await new Promise(resolve => setTimeout(resolve, delaykk));
                      await message.delete().then(kk => {
                        contador++; 
                        console.clear();
                        console.log(colors.green(`${nome == 'DM' ? `[=] Foram apagadas o total de ${contador} de ${todas_msg.length} em uma ${nome}` : `[=] Foram apagadas o total de ${contador} de ${todas_msg.length} mensagens com o usuário ${nome}`}`));
                      }).catch((e) => { console.log(e); });
                    }
        
                    await fechar_dm(id);
                    esperarkk(`\n\n[!] Terminei de limpar a DM, voltando para o início, aguarde 5 segundos...`);
                  }
                })
              } else if (firstAnswers.option === '[x] Salvar DM') {
                var id = secondAnswers.id
                var canall = client.channels.cache.get(id)
              
                if (!canall) {
                  var usr = await client.users.fetch(id).catch(err => { });
                  if (!usr) {
                    return console.log(colors.red('[x] O ID fornecido é inválido')), esperarkk(`\n\n[!] Voltando ao início, aguarde 5 segundos...`);
                  }
                  await usr?.createDM().then(dmchannel => {
                    id = dmchannel.id;
                    nome = usr.username;
                  }).catch(e => {
                    console.log(colors.red('[x] Não consegui ver a DM com esse usuário'));
                  });
                } else {
                  if (canal?.recipient?.username) {
                    nome = (canal.type == 'GROUP_DM') ? 'DM' : canal.recipient.username;
                  } else {
                    nome = (canal.type == 'GROUP_DM') ? 'DM' : canal.name;
                  }

                }
                const id_ult = await get_ultima_mensagem(id);
                if(!id_ult) return console.clear(), console.log(colors.red(`${nome == 'DM' ? `[x] Sem mensagens nessa DM` : `[x] Não encontrei nenhuma mensagem sua com ${nome}`}`)), await fechar_dm(id), esperarkk(`\n\n[!] Voltando ao início, aguarde 5 segundos...`);
                await all_mensagens(id, id_ult);
                esperarkk(``)
              } else {
                console.log(colors.red('[x] Opção inválida. Voltando ao início.'));
              }
            });
          });
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




          console.clear();

          const { option } = await inquirer.prompt([
            {
              type: 'list',
              name: 'option',
              message: 'Você deseja desconectar ou mover todo mundo da call?',
              choices: ['Desconectar', 'Mover'],
            }
          ]);
          console.clear();

          switch (option) {
            case 'Mover':
              const { channel: disconnectChannelId } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'channel',
                  message: 'Digite o id da call que os membros estão:',
                }
              ]);
              console.clear();

              const { channel: moveChannelId } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'channel',
                  message: 'Digite o id da call que os membros vão ser movidos:',
                }
              ]);

              console.clear();

              const { confirm } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'confirm',
                  message: 'Tem certeza que deseja fazer isso? (y = sim, n = não)',
                }
              ]);

              if (!confirm) return esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);

              const disconnectChannel = client.channels.cache.get(disconnectChannelId);
              const moveChannel = client.channels.cache.get(moveChannelId);

              if (!disconnectChannel || !moveChannel || disconnectChannel.type !== 'GUILD_VOICE' || moveChannel.type !== 'GUILD_VOICE') {
                return console.log(colors.red('[x] ID inválido')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
              }

              if (disconnectChannel.members.size === 0) {
                return console.log(colors.red('[x] A call está vazia')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
              }


              const members = disconnectChannel.members.map(member => member);
              for (const member of members) {

                const user = client.users.cache.get(member);

                const interval = setInterval(async () => {
                  if (moveChannel.locked || moveChannel.full) {
                    console.log(colors.red('[x] A call está privada ou lotada')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
                    clearInterval(interval);
                    return;
                  }

                  try {
                    await disconnectChannel.members.get(member.id).voice.setChannel(moveChannel.id);
                  } catch (err) {
                    if (err.message === "Missing Permissions") {
                      console.clear()
                      console.log(colors.red('[x] Você não tem permissão')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
                    } else {
                    }
                    clearInterval(interval);
                    return;
                  }
                  if (member.id !== client.user.id) { console.log(colors.green(`[+] ${member.user.username} movido para o canal ${moveChannel.name}`)) };
                  clearInterval(interval);

                }, 500);
              }

              break;

            case 'Desconectar':
              const { channel: moveChannelId2 } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'channel',
                  message: 'Digite o id da call que você deseja desconectar todos os usuários:',
                }
              ]);

              console.clear();

              const { confirm: confirm2 } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'confirm',
                  message: 'Tem certeza que deseja fazer isso? (y = sim, n = não)',
                }
              ]);

              if (!confirm2) return esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`)

              const moveChannel2 = client.channels.cache.get(moveChannelId2);

              if (!moveChannel2 || moveChannel2.type !== 'GUILD_VOICE') {
                return console.log(colors.red('[x] ID inválido')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
              }

              if (moveChannel2.members.size === 0) {
                return console.log(colors.red('[x] call vazia')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
              }
              const members2 = moveChannel2.members.map(member => member);

              for (const member of members2) {
                const user = client.users.cache.get(member.id);
                try {
                  await moveChannel2.members.get(member.id).voice.setChannel(null);
                  console.log(colors.green(`[+] Desconectando ${user.tag} da call ${moveChannel2.name}`));
                } catch (err) {
                  if (err.message === "Missing Permissions") {
                    console.log(colors.red('[x] Você não tem permissão')), esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`);
                  } else {
                  }
                  return;
                }

              }

              esperarkk(`\n\n[!] desconectados, voltando ao inicio, aguarde 5 segundos...`)
              break;

            default:
              esperarkk(`\n\n[!] voltando ao inicio, aguarde 5 segundos...`)
          }





        } else if (option == "opção_7") {
          await menu7()
        }
      })
    })
  }
  return loop()
  async function menu7() {
    const { selectedOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedOption',
        message: 'Escolha uma opção',
        choices: ['Ligar', 'Desligar', 'Voltar ao menu'],
      },
    ]);

    const config = require('./config.json');
    let ativado = config.ativado !== false;

    if (selectedOption === 'Ligar') {
      ativado = true;
    } else if (selectedOption === 'Desligar') {
      ativado = false;
    } else {
      console.clear();
      return esperarkk('');
    }

    config.ativado = ativado;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    console.clear();
    console.log(`Status do Anti-DM: ${ativado ? '\x1b[32m[ON]\x1b[0m' : '\x1b[31m[OFF]\x1b[0m'}`);

    await menu7();
  }


  function esperarkk(fofokk) {
    console.log(fofokk);
    setTimeout(function () {
      return loop();
    }, 5000);
  }
});

async function fetch_msgs(canal) {
  const canall = client.channels.cache.get(canal);
  if (!canall) return [];
  let ultimoid;
  let messages = [];

  while (true) {
    const fetched = await canall.messages.fetch({
      limit: 100,
      ...(ultimoid && { before: ultimoid }),
    });

    if (fetched.size === 0) {
      return messages.filter(msg => msg.author.id == client.user.id && !msg.author.system && !msg.system);
    }
    messages = messages.concat(Array.from(fetched.values()));
    ultimoid = fetched.lastKey();
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

function get_ultima_mensagem(id) {
  return client.channels.fetch(id)
    .then(channel => {
      if (!channel) {
        throw new Error('Canal não encontrado.');
      }
      return channel.messages.fetch({ limit: 1 });
    })
    .then(messages => {
      if (messages.size > 0) {
        return messages.first().id;
      } else {
        console.log('Nenhuma mensagem encontrada no canal.');
        return null; 
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      throw error;
    });
}


async function all_mensagens(id) {
  try {
    const mensagens = await fetch_msgs_save(id);

    let historicoMensagens = [];

    mensagens.forEach(mensagem => {
      const mensagemAtual = {
        conteudo: mensagem.content,
        autor: mensagem.author.tag,
        avatar: mensagem.author.displayAvatarURL({ format: 'png', dynamic: true }),
        horario: mensagem.createdTimestamp,
        imagens: mensagem.attachments.filter(anexo => ['jpg', 'jpeg', 'png', 'gif'].includes(anexo.url.split('.').pop().toLowerCase())).map(anexo => anexo.url),
        audios: mensagem.attachments.filter(anexo => ['mp3', 'ogg', 'wav'].includes(anexo.url.split('.').pop().toLowerCase())).map(anexo => anexo.url),
        call: (mensagem.type === 'CALL'),
        usuarioReferenciado: null,
        avatarUsuarioReferenciado: null
      };
	  

      if (mensagem.reference) {
        const mensagemReferenciada = mensagem.reference.resolved;
        if (mensagemReferenciada && mensagemReferenciada.author) {
          mensagemAtual.usuarioReferenciado = mensagemReferenciada.author.tag;
          mensagemAtual.avatarUsuarioReferenciado = mensagemReferenciada.author.displayAvatarURL({ format: 'png', dynamic: true });
        }
      }

      historicoMensagens.push(mensagemAtual);
    });

    historicoMensagens.reverse();
    const html = gerar_html(historicoMensagens);

    if (!fs.existsSync('./saida')) {
      fs.mkdirSync('./saida', { recursive: true });
    }

    try {
      if (fs.existsSync(`./saida/${id}.html`)) {
        fs.unlinkSync(`./saida/${id}.html`);
      }

      fs.writeFileSync(`./saida/${id}.html`, html);
	  open(`./saida/${id}.html`);
      console.log(colors.green('[=] arquivo salvo com sucesso, aguarde 5 segundos para voltar ao inicio...'));
    } catch (err) {
      console.error('Erro ao gravar o arquivo:', err);
    }
  } catch (err) {
    console.log(err);
  }
}

function gerar_html(messages) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>147 dms</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.28.0/themes/prism.css">
      <script src="https://cdn.jsdelivr.net/npm/prismjs@1.28.0/prism.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/prismjs@1.28.0/components/prism-javascript.min.js"></script>
      <style>
        @font-face{
          font-family: 'Whitney';
          src:url('https://discordapp.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff');
          font-weight:300
        }
        @font-face{
          font-family: 'Whitney';
          src:url('https://discordapp.com/assets/e8acd7d9bf6207f99350ca9f9e23b168.woff');
          font-weight:400
        }
        @font-face{
          font-family: 'Whitney';
          src:url('https://discordapp.com/assets/3bdef1251a424500c1b3a78dea9b7e57.woff');
          font-weight:500
        }
        @font-face{
          font-family: 'Whitney';
          src:url('https://discordapp.com/assets/be0060dafb7a0e31d2a1ca17c0708636.woff');
          font-weight:600
        }
        @font-face{
          font-family: 'Whitney';
          src:url('https://discordapp.com/assets/8e12fb4f14d9c4592eb8ec9f22337b04.woff');
          font-weight:700
        }
        .transcricao{
          font-family:'Whitney',"Helvetica Neue",Helvetica,Arial,sans-serif;
          font-size:17px
        }
        .transcricao img{
          object-fit:contain
        }
        .transcricao .grupo-mensagem{
          display:grid;
          margin:0 .6em;
          padding:.9em 0;
          border-top:1px solid;
          grid-template-columns:auto 1fr
        }
        .transcricao .avatar-autor-container{
          grid-column:1;
          width:40px;
          height:40px
        }
        .transcricao .avatar-autor{
          border-radius:50%;
          height:40px;
          width:40px
        }
        .transcricao .mensagens{
          grid-column:2;
          margin-left:1.2em;
          min-width:50%
        }
        .transcricao .nome-autor{
          font-weight:500
        }
        .transcricao .timestamp{
          margin-left:.3em;
          font-size:.75em
        }
         .transcricao .mensagem {
    padding: .1em .3em;
    margin: 0 -.3em;
    background-color: transparent;
    transition: background-color 1s ease;

    /* Alteração: Adicionar as seguintes propriedades */
    display: flex;
    flex-direction: column;
  }	
        .transcricao .conteudo{
          font-size:.95em;
          word-wrap:break-word
        }
        .transcricao.escura.bg{
          background-color:#36393e;
          color:#dcddde
        }
        .transcricao.escura .grupo-mensagem{
          border-color:rgba(255,255,255,.1)
        }
        .transcricao.escura .nome-autor{
          color:#fff
        }
        .transcricao.escura .timestamp{
          color:rgba(255,255,255,.2)
        }
        .transcricao .imagens img {
          max-width: 100px;
          height: auto;
        }
        .transcricao .audios audio {
          margin-top: 5px;
        }
        code[class*="language-"],
pre[class*="language-"] {
  -moz-tab-size: 2;
  -o-tab-size: 2;
  tab-size: 2;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  white-space: pre;
  white-space: pre-wrap;
  word-wrap: normal;
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 14px;
  color: #76d9e6;
  text-shadow: none;
}

pre > code[class*="language-"] {
  font-size: 1em;
}

pre[class*="language-"],
:not(pre) > code[class*="language-"] {
  background: #2a2a2a;
}

pre[class*="language-"] {
  padding: 15px;

  overflow: auto;
  position: relative;
}

pre[class*="language-"] code {
  white-space: pre;
  display: block;
}

:not(pre) > code[class*="language-"] {
  padding: 0.15em 0.2em 0.05em;
  border-radius: .3em;
  border: 0.13em solid #7a6652;
  box-shadow: 1px 1px 0.3em -0.1em #000 inset;
}

.token.namespace {
  opacity: .7;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6f705e;
}

.token.operator,
.token.boolean,
.token.number {
  color: #a77afe;
}

.token.attr-name,
.token.string {
  color: #e6d06c;
}

.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #e6d06c;
}

.token.selector,
.token.inserted {
  color: #a6e22d;
}

.token.atrule,
.token.attr-value,
.token.keyword,
.token.important,
.token.deleted {
  color: #ef3b7d;
}

.token.regex,
.token.statement {
  color: #76d9e6;
}

.token.placeholder,
.token.variable {
  color: #fff;
}

.token.important,
.token.statement,
.token.bold {
  font-weight: bold;
}

.token.punctuation {
  color: #bebec5;
}

.token.entity {
  cursor: help;
}

.token.italic {
  font-style: italic;
}

code.language-markup {
  color: #f9f9f9;
}

code.language-markup .token.tag {
  color: #ef3b7d;
}

code.language-markup .token.attr-name {
  color: #a6e22d;
}

code.language-markup .token.attr-value {
  color: #e6d06c;
}

code.language-markup .token.style,
code.language-markup .token.script {
  color: #76d9e6;
}

code.language-markup .token.script .token.keyword {
  color: #76d9e6;
}

.line-highlight.line-highlight {
  padding: 0;
  background: rgba(255, 255, 255, 0.08);
}

.line-highlight.line-highlight:before,
.line-highlight.line-highlight[data-end]:after {
  padding: 0.2em 0.5em;
  background-color: rgba(255, 255, 255, 0.4);
  color: black;
  height: 1em;
  line-height: 1em;
  box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
}
.token.operator {
  background: none;
}
      </style>
    </head>
    <body class="transcricao escura bg">
      <h1>147 dm saver</h1>
      <ul>
  `;

  messages.forEach(mensagem => {
    const timestampFormatado = new Date(mensagem.horario).toLocaleString();
    const conteudoFormatado = escapeHTML(mensagem.conteudo);
    const autorFormatado = escapeHTML(mensagem.autor);
    const usuarioReferenciadoFormatado = mensagem.usuarioReferenciado ? escapeHTML(mensagem.usuarioReferenciado) : null;
    let tagsDeImagem = '';
    let tagsDeAudio = '';
	let tagsDeVideo = '';
  const conteudoFormatadoComCodigo = conteudoFormatado.replace(/```([\s\S]*?)```/g, '<pre><code class="language-javascript">$1</code></pre>');

	if (mensagem.videos && mensagem.videos.length > 0) {
      tagsDeVideo = `
        <div class="videos" style="margin-top: 5px;"> <!-- You can adjust the margin as per your layout -->
          ${mensagem.videos.map(video => `<video controls style="max-width: 550px; height: 309px;"><source src="${escapeHTML(video)}"></video>`).join('')}
        </div>
      `;
    }

    if (mensagem.imagens && mensagem.imagens.length > 0) {
      tagsDeImagem = `
        <div class="imagens" style="margin-top: 5px;">
          ${mensagem.imagens.map(imagem => `<a href="${escapeHTML(imagem)}" target="_blank"><img src="${escapeHTML(imagem)}" style="max-width: 550px; height: 309px;" alt="Imagem da Mensagem" style="max-width: 100%; height: auto; margin-bottom: 5px;"></a>`).join('')}
        </div>
      `;
    }

	
    if (mensagem.audios && mensagem.audios.length > 0) {
      tagsDeAudio = `
        <div class="audios">
          ${mensagem.audios.map(audio => `<audio controls><source src="${escapeHTML(audio)}"></audio>`).join('')}
        </div>
      `;
    }

    const tagDoAvatarDoAutor = `
      <div class="avatar-autor-container">
        <img class="avatar-autor" src="${escapeHTML(mensagem.avatar)}">
      </div>
    `;
    const tagDoAvatarDoUsuarioReferenciado = mensagem.avatarUsuarioReferenciado ? `
      <div class="avatar-usuario-referenciado-container">
        <img class="avatar-usuario-referenciado" src="${escapeHTML(mensagem.avatarUsuarioReferenciado)}">
      </div>
    ` : '';
		
	const linkazul = conteudoFormatadoComCodigo.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '<a class="link-azul" href="$&" target="_blank">$&</a>');
    const conteudoFinal = mensagem.call
      ? `<img src="https://i.imgur.com/zJ4FHTM.png"> ${autorFormatado} iniciou uma chamada`
      : linkazul;
		  
    html += `
      <div class="grupo-mensagem" style="border-top:0px; ">
        ${tagDoAvatarDoAutor}
        <div class="mensagens">
          <span class="nome-autor">${autorFormatado}</span>
          <span class="timestamp">${timestampFormatado}</span>
          <div class="mensagem">
            <div class="conteudo">
              ${conteudoFinal}
            </div>
            ${tagsDeImagem}
            ${tagsDeAudio}
            ${tagsDeVideo}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </ul>
    </body>
    </html>
  `;

  return html;
}

async function fetch_msgs_save(canal) {
  const canall = client.channels.cache.get(canal);
  if (!canall) return [];
  let ultimoid;
  let messages = [];

  while (true) {
    const fetched = await canall.messages.fetch({
      limit: 100,
      ...(ultimoid && { before: ultimoid }),
    });

    if (fetched.size === 0) {
      return messages;
    }
    
    messages = messages.concat(Array.from(fetched.values()));
    ultimoid = fetched.lastKey();
  }
}

function escapeHTML(content) {
  return content?.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}





client.on('channelCreate', async (channel) => {
  if (!pegar_status()) return;

  if (channel.type == "GROUP_DM") {
    await channel.delete();
  }
});

client.login(require('./config.json').token).catch(() => {
  console.clear();
  inquirer.prompt([{
    type: 'message',
    name: 'option',
    message: `${colors.red("[!]")} Token inválida, insira uma token:`,
  }]).then(async token => {
    console.clear();
    await client.login(token.option).then(() => {
      fs.writeFileSync('config.json', JSON.stringify({ ativado: false, token: client.token }, null, 2))
    }).catch(() => {
      process.exit()
    })
  })
})


async function checkUpdate() {
  const repoOwner = 'brunnoxw';
  const repoName = 'discord-multi-tool';

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases`);
    const releases = await response.json();

    if (releases.length === 0) {
      console.log('Nenhuma release encontrada para este repositório.');
      return;
    }

    const ultima_att = releases[0];
    const versao_git = ultima_att.tag_name;

    const packageJson = require('./package.json');
    var versao_projeto = packageJson.version;
    var ats;
    if (versao_projeto !== versao_git) {
     ats = 'há uma atualização disponível, feche o prompt atual e abra o atualizar.bat'

    } else {
      ats = `           v${versao_git}`
    }
    return ats
  } catch (error) {
   return ats = 'erro de comunicação com o github'
  }
  }




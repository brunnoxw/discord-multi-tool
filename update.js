const readline = require('readline')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const simpleGit = require('simple-git')


async function updatePackage(versao) {
   try {
  const diretorio = './package.json'
  const packageJson = require(diretorio)
   
  packageJson.version = versao
  fs.writeFileSync(diretorio, JSON.stringify(packageJson, null, 2));
  console.log('package atualizada com sucesso', versao)

   } catch (error) {
   console.error('erro ao atualizar package', error)
   } 
}

async function procurarAtt() {
    const usuario = 'byy0x'
    const nome_projeto = 'discord-multi-tool'

    try {
    const resp = await fetch(`https://api.github.com/repos/${usuario}/${nome_projeto}/releases`)
    const releases = await resp.json()
    
    if(releases.length == 0) {
    console.log('nenhuma release para esse projeto')
    return;
    }
   const ultima_att = releases[0]
   const ultima_ver = ultima_att.tag_name

   const packageJson = require('./package.json')
   const ver_atual = packageJson.version

  if(ver_atual !== ultima_ver) {
   const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
   });

   await new Promise(resolve => {
    rl.question(`Uma nova versão está disponivel (${ultima_ver}), você está usando a versão (${ver_atual}). Deseja atualizar? (sim/não): `, async (answer) => {
    if(answer.toLowerCase() === 'sim' || answer.toLocaleLowerCase() == 's') {
     console.log('Baixando e atualizando, aguarde alguns segundos...')
     const tempDir = path.join(__dirname, 'temp_clone')
     rimraf.sync(tempDir);
     
     const git = simpleGit();
     
     git.clone(`https://github.com/${usuario}/${nome_projeto}.git`, tempDir).then(() => {
       console.log(`Seu código foi atualizado para a versão ${ultima_ver}`) 

         const arquivos = fs.readdirSync(tempDir)
         arquivos.forEach(file => {
            if(file !== '.git') {
                const sourceFile = path.join(tempDir, file)
                const targetFile = path.join(__dirname, file)

                fs.copyFileSync(sourceFile, targetFile)
            }
         });
         rimraf.sync(tempDir)
         updatePackage(ultima_ver)
         rl.close()
         resolve()
     }).catch(error => {
        console.error('Erro ao clonar repositório, tente instalar https://git-scm.com/.\nOu tente atualizar o projeto baixando no https://github.com/byy0x/discord-multi-tool')
     });

    } else {
        console.log('Atualização cancelada.')
    }

    });
   });



  } else {
    console.log('Você já está usando a versão mais recente')
  }

} catch (error) {
console.log('erro ao verificar releases')
    }
}

(async () => {

    await procurarAtt()
    
})();
## Bot do Discord Multiuso

Este é um exemplo de código para um bot do Discord multiuso que usa a biblioteca `discord.js-selfbot-v13` para se conectar ao Discord com uma conta de usuário. Algumas das funcionalidades incluem:

- Limpar as mensagens de um usuário ou canal
- Remover amigos e pedidos de amizade
- Anti-DM para sair assim que te adicionarem na dm.
- Opções adicionais, como abrir todas as DMs (com os amigos) e apagar as mensagens

O código também apresenta atualizações de status e um menu para escolher entre as diferentes funções. É possível personalizar o código para criar um bot com as funcionalidades mais adequadas às suas necessidades.

### Bibliotecas Utilizadas

O código usa as seguintes bibliotecas:

- `discord.js-selfbot-v13`: Biblioteca que permite conectar ao Discord com uma conta de usuário.
- `inquirer`: Biblioteca para criar menus interativos no console.
- `axios`: Biblioteca para fazer requisições HTTP.
- `figlet`: Biblioteca para converter texto simples em texto em ASCII art.

### Como Usar

1. Clonar este repositório
2. Instalar as dependências usando `npm install`
3. Criar um arquivo `config.json` na raiz, com o seguinte formato:
   ```json
   {
     "token": "SEU_TOKEN_DE_DISCORD_AQUI",
     "ativado": true
   }
   ```
4. Substituir `SEU_TOKEN_DE_DISCORD_AQUI` pelo token da sua conta do Discord.
5. Executar o bot com `node .`

### Funções Principais

#### Limpar Mensagens

- `[+] Abrir todas as DMs e apagar`: Abre todas as DMs (com os seus amigos) e apaga as mensagens.
- `[+] Apagar mensagens das DMs abertas`: Apaga as mensagens das DMs abertas.
- `[+] Apagar mensagens de um canal/usuário`: Apaga as mensagens de um canal ou usuário específico.

#### Remover Amigos

- `[+] Remover todos os amigos`: Remove todos os amigos.
- `[+] Remover pedidos de amizade`: Remove todos os pedidos de amizade pendentes.

#### Anti-DM

- `[+] Anti-DM`: Sai sozinho da DM assim que adicionado.

### Contribuições

Contribuições e sugestões são sempre bem-vindas! Sinta-se à vontade para enviar um pull request ou abrir uma issue com sugestões de novas funcionalidades ou melhorias no código existente.

![exemplo](https://i.imgur.com/ZOshG65.png)

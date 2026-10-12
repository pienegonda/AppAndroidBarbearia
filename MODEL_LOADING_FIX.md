# Correção do carregamento dos modelos faciais

- O carregamento de cada origem (modelos locais e CDN) tem limite de 12 segundos.
- Se o carregamento falhar, o erro é apresentado ao usuário em vez de manter a interface indefinidamente no estado de preparação.
- O cadastro captura e apresenta o erro real, e o usuário pode tentar novamente ou desmarcar o consentimento biométrico para continuar sem reconhecimento facial.
- A identificação facial informa que a carga pode falhar e mantém a alternativa de busca manual.
- Para uso offline, instale os arquivos de modelos compatíveis em `public/models`; veja `public/models/README.md`.

## Verificação neste ambiente

Não foi possível executar o build: o ambiente disponível não tem acesso à rede para instalar `@vladmandic/face-api`, e o diretório de dependências reutilizável veio de um ambiente Windows (o executável `tsc` chama `node.exe`, indisponível aqui). O build precisa ser executado em um ambiente Node.js funcional com acesso ao npm.

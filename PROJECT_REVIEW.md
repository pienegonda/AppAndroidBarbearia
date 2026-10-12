# Revisão técnica — Arte e Fios Barbearia

## Alterações nesta versão
- Adicionada integração de reconhecimento facial no navegador com `@vladmandic/face-api`.
- Cadastro com consentimento explícito calcula e salva localmente um descritor facial de 128 dimensões, além da foto de referência opcional.
- Identificação compara o descritor da câmera com descritores de clientes consentidos no IndexedDB.
- Correspondência distante ou ambígua não seleciona cliente e recomenda identificação manual.
- A comparação não envia descritores para um servidor; modelos podem ser servidos localmente por `public/models`, com fallback de CDN.
- Adicionada documentação de instalação, modelos e limitações de segurança.

## Limitações e riscos conhecidos
- Não existe backend nem sincronização de clientes entre dispositivos; o reconhecimento só encontra cadastros existentes no mesmo navegador/dispositivo.
- O fallback CDN requer internet na primeira carga e não garante uso offline. Para operação offline, forneça os pesos em `public/models` e confirme o cache dos modelos na configuração PWA.
- Não existe detecção de prova de vida/anti-spoofing; uma foto impressa ou exibida em tela pode enganar o reconhecimento. Não utilizar como autenticação de alta segurança.
- O limiar de distância é conservador e deve ser validado com fotos reais, iluminação e diversidade de usuários antes do uso comercial.
- Os descritores faciais são dados biométricos sensíveis. É necessário consentimento específico, mecanismo para revogar consentimento/excluir descritor e foto, política de retenção, controle de acesso ao dispositivo e avaliação jurídica de LGPD.
- Cadastros antigos que possuem somente foto não têm descritor; precisam refazer o cadastro biométrico/atualizar a referência com consentimento para participar do reconhecimento.

## Testes
- Revisão estática do código realizada.
- Build e testes automatizados não foram executados nesta sessão: o ambiente não conseguiu instalar dependências por indisponibilidade de rede. Execute `npm install`, `npm run build` e valide a câmera em `localhost` ou HTTPS.

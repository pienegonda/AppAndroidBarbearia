# Arte e Fios Barbearia — V4

V4 construída **a partir da V1**, preservando o layout/identidade visual da V1 e completando o fluxo operacional exigido pelo projeto.

## Fluxo funcional
S1 Descanso → S2 Identificação → S3 Cadastro/S4 Busca → S5 Serviços → S6 Finalização → Financeiro.

### S5 Serviços
- Carrega catálogo do IndexedDB com fallback para catálogo padrão.
- Um serviço por categoria.
- Seleção visual com check.
- Resumo em tempo real.
- Primeiro serviço pelo preço integral.
- Demais serviços com 50%.
- Benefício de fidelidade aplicado quando disponível.
- Botão claro "Continuar para finalizar".

### S6 Finalização
- Mostra exatamente os serviços escolhidos.
- Permite voltar e alterar serviços.
- Mostra preço original, descontos, benefício e total.
- Pix, Cartão ou Dinheiro.
- Retorno em 7/15/30/60 dias.
- Confirmação explícita.
- Persiste Appointment no IndexedDB.
- Atualiza cliente, visitas, pontos e economia.
- Plano não acumula pontos.
- Benefício consumido corretamente.
- Benefício novo gerado pela visita é preservado.

### S7 Financeiro
Dados reais dos appointments:
- Hoje/Semana/Mês
- Receita
- Ticket médio
- Taxa de retorno
- Atendimentos
- Ranking de serviços
- Distribuição de pagamentos

### S8 Mestre
- Edita preços.
- Ativa/inativa serviços.
- Ativa/desativa clientes em plano.
- Tema claro/escuro.
- Acesso à captura do rosto.

### S9
Tela preparada para integração do reconhecimento facial local.

## Reconhecimento facial (integração inicial)
- Usa `@vladmandic/face-api` para detectar um rosto e calcular um descritor de 128 valores durante o cadastro, somente com consentimento explícito.
- Na visita seguinte, compara o descritor capturado pela câmera com os descritores consentidos no IndexedDB. Correspondências fracas ou ambíguas não selecionam nenhum cliente e orientam a busca manual.
- O aplicativo inicializa explicitamente o backend TensorFlow (WebGL, com fallback para CPU) antes de carregar os modelos faciais compatíveis automaticamente pelo CDN jsDelivr. Para o teste padrão, não é necessário baixar ou copiar modelos manualmente; é necessária conexão com a internet na primeira utilização.
- A comparação ocorre localmente. Não há prova de vida (liveness/anti-spoofing), portanto uma fotografia apresentada à câmera pode enganar o sistema. Não use como autenticação de alta segurança.
- Descritores e fotos são dados biométricos/dados pessoais sensíveis: mantenha consentimento específico, política de retenção/exclusão e controle físico do dispositivo. Esta versão usa armazenamento local e não sincroniza cadastros entre aparelhos. Faça avaliação jurídica e testes de viés/erro antes de uso comercial.
- Para instalar a dependência adicionada e atualizar o lockfile, execute `npm install`. Depois execute `npm run build`.

## Instalação
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Reconhecimento facial: modelos não carregam

O sistema inicializa o backend TensorFlow explicitamente (WebGL, com fallback para CPU) antes de carregar os modelos do CDN. Cada origem tem limite de espera; após falha, aparece uma mensagem explícita e a identificação manual continua disponível. O teste padrão exige internet para baixar os modelos na primeira utilização; não é necessário configurar manualmente a pasta `public/models`.

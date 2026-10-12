# Modelos faciais (configuração automática)

Para testar o projeto em desenvolvimento, **não é necessário baixar nem copiar arquivos manualmente nesta pasta**. O aplicativo inicializa o backend TensorFlow e carrega os modelos compatíveis de `@vladmandic/face-api` automaticamente pelo CDN jsDelivr.

A pasta `/models` é mantida apenas como opção para uma instalação futura que precise funcionar sem internet. Se os modelos não puderem ser obtidos pelo CDN, confira se a conexão permite acesso a `cdn.jsdelivr.net`.

Não coloque fotografias de clientes nesta pasta. Fotos e descritores biométricos são dados pessoais sensíveis e não devem ser publicados como arquivos estáticos.

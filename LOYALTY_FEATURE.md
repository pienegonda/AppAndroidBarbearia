# Fidelidade configurável

No Acesso do Mestre, o sistema permite definir quantos pontos cada atendimento concluído acumula e cadastrar metas que concedem um serviço específico grátis. As configurações e metas são armazenadas no IndexedDB via Dexie.

- Clientes comuns acumulam a quantidade configurada por atendimento.
- Clientes de plano continuam sem acumular pontos, conforme a regra existente.
- Ao atingir uma meta, os pontos exigidos são descontados e a recompensa fica pendente no cadastro do cliente.
- Para resgatar, o cliente seleciona o serviço associado à meta; esse serviço fica grátis no resumo e na confirmação do atendimento.
- Só é permitido manter uma recompensa pendente por cliente por vez; pontos continuam acumulando enquanto ela aguarda resgate.
- O mestre não pode excluir uma meta com recompensa pendente, nem excluir um serviço que esteja ligado a uma meta ativa.
- Configuração inicial: 1 ponto por visita e nenhuma meta customizada; o mestre cadastra as metas que desejar.

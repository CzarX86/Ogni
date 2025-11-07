# Node.js Upgrade Playbook

## Contexto
- Projeto atualmente documentado em Node.js 18 LTS (referência: `specs/001-core-ecommerce/quickstart.md`).
- `react-scripts@5.0.1` e dependências vigentes funcionam bem nessa linha.
- Última LTS disponível: Node.js 22.x (“Iron”), com suporte até 2027.

## Objetivo
Planejar a migração do ambiente de desenvolvimento/CI/CD para Node.js 22.x sem interromper entregas críticas do core e-commerce.

## Momento Ideal
1. **Pós-sprint ou janela de manutenção** – evitar conflitos com releases urgentes.
2. **Backlog estável** – garantir que não há demandas críticas dependendo do build atual.
3. **Time alinhado** – avisar em daily e registrar plano/rollback antes de iniciar.

## Passo a Passo

### 1. Preparação
- [ ] Abrir issue/nota técnica descrevendo escopo e responsáveis.
- [ ] Criar branch `chore/node-22-upgrade`.
- [ ] Mapear impactos (CI/CD, ambientes, docs, scripts locais).

### 2. Ajustes de Metadados
- [ ] Adicionar `.nvmrc` com `22.x`.
- [ ] Definir `engines.node` em `package.json` para `^22`.
- [ ] Atualizar quickstart/README/SETUP-TOKENS com o novo requisito.

### 3. Compatibilidade Local
- [ ] Instalar dependências com `npm ci` usando Node 22.
- [ ] Executar `npm run build` e `npm run test:ci`.
- [ ] Rodar lint/type-check (ao adicionar scripts).
- [ ] Registrar warnings/breaking changes observados.

### 4. Correções
- [ ] Atualizar dependências incompatíveis (libs nativas, ferramentas de build).
- [ ] Ajustar configs de `react-scripts`/Webpack se houver falhas.
- [ ] Documentar cada alteração diretamente no PR.

### 5. CI/CD e Ambientes
- [ ] Atualizar pipelines (ex.: `actions/setup-node` → `node-version: 22`).
- [ ] Validar que ambientes de deploy (Firebase Functions/hosting) suportam Node 22; se necessário, programar upgrade conjunto.

### 6. Rollout
- [ ] Obter review focado em compatibilidade e impacto operacional.
- [ ] Fazer merge após pipelines passarem com Node 22.
- [ ] Monitorar primeiros deploys em staging/produção (logs, métricas).

### 7. Pós-Migração
- [ ] Atualizar oficialmente a documentação de setup.
- [ ] Comunicar time e registrar lições aprendidas na retro.
- [ ] Remover referências antigas a Node 18.

## Plano de Rollback
1. Reverter `.nvmrc`, `package.json (engines)` e docs.
2. Forçar pipelines/ambientes a retomarem Node 18.
3. Registrar follow-up para investigar incompatibilidades antes de nova tentativa.

## Notas
- Nenhuma dependência atual bloqueia Node 22, mas validação completa é obrigatória.
- A migração é boa oportunidade para padronizar scripts (`lint`, `type-check`) e garantir cobertura no pipeline.

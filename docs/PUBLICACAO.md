# Publicação da adaptação no Foundry

Como publicar versões da adaptação no GitHub. Preserve a atribuição ao sistema original:
a campanha não reivindica autoria do sistema-base.

**Créditos:** o projeto original é [Ordem Paranormal RPG 2 - Playtest (Não Oficial)](https://github.com/SergioSJS/ordem-paranormal-2e-fvtt),
de Sérgio Sousa. Esta adaptação temática e a expansão de conteúdo da campanha são de
Matheus Max Duarte de Lima.

## Antes de publicar — checklist

- [x] Manifesto completo: `id`, `title`, `description`, `version`, `authors`, `url`,
      `manifest` (URL estável: `releases/latest/download/system.json`) e `download`
      (fixado por versão) — os dois injetados pelo release, não vivem no repositório
      (senão o Foundry oferece "Update" para a cópia de desenvolvimento e a
      sobrescreve), `compatibility` (`minimum: 13`,
      `verified: 14`), `license`, `readme`, `changelog`, `bugs`, `media` (`setup`,
      `cover`, `screenshot`), `socket`, `languages`.
- [x] Release pública desta adaptação com zip + `system.json` (workflow `release.yml`);
      instalar pelo manifesto funciona no v13 e no v14 (testado no projeto-base).
- [x] Nenhum texto nem imagem do livro no pacote; selo e aviso da Licença da
      Comunidade; aviso de material com IA; LGPD (nada sai da máquina).
- [x] Código GPL-3.0; fontes OFL; ícones próprios.
- [x] Prints e capa sem arte da editora.
- [x] Política de IA do Foundry: código com auxílio de IA; textos próprios da campanha
      por Matheus Max Duarte de Lima, revisados e assinados.

## Listagem oficial do Foundry

O manifesto mantém o `id` técnico original (`ordem-paranormal-2e`) para preservar a
compatibilidade desta adaptação com a base. **Não registre esta cópia como um pacote
independente com o mesmo ID**: isso pode conflitar com a listagem do projeto original.
Uma listagem separada exige coordenação e um identificador técnico próprio, o que fica
fora do escopo de rebranding.

## Releases desta adaptação

O workflow `release.yml` publica o zip e o manifesto no repositório da adaptação. Se no
futuro houver uma listagem própria autorizada para esta adaptação, a versão também
precisará ser registrada nela. Nesse caso:

1. Na página do pacote (logado), copie o **Package Release Token** (campo acima de
   "Save Package").
2. No GitHub: Settings → Secrets and variables → Actions → **New repository secret**
   `FOUNDRY_RELEASE_TOKEN` com o token.
3. A partir daí, `git tag vX.Y.Z && git push origin vX.Y.Z` e
   `gh workflow run release.yml -f tag=vX.Y.Z` publicam o zip no GitHub **e** registram a
   versão no Foundry (Package Release API), com o manifesto fixo daquela versão e a
   compatibilidade do `system.json`.

Sem o segredo, o passo é pulado e a versão pode ser adicionada à mão na página do
pacote (Versions → manifest URL da versão).

## Regras de versão

- SemVer. `verified` sobe quando uma build nova do Foundry for exercitada pelo e2e.
- O `manifest` do `system.json` no repositório fica em `latest`; o que vai para a API
  é sempre `releases/download/vX.Y.Z/system.json`.

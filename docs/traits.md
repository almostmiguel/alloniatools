# Trait categories

Edit trait names, descriptions, and assignments in `data/traits.json`. Each trait can belong to multiple categories. Use the internal IDs below exactly; the interface displays the Portuguese label separately.

| Internal ID | Display label |
| --- | --- |
| `affliction` | Aflição |
| `ancestry` | Ancestralidade |
| `armor` | Armadura |
| `class` | Classe |
| `class-specific` | Específico de classe |
| `creature type` | Tipo de criatura |
| `elemental` | Elemental |
| `energy` | Energia |
| `equipment` | Equipamento |
| `feat` | Talento |
| `hazard` | Perigo |
| `mechanics` | Mecânicas |
| `monster` | Monstro |
| `planar` | Planar |
| `poison` | Veneno |
| `rarity` | Raridade |
| `sense` | Sentido |
| `tradition` | Tradição |
| `weapon` | Arma |

`class` identifies class-name traits, such as Bardo and Mago. `class-specific` groups class mechanics, such as Composição and Floreio; it does not identify a particular class by itself. Likewise, `ancestry` contains both ancestry and versatile-heritage traits, while `creature type` and `monster` group broad creature types and monster families or creature-specific traits respectively.

Categories can overlap. For example, a trait can belong to both `elemental` and `energy`. Assignments remain editable: the tests validate category IDs and application behavior, not a fixed assignment for every trait. Categories without any assigned traits are still available on the Traits page.

Ancestry and class feat filters depend on `ancestry` and `class`. Rarity detection and sorting depend on `rarity`. Uncategorized or unknown traits fall back to `mechanics` for grouping. Categories do not automatically apply rules effects or turn a spell into a cantrip.

## Nomes alternativos e filtros de talentos

Use `alias` na definição de um traço para reconhecer referências antigas sem criar outra opção no filtro. Por exemplo, `"name": "Auditivo", "alias": ["Auditory"], "categories": ["sense"]` faz as duas grafias usarem o mesmo traço Auditivo, na categoria Sentido. O nome exibido e as categorias vêm sempre dessa definição; os aliases não dependem do dicionário de tradução da interface.

Nos talentos, a seção **Classes** reúne os traços de classe e os arquétipos associados a essas classes. Bardo aparece uma única vez, abrangendo talentos de classe e de seu arquétipo multiclasse. O filtro **Tipo** continua permitindo separar Classe de Arquétipo. Arquétipos que não representam uma classe permanecem na seção Arquétipo.

After editing names or categories, regenerate validation:

```sh
npm run build:schema:traits
```

Do not manually edit `test/schema-template/_generated/traits.json`; it is generated from the authored traits. To refresh search and trait-reference indexes without regenerating feat trees:

```sh
node node/generate-search-index.js
```

The category labels are defined in `Parser.TRAIT_CATEGORIES` in `js/parser.js`. Changing a display label does not require changing the category IDs in JSON, saved filter state, or filter links.

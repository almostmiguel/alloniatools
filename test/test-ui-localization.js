"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");
require("../js/render.js");
const ui = require("../js/utils-ui.js");

function testUiLocalization () {
	const root = path.join(__dirname, "..");
	const read = file => fs.readFileSync(path.join(root, file), "utf8");
	for (const file of fs.readdirSync(root).filter(file => file.endsWith(".html"))) {
		assert(read(file).includes("<html lang=\"pt-BR\">"), `${file}: declare the interface language.`);
	}
	for (const [key, label] of Object.entries({Backgrounds: "Biografias", Feats: "Talentos", Ancestries: "Ancestralidades", "Quick Reference": "Referência Rápida", "Show Feats": "Mostrar Talentos", "Hide Feats": "Ocultar Talentos", AND: "E", OR: "OU"})) {
		assert.strictEqual(Parser.uiToFull(key), label);
	}
	assert.strictEqual(Parser.uiToFull("ancestry"), "Ancestralidade");
	assert.strictEqual(Parser.uiToFull("Meu conteúdo personalizado"), "Meu conteúdo personalizado");
	assert.strictEqual(Parser.uiToFull(5), 5);
	assert.strictEqual(Parser.uiToFull(null), null);
	assert.strictEqual(Parser.traitCategoryToSchemaKey("creature type"), "creatureTypeTrait", "Schema identifiers must remain independent from translated labels.");
	const home = read("index.html");
	assert(home.includes("Glossário<br>de Regras"));
	assert(home.includes("Referência<br>Rápida"));
	assert(!/>\s*(Players|Game Masters|Backgrounds|Feats|Ancestries)\s*</.test(home));
	assert(read("js/styleswitch.js").includes("Modo Escuro"));
	assert(read("js/omnisearch.js").includes("Buscar no site..."));
	assert(read("js/render.js").includes("Parser.uiToFull(tb.label)"), "Translate tab labels only when rendering, retaining their internal identities.");
	assert(read("js/ancestries.js").includes("Parser.uiToFull(tab.label)"));
	assert(!Renderer.utils.HTML_NO_INFO.includes("No information"));
	assert(!Renderer.utils.HTML_NO_IMAGES.includes("No images"));
	assert.strictEqual(Renderer.utils.tabButton("Quick Reference").label, "Quick Reference");
	const context = vm.createContext({...ui, Parser, Renderer, SortUtil, MiscUtil, UrlUtil, SourceUtil, BrewUtil, VeCt});
	const {Filter} = vm.runInContext(`${read("js/filter.js")}\n({Filter});`, context);
	const filter = new Filter({header: "Type", items: ["Skill", "General"]});
	assert.strictEqual(filter.header, "Type");
	assert.strictEqual(filter.displayHeader, "Tipo");
	assert.strictEqual(filter._displayFn("Skill"), "Perícia");
	filter.setValue("Skill", 1);
	assert.strictEqual(filter.getValues().Type.Skill, 1);
	assert.strictEqual(filter.getValues().Type["Perícia"], undefined, "Translations must not change saved filter keys.");
	const custom = new Filter({header: "Custom Header", displayHeader: "Título Próprio", items: ["Original"], displayFn: () => "My Custom Label"});
	assert.strictEqual(custom.displayHeader, "Título Próprio");
	assert.strictEqual(custom._displayFn("Original"), "My Custom Label");
	const books = vm.runInNewContext(`${read("js/bookslist.js")}\nBooksList;`, {Intl, window: {addEventListener () {}}});
	assert.strictEqual(books.getDateStr({published: "2026-10-23"}), "23 de outubro de 2026");
	assert.strictEqual(books.getDateStr({}), "—");
	console.log("##### Interface Localization Tests Passed #####");
	return true;
}

module.exports = testUiLocalization();

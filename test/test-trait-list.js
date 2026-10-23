"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");

function testTraitList () {
	const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
	const context = vm.createContext({
		Parser,
		SortUtil,
		UrlUtil: {autoEncodeHash: it => UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAITS](it)},
		BrewUtil,
		ListPage: class {},
		window: {addEventListener: () => {}},
		document: {createElement: () => ({addEventListener: () => {}})},
		ListItem: class {
			constructor (ix, ele, name, values, data) { Object.assign(this, {ix, ele, name, values, data}); }
		},
		escapeQuotes: String.prototype.escapeQuotes,
	});
	const page = vm.runInContext(`String.prototype.escapeQuotes = escapeQuotes;\n${read("js/traits.js")}\nObject.create(TraitsPage.prototype);`, context);
	page._pageFilter = {mutateAndAddToFilters: () => {}};
	const makeItem = (name, categories, index = 0) => page.getListItem({name, source: "PC1", categories}, index, false);
	const categories = ["weapon", "affliction"];
	const multi = makeItem("Multiple", categories);
	assert.strictEqual(multi.values.category, "Aflição, Arma");
	assert.deepStrictEqual(categories, ["weapon", "affliction"], "Sorting must not mutate authored categories.");
	assert(multi.ele.innerHTML.includes("title=\"Aflição, Arma\""));
	assert(multi.ele.innerHTML.includes("class=\"col-5 text-center\""));
	assert.strictEqual(makeItem("Fallback").values.category, "Mecânicas");
	assert.strictEqual(makeItem("Empty", []).values.category, "Mecânicas");
	assert.strictEqual(makeItem("Hidden", ["_internal", "armor"]).values.category, "Armadura");
	const items = [makeItem("Zebra", ["armor"]), makeItem("Alpha", ["armor"]), makeItem("First", ["affliction"]), makeItem("Last", ["weapon"])];
	const sorted = [...items].sort((a, b) => SortUtil.listSort(a, b, {sortBy: "category"}));
	assert.deepStrictEqual(sorted.map(it => it.name), ["First", "Last", "Alpha", "Zebra"], "Sort using Portuguese labels, then trait names.");
	assert.deepStrictEqual([...sorted].reverse().map(it => it.name), ["Zebra", "Alpha", "Last", "First"]);
	assert.deepStrictEqual([...items].sort((a, b) => SortUtil.listSort(a, b, {sortBy: "name"})).map(it => it.name), ["Alpha", "First", "Last", "Zebra"]);
	assert.strictEqual(SortUtil.listSort(items[0], items[1], {sortBy: "source"}) > 0, true);
	assert(/data-sort="category">Categoria/.test(read("traits.html")), "The column button must target the indexed sort value.");
	console.log("##### Trait List Tests Passed #####");
	return true;
}

module.exports = testTraitList();

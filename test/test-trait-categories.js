"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");
require("../js/render.js");
const ui = require("../js/utils-ui.js");

async function testTraitCategories () {
	const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
	const expected = ["affliction", "ancestry", "armor", "class", "class-specific", "creature type", "elemental", "energy", "equipment", "feat", "hazard", "mechanics", "monster", "planar", "poison", "rarity", "sense", "tradition", "weapon"];
	assert.deepStrictEqual(Object.keys(Parser.TRAIT_CATEGORIES), expected);
	const traits = JSON.parse(read("data/traits.json")).trait;
	const schema = JSON.parse(read("test/schema-template/traits.json"));
	assert.deepStrictEqual(schema.properties.trait.items.properties.categories.items.enum, expected);
	for (const trait of traits) {
		assert(trait.categories?.length, `${trait.name}: assign at least one category.`);
		assert.strictEqual(new Set(trait.categories).size, trait.categories.length);
		trait.categories.forEach(category => assert(expected.includes(category), `${trait.name}: invalid category ${category}.`));
	}
	const savedTraits = Renderer.trait.TRAITS;
	const savedLoadJSON = DataUtil.loadJSON;
	const savedBrew = BrewUtil.pAddBrewData;
	const savedSmallScreen = Renderer.hover.isSmallScreen;
	try {
		Renderer.hover.isSmallScreen = () => false;
		const fixtures = expected.map((category, index) => ({name: `Category Fixture ${index}`, categories: [category]}));
		DataUtil.loadJSON = async () => ({trait: [...traits, ...fixtures, {name: "Uncategorized Test Trait"}]});
		BrewUtil.pAddBrewData = async () => ({});
		await Renderer.trait.preloadTraits();
		assert.deepStrictEqual(Renderer.trait.getTraitCategories("Uncategorized Test Trait"), ["mechanics"]);
		for (const fixture of fixtures) assert.deepStrictEqual(Renderer.trait.getTraitCategories(fixture.name), fixture.categories);
		const context = vm.createContext({
			...ui,
			Parser,
			Renderer,
			SortUtil,
			MiscUtil,
			UrlUtil,
			SourceUtil,
			BrewUtil,
			VeCt,
			stringMethods: {toUrlified: String.prototype.toUrlified, toTitleCase: String.prototype.toTitleCase, uppercaseFirst: String.prototype.uppercaseFirst, escapeQuotes: String.prototype.escapeQuotes},
		});
		const filters = vm.runInContext(`Object.assign(String.prototype, stringMethods);\n${read("js/filter.js")}\n${read("js/filter-feats.js")}\n${read("js/filter-traits.js")}\n({TraitsFilter, PageFilterFeats, PageFilterTraits});`, context);
		const grouped = new filters.TraitsFilter({header: "Traits"});
		assert.strictEqual(grouped.displayHeader, "Traços");
		for (const trait of traits) grouped.addItem(trait.name);
		grouped.addItem("A trait not installed in the dataset");
		assert.strictEqual(grouped._filtersByCat["class-specific"].header, "class-specific");
		assert.strictEqual(grouped._filtersByCat["class-specific"].displayHeader, "Específico de classe");
		assert(grouped._filtersByCat["class-specific"]._getRenderedHeader().includes("Específico de classe"));
		const specific = grouped._filtersByCat["class-specific"];
		specific.filterBox = {getNamespacedHashKey: key => key};
		specific.setValue("Composição", 1);
		assert(specific.getSubHashes().some(hash => hash.startsWith("flstclass-specific:")), "Translated labels must not change filter-link IDs.");
		assert(grouped._filtersByCat.mechanics.getValues().mechanics["A trait not installed in the dataset"] !== undefined);
		assert.strictEqual(grouped._filtersByCat.rarity._itemSortFn, SortUtil.ascSortRarity);
		const categoryPage = new filters.PageFilterTraits();
		const categories = categoryPage._categoryFilter;
		assert.strictEqual(categories.header, "Categories");
		assert.strictEqual(categories.displayHeader, "Categorias");
		assert.deepStrictEqual(Array.from(categories._items, item => item.item), expected);
		assert.strictEqual(categories._displayFn("armor"), "Armadura");
		assert(categories._getRenderedHeader().includes("Categorias"));
		categories.setStateFromLoaded({Categories: {meta: {}, state: {"Ancestry & Heritage": 1}, nestsHidden: {}}});
		assert.strictEqual(categories.getValues().Categories._isActive, false, "Saved selections from the old taxonomy must not block the trait list.");
		const featPage = new filters.PageFilterFeats({sourceFilterOpts: {selFn: () => true}});
		for (const category of ["class", "ancestry", "monster", "creature type"]) assert(!featPage._traitsFilter._filtersByCat[category]);
		assert(featPage._traitsFilter._filtersByCat["class-specific"], "Class-specific mechanics must remain filterable on the Feats page.");
		const ancestryFeat = vm.runInContext(`({name: "Test", traits: ["anão"], source: "PC1", level: 1})`, context);
		featPage.mutateForFilters(ancestryFeat);
		featPage._addToFilters(ancestryFeat, false);
		assert(featPage._ancestryFilter.getValues()["Ancestry & Heritage"]["Anão"] !== undefined);
	} finally {
		Renderer.trait.TRAITS = savedTraits;
		DataUtil.loadJSON = savedLoadJSON;
		BrewUtil.pAddBrewData = savedBrew;
		Renderer.hover.isSmallScreen = savedSmallScreen;
	}
	console.log("##### Trait Category Tests Passed #####");
	return true;
}

module.exports = testTraitCategories();

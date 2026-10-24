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
			window: {addEventListener () {}},
			stringMethods: {toUrlified: String.prototype.toUrlified, toTitleCase: String.prototype.toTitleCase, uppercaseFirst: String.prototype.uppercaseFirst, escapeQuotes: String.prototype.escapeQuotes},
		});
		const filters = vm.runInContext(`Object.assign(String.prototype, stringMethods);\n${read("js/filter.js")}\n${read("js/filter-feats.js")}\n${read("js/filter-traits.js")}\n${read("js/classes.js")}\n${read("js/archetypes.js")}\n({TraitsFilter, PageFilterFeats, PageFilterTraits, ClassesPage, ArchetypesPage});`, context);
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
		assert(grouped._filtersByCat.mechanics.getValues().mechanics[Parser.getTraitName("A trait not installed in the dataset")] !== undefined);
		assert.strictEqual(grouped._filtersByCat.rarity._itemSortFn, SortUtil.ascSortRarity);
		grouped.addItem("Uncommon");
		grouped.addItem("incomum");
		grouped.addItem("auditory");
		assert.strictEqual(grouped._filtersByCat.rarity._items.filter(it => it.item === "Incomum").length, 1);
		assert.strictEqual(grouped._filtersByCat.rarity.getValues().rarity.Uncommon, undefined);
		grouped._filtersByCat.rarity.setStateFromLoaded({rarity: {state: {Uncommon: 1, Incomum: 0}}});
		assert.strictEqual(grouped._filtersByCat.rarity.getValues().rarity.Incomum, 1, "An old English saved selection must resolve to the single canonical option.");
		grouped._filtersByCat.rarity.setValue("Uncommon", 0);
		assert(grouped._filtersByCat.sense.getValues().sense.Auditivo !== undefined);
		assert.strictEqual(grouped._filtersByCat.mechanics.getValues().mechanics.Auditory, undefined);
		specific.setValue("Composição", 0);
		grouped._filtersByCat.sense.setValue("Auditivo", 1);
		assert(grouped.toDisplay(grouped.getValues(), vm.runInContext(`["auditory"]`, context)), "Canonical trait pills must match untranslated authored traits too.");
		assert(!grouped.toDisplay(grouped.getValues(), vm.runInContext(`["Visual"]`, context)));
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
		const featFiles = Object.values(JSON.parse(read("data/feats/index.json")));
		context.featJson = JSON.stringify(featFiles.flatMap(file => JSON.parse(read(`data/feats/${file}`)).feat || []));
		const feats = vm.runInContext(`JSON.parse(featJson)`, context);
		for (const feat of feats) {
			featPage.mutateForFilters(feat);
			featPage._addToFilters(feat, false);
		}
		assert.strictEqual(featPage._classFilter.displayHeader, "Classes");
		featPage._classFilter.setFromSubHashState({flst: ["bard=1"]});
		assert.strictEqual(featPage._classFilter.getValues().Class.Bardo, 1, "Existing @filter links using Class=bard must keep working.");
		featPage._classFilter.setValue("Bard", 0);
		for (const trait of traits.filter(trait => trait.categories.includes("class"))) {
			assert(featPage._classFilter.getValues().Class[trait.name] !== undefined, `${trait.name}: missing from Classes.`);
			for (const name of [trait.name, ...(trait.alias || [])]) {
				assert.strictEqual(featPage._archetypeFilter.getValues().Archetype[name], undefined, `${name}: class names must not be duplicated under Archetype.`);
				assert.strictEqual(featPage._traitsFilter._filtersByCat.mechanics.getValues().mechanics[name], undefined, `${name}: class names must not fall back to Mechanics.`);
			}
		}
		const bardClassFeat = feats.find(feat => feat._fClass.includes("Bardo") && feat._fType.includes("Class"));
		const bardArchetypeFeat = feats.find(feat => feat._fClass.includes("Bardo") && feat._fType.includes("Archetype"));
		const clericFeat = feats.find(feat => feat._fClass.includes("Clérigo"));
		assert(bardClassFeat && bardArchetypeFeat && clericFeat, "Exercise real class and multiclass-archetype feats.");
		assert(!bardArchetypeFeat._fType.includes("Class"), "Class association must not turn archetype feats into ordinary class feats.");
		featPage._classFilter.setValue("Bardo", 1);
		const classState = featPage._classFilter.getValues();
		assert(featPage._classFilter.toDisplay(classState, bardClassFeat._fClass));
		assert(featPage._classFilter.toDisplay(classState, bardArchetypeFeat._fClass));
		assert(!featPage._classFilter.toDisplay(classState, clericFeat._fClass));
		featPage._typeFilter.setValue("Class", 1);
		const typeState = featPage._typeFilter.getValues();
		assert(featPage._typeFilter.toDisplay(typeState, bardClassFeat._fType));
		assert(!featPage._typeFilter.toDisplay(typeState, bardArchetypeFeat._fType));
		filters.ClassesPage.prototype._setFeatClassFilters.call({activeClass: {name: "Bard"}, _getActiveSubclasses: () => [], _featFilter: featPage, _handleFeatFilterChange () {}});
		assert.strictEqual(featPage._classFilter.getValues().Class.Bardo, 1);
		assert.strictEqual(featPage._classFilter.getValues().Class.Bard, undefined);
		filters.ArchetypesPage.prototype._setFeatArchetypeFilters.call({activeArchetype: {name: "Cleric"}, _featFilter: featPage, _handleFeatFilterChange () {}});
		assert.strictEqual(featPage._classFilter.getValues().Class["Clérigo"], 1);
		assert.strictEqual(featPage._classFilter.getValues().Class.Bardo, 0);
		const guild = vm.runInContext(`({name: "Guild Test", traits: ["archetype"], featType: {archetype: ["Test Guild"]}, source: "PC1", level: 2})`, context);
		featPage.mutateForFilters(guild);
		featPage._addToFilters(guild, false);
		assert.deepStrictEqual(Array.from(guild._fArchetype), ["Test Guild"]);
		assert.strictEqual(guild._fClass.length, 0);
		filters.ArchetypesPage.prototype._setFeatArchetypeFilters.call({activeArchetype: {name: "Test Guild"}, _featFilter: featPage, _handleFeatFilterChange () {}});
		assert.strictEqual(featPage._archetypeFilter.getValues().Archetype["Test Guild"], 1);
		assert.strictEqual(featPage._classFilter.getValues().Class["Clérigo"], 0);
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

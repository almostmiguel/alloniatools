"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");
require("../js/render.js");

function testTraitLocalization () {
	const readData = file => JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
	const traits = readData("data/traits.json").trait;
	const previousTraits = Renderer.trait.TRAITS;
	Renderer.trait.TRAITS = Object.fromEntries(traits.map(trait => [trait.name.toLowerCase(), trait]));
	try {
		const rarities = ["Comum", "Incomum", "Raro", "Único"];
		const englishRarities = ["Common", "Uncommon", "Rare", "Unique"];
		assert.strictEqual(Renderer.trait.getDefaultRarity(), "Comum");
		for (let index = 0; index < rarities.length; index++) {
			for (const name of [rarities[index], rarities[index].toUpperCase(), englishRarities[index], `${rarities[index]}|PC1`]) {
				assert.strictEqual(Parser.rarityToNumber(name), index, `${name}: incorrect rarity order.`);
				assert(Renderer.trait.isTraitInCategory(name, "rarity"), `${name}: must be recognized as rarity.`);
				assert(Renderer.trait.getTraitCategories(name).includes("rarity"), `${name}: must appear in the rarity filter group.`);
				const html = Renderer.utils.getTraitsDiv([name]);
				assert(html.includes(`traits.html#${UrlUtil.encodeForHash(rarities[index])}`), `${name}: badge must link to its localized trait.`);
				if (index) assert(html.includes(`pf2-trait--${englishRarities[index].toLowerCase()}`), `${name}: missing rarity color.`);
				else assert(!/pf2-trait--(?:uncommon|rare|unique)/.test(html), "Common must keep the ordinary badge color.");
			}
		}
		assert.deepStrictEqual(["Único", "Raro", "Comum", "Incomum"].sort(SortUtil.ascSortRarity), rarities);
		assert.strictEqual(Parser.rarityToNumber("unknown-rarity"), 69);
		assert.strictEqual(Parser.rarityToNumber(2), 2);

		const source = fs.readFileSync(path.join(__dirname, "../js/filter-feats.js"), "utf8");
		const PageFilterFeats = vm.runInNewContext(`String.prototype.uppercaseFirst = uppercaseFirst;\n${source}\nPageFilterFeats;`, {
			PageFilter: class {},
			SourceFilter: {getCompleteFilterSources: feat => [feat.source]},
			Parser,
			Renderer,
			SortUtil,
			uppercaseFirst: String.prototype.uppercaseFirst,
		});
		const mutateFeat = traitNames => {
			const feat = {name: "Test Feat", source: "PC1", level: 1, traits: traitNames};
			PageFilterFeats.prototype.mutateForFilters.call({}, feat);
			return feat;
		};
		for (const [names, expected] of [
			[["geral"], ["General"]],
			[["perícia"], ["Skill"]],
			[["arquétipo"], ["Archetype"]],
			[["GERAL", "PERÍCIA"], ["General", "Skill"]],
			[["General", "Skill"], ["General", "Skill"]],
			[["Archetype"], ["Archetype"]],
			[["anão"], ["Ancestry"]],
			[["aiuvarin"], ["Ancestry"]],
			[["mago"], ["Class"]],
		]) {
			const feat = mutateFeat(names);
			assert.deepStrictEqual(Array.from(feat._fType).sort(), expected.slice().sort(), `${names.join(", ")}: incorrect feat type.`);
			assert(feat._fTraits.includes("Comum") && !feat._fTraits.includes("Common"), "Unspecified rarity must default to Comum.");
			if (expected.includes("Skill")) assert.strictEqual(feat._slType, "Perícia", "Skill feats must not be duplicated as General in the localized list label.");
		}
		for (const rarity of [...rarities, ...englishRarities]) {
			const feat = mutateFeat([rarity]);
			assert.strictEqual(feat._fTraits.length, 1, `${rarity}: an explicit rarity must not receive an extra default rarity.`);
		}
		const generated = readData("test/schema-template/_generated/traits.json");
		for (const trait of traits) {
			for (const category of trait.categories || []) {
				const key = Parser.traitCategoryToSchemaKey(category);
				assert(generated.definitions[key]?.enum.includes(trait.name.toLowerCase()), `${trait.name}: missing from generated ${category} schema. Run npm run build:schema:traits.`);
			}
		}
		Renderer.trait.TRAITS = {common: {name: "Common", categories: ["rarity"]}};
		assert.strictEqual(Renderer.trait.getDefaultRarity(), "Common", "English-only trait data must still be supported.");
		assert(Renderer.trait.isTraitInCategory("Comum", "rarity"));
	} finally {
		Renderer.trait.TRAITS = previousTraits;
	}
	console.log("##### Trait Localization Tests Passed #####");
	return true;
}

module.exports = testTraitLocalization();

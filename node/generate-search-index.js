const fs = require("fs");
const utS = require("./util-search-index");

function getUniqueTagSourceIndex (index) {
	const sourcesByTagAndName = {};
	const sourceById = Object.fromEntries(Object.entries(index.m.s || {}).map(([source, id]) => [id, source]));

	index.x.forEach(({c: category, n: name, s: sourceId}) => {
		const tag = Parser.CAT_ID_TO_PROP[category];
		const source = sourceById[sourceId];
		if (!tag || !name || !source || !Parser.TAG_TO_DEFAULT_SOURCE[tag]) return;

		const normalizedName = name.trim().toLowerCase();
		(sourcesByTagAndName[tag] = sourcesByTagAndName[tag] || {})[normalizedName] = sourcesByTagAndName[tag][normalizedName] || new Set();
		sourcesByTagAndName[tag][normalizedName].add(source);
	});

	return Object.fromEntries(Object.entries(sourcesByTagAndName)
		.map(([tag, names]) => [tag, Object.fromEntries(Object.entries(names)
			.filter(([_, sources]) => sources.size === 1)
			.map(([name, sources]) => [name, [...sources][0]]))])
		.filter(([_, names]) => Object.keys(names).length));
}

async function main () {
	console.log("Creating primary index...");

	if (!fs.existsSync("search")) {
		console.log("Creating search folder.");
		fs.mkdirSync("search");
	}

	const index = await utS.UtilSearchIndex.pGetIndex();
	fs.writeFileSync("search/index.json", JSON.stringify(index), "utf8");
	fs.writeFileSync("data/generated/tag-source-index.json", JSON.stringify(getUniqueTagSourceIndex(index)), "utf8");

	console.log("Creating secondary index: Items...");
	const indexItems = await utS.UtilSearchIndex.pGetIndexAdditionalItem();
	fs.writeFileSync("search/index-item.json", JSON.stringify(indexItems), "utf8");

	console.log("Creating trait index...");
	const indexTraits = await utS.UtilSearchIndex.pGetIndexTraits();
	fs.writeFileSync("search/traits.json", JSON.stringify(indexTraits), "utf8");

	console.log("Creating alternate index: Spells...");
	const indexAltSpells = await utS.UtilSearchIndex.pGetIndexAlternate("spell");
	fs.writeFileSync("search/index-alt-spell.json", JSON.stringify(indexAltSpells), "utf8");
}

module.exports = main();

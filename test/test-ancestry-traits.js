"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");
require("../js/render.js");

function testAncestryTraits () {
	const templates = [];
	const node = {empty () { return this; }, appendTo () { return this; }, append () { return this; }, show () { return this; }};
	const source = fs.readFileSync(path.join(__dirname, "../js/ancestries.js"), "utf8");
	const AncestriesPage = vm.runInNewContext(`String.prototype.toTitleCase = toTitleCase; String.prototype.escapeQuotes = escapeQuotes;\n${source}\nAncestriesPage;`, {
		BaseComponent: class {},
		window: {addEventListener () {}},
		Renderer,
		Parser,
		toTitleCase: String.prototype.toTitleCase,
		escapeQuotes: String.prototype.escapeQuotes,
		$: () => node,
		$$: (parts, ...values) => {
			templates.push(parts.reduce((html, part, index) => `${html}${part}${values[index] ?? ""}`, ""));
			return node;
		},
	});
	AncestriesPage._render_$getNoContent = () => node;
	AncestriesPage._render_$getNoHeritage = () => node;
	const dir = path.join(__dirname, "../data/ancestries");
	const ancestries = fs.readdirSync(dir).filter(file => file.endsWith(".json"))
		.flatMap(file => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")).ancestry || []);
	assert(ancestries.length, "The test needs ancestry data.");
	const illustratedAncestry = {...ancestries[0], flavor: ["Ancestry flavor."], info: ["Ancestry prose."], images: ["img/test-flavor.webp", "img/test-prose.webp"]};
	for (const ancestry of [...ancestries, illustratedAncestry]) {
		const before = JSON.stringify(ancestry);
		templates.length = 0;
		AncestriesPage.prototype._render_renderAncestry.call({
			activeAncestry: ancestry,
			activeAncestryAllHeritages: [],
			_veHeritagesDataList: [],
			_render_renderHeritageStats: () => "",
			_render_renderImages () {},
			_render_renderAncestryTabs () {},
		});
		const mechanics = templates[0];
		if (ancestry === illustratedAncestry) {
			const infoHtml = templates[1];
			assert(infoHtml.includes("Ancestry flavor.") && infoHtml.includes("Ancestry prose."));
			assert(!infoHtml.includes("test-flavor.webp") && !infoHtml.includes("test-prose.webp"), "Ancestry images must only appear in the Images tab.");
			assert(!mechanics.includes("test-flavor.webp") && !mechanics.includes("test-prose.webp"), "Ancestry Info images must not change Mechanics.");
		}
		const sidebar = mechanics.match(/<div class="pf2-sidebar[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[0];
		assert(sidebar, `${ancestry.name}: missing stats sidebar.`);
		const traits = [...(ancestry.rarity ? [ancestry.rarity] : []), ...(ancestry.traits || [])];
		if (traits.length) {
			const badges = Renderer.utils.getTraitsDiv(traits.slice());
			assert(sidebar.includes("Traços"), `${ancestry.name}: missing Traços heading.`);
			assert(sidebar.includes(badges), `${ancestry.name}: original trait badges must appear in the sidebar.`);
			assert(!mechanics.replace(sidebar, "").includes(`class="pf2-trait`), `${ancestry.name}: trait badges must not remain below the ancestry title.`);
			if (ancestry.languages?.length) assert(sidebar.indexOf("Idiomas") < sidebar.indexOf("Traços"), `${ancestry.name}: Traços must follow languages.`);
			const feature = ancestry.feature || ancestry.features?.[0];
			if (feature) assert(sidebar.indexOf("Traços") < sidebar.indexOf(feature.name), `${ancestry.name}: Traços must precede ancestry features.`);

			const preview = Renderer.ancestry.getRenderedString({...ancestry, __prop: "ancestry"}, {noPage: true});
			const gridStart = preview.indexOf(`<div class="pf2-sidebar--compact">`);
			assert(gridStart !== -1, `${ancestry.name}: missing compact preview stats.`);
			assert(!preview.slice(0, gridStart).includes(`class="pf2-trait`), `${ancestry.name}: preview badges must not appear above the stats.`);
			assert(preview.slice(gridStart).includes(`<p class="pf2-title">Traços</p><p class="pf2-sidebar__text">${badges}</p>`), `${ancestry.name}: preview Traços must contain the original linked badges.`);
			if (ancestry.languages?.length) assert(preview.indexOf("Idiomas") < preview.indexOf("Traços"), `${ancestry.name}: preview Traços must follow languages.`);
			if (feature) assert(preview.indexOf("Traços") < preview.indexOf(feature.name), `${ancestry.name}: preview Traços must precede ancestry features.`);
		}
		assert.strictEqual(JSON.stringify(ancestry), before, `${ancestry.name}: rendering must not change ancestry data.`);
	}
	console.log("##### Ancestry Trait Placement Tests Passed #####");
	return true;
}

module.exports = testAncestryTraits();

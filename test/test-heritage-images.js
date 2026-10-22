"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");
require("../js/render.js");

function testHeritageImages () {
	const created = [];
	const makeNode = markup => {
		const node = {
			markup,
			attributes: {},
			appendTo (parent) { this.parent = parent; return this; },
			attr (key, value) {
				if (typeof key === "object") Object.assign(this.attributes, key);
				else this.attributes[key] = value;
				return this;
			},
			text (value) { this.label = value; return this; },
		};
		created.push(node);
		return node;
	};
	const source = fs.readFileSync(path.join(__dirname, "../js/ancestries.js"), "utf8");
	const AncestriesPage = vm.runInNewContext(`String.prototype.escapeQuotes = ${String.prototype.escapeQuotes.toString()};\n${source}\nAncestriesPage;`, {
		BaseComponent: class {},
		window: {addEventListener () {}},
		Renderer,
		Parser,
		UrlUtil,
		$: makeNode,
	});
	const renderHeritage = heritage => {
		Renderer.get().resetHeaderIndex();
		return AncestriesPage.prototype._render_renderHeritageStats(heritage);
	};
	const heritage = {name: "Cambiante", source: "PC1", versatile: true, entries: ["Heritage mechanics text."]};
	const images = ["img/heritages/cambiante.webp", "https://example.com/heritage.webp"];
	const withImages = {...heritage, images};
	const html = renderHeritage(withImages);
	assert(html.includes("Heritage mechanics text."));
	assert(!html.includes("<img") && !html.includes("anc__ve-heritage"), "Heritage images belong only in the Images tab.");

	for (const plainHeritage of [heritage, withImages, {...heritage, summary: {images}}, {...heritage, images: []}, {...heritage, versatile: false, images}, {...heritage, versatile: false, summary: {images}}, {...heritage, versatile: false, rarity: "incomum", images}]) {
		const actual = renderHeritage(plainHeritage);
		Renderer.get().resetHeaderIndex().setFirstSection(false);
		const expected = `<div data-heritage-id="${UrlUtil.getStateKeyHeritage(plainHeritage)}">${Renderer.get().render({type: "pf2-h3", name: plainHeritage.name, entries: plainHeritage.entries})}</div>`;
		assert.strictEqual(actual, expected, "Normal heritages and heritages without images must keep their existing markup.");
	}

	for (const imageList of [[], images]) {
		const rareHeritage = {...heritage, rarity: "incomum", images: imageList};
		const rareBefore = JSON.stringify(rareHeritage);
		const rarityHtml = renderHeritage(rareHeritage);
		assert(rarityHtml.includes(`Cambiante (<a href="traits.html#incomum"`), "Versatile heritage rarity must link to its trait beside the title.");
		assert(rarityHtml.includes(`>Incomum</a>)`), "The linked rarity must be capitalized and enclosed in parentheses.");
		assert(rarityHtml.includes(`data-heritage-id="${UrlUtil.getStateKeyHeritage(heritage)}"`), "Displaying rarity must not change the heritage selection key.");
		assert.strictEqual(JSON.stringify(rareHeritage), rareBefore, "Displaying rarity must not change the heritage name or data.");
	}

	const renderInfo = value => {
		Renderer.get().resetHeaderIndex();
		return AncestriesPage.prototype._render_renderHeritageFluff(value);
	};
	const flavor = ["First flavor paragraph with {@b emphasis}.", "Second flavor paragraph."];
	const detailedInfo = {type: "pf2-h1", name: "Cambiante", entries: ["Detailed heritage lore."]};
	for (const info of [[detailedInfo], ["Detailed heritage lore."], undefined]) {
		const withFlavor = {...heritage, flavor, info};
		const original = JSON.stringify(withFlavor);
		const infoHtml = renderInfo(withFlavor);
		assert(infoHtml.includes(`class="pf2-flavor"`), "Versatile heritage flavor must use the existing decorative flavor style.");
		assert.strictEqual((infoHtml.match(/class="pf2-h1-flavor rd__h"/g) || []).length, 2, "Each flavor paragraph must be rendered.");
		assert(infoHtml.includes("<b>emphasis</b>"), "Flavor must support renderer tags.");
		assert.strictEqual((infoHtml.match(/>Cambiante<\/span>/g) || []).length, 1, "Flavor must have one heritage heading, without duplicating existing headings.");
		assert(infoHtml.indexOf(">Cambiante</span>") < infoHtml.indexOf("First flavor"));
		if (info) assert(infoHtml.indexOf("Second flavor") < infoHtml.indexOf("Detailed heritage lore."), "Flavor must precede detailed info.");
		assert(infoHtml.includes(`data-heritage-id="${UrlUtil.getStateKeyHeritage(heritage)}"`), "Flavor must follow heritage selection visibility.");
		assert(!renderHeritage(withFlavor).includes("First flavor"), "Flavor belongs only in the Info tab.");
		assert.strictEqual(JSON.stringify(withFlavor), original, "Rendering flavor must not change source data.");
	}
	for (const unchanged of [{...heritage, info: [detailedInfo]}, {...heritage, flavor: [], info: [detailedInfo]}, {...heritage, versatile: false, flavor, info: [detailedInfo]}]) {
		const actual = renderInfo(unchanged);
		Renderer.get().resetHeaderIndex().setFirstSection(false);
		const expected = `<div data-heritage-id="${UrlUtil.getStateKeyHeritage(unchanged)}">${Renderer.get().render(unchanged.info)}</div>`;
		assert.strictEqual(actual, expected, "Existing Info layouts must stay unchanged unless versatile heritage flavor is provided.");
	}
	for (const info of [[detailedInfo], ["Detailed heritage lore."], undefined]) {
		const withImagesAndFlavor = {...heritage, flavor, info, images};
		const html = renderInfo(withImagesAndFlavor);
		assert(html.includes("First flavor") && html.includes("pf2-flavor"));
		images.forEach(url => assert(!html.includes(url), "Linked images must not appear in Info prose or flavor."));
		assert.strictEqual(html, renderInfo({...withImagesAndFlavor, images: undefined}), "Image metadata must not affect Info layout.");
	}
	const ancestry = {name: "Gnomo", images: ["img/gnomo.webp"]};
	const regular = {...heritage, name: "Normal Heritage", versatile: false, images: ["img/normal.webp"]};
	const legacy = {...heritage, name: "Legacy Heritage", summary: {images: ["img/legacy.webp"]}};
	const page = {activeAncestry: ancestry, activeAncestryAllHeritages: [withImages, regular, legacy]};
	const gallery = {};
	AncestriesPage.prototype._render_renderImages.call(page, gallery);
	const galleryImages = created.filter(node => node.markup.startsWith("<img"));
	assert.deepStrictEqual(galleryImages.map(node => node.attributes.src), [...ancestry.images, ...images, ...regular.images, ...legacy.summary.images], "The Images tab must retain ancestry, versatile, normal, and legacy images.");
	galleryImages.forEach(node => {
		assert.strictEqual(node.parent.attributes.href, node.attributes.src, "Gallery images must still open their full-size link.");
		assert(node.attributes.alt);
	});
	const heritageFigure = galleryImages[1].parent.parent;
	assert.strictEqual(heritageFigure.attributes["data-heritage-id"], UrlUtil.getStateKeyHeritage(heritage), "Gallery images must still follow heritage selection.");
	console.log("##### Heritage Rendering Tests Passed #####");
	return true;
}

module.exports = testHeritageImages();

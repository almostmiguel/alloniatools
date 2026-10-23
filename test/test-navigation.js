"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");

async function testNavigation () {
	const campaigns = [
		{id: "undated", name: "Undated Campaign"},
		{id: "newer", name: "Newer Campaign", published: "2025-02-01"},
		{id: "later", name: "Later Campaign", published: "2024-06-01"},
		{id: "earlier", name: "Earlier Campaign", published: "2024-01-01", color: "#5ab3a8"},
	];
	const element = {prepend () {}};
	const context = {
		window: {addEventListener () {}},
		document: {getElementById: () => element, createElement: () => ({})},
		styleSwitcher: {getActiveDayNight: () => "day", getActiveWide: () => false},
		StyleSwitcher: {STYLE_NIGHT: "night"},
		Renderer: {get: () => ({baseUrl: ""})},
		DataUtil: {loadJSON: async () => ({adventure: campaigns})},
		SortUtil,
	};
	const source = fs.readFileSync(path.join(__dirname, "../js/navigation.js"), "utf8");
	const nav = vm.runInNewContext(`${source}\nNavBar;`, context);
	const links = [];
	const dropdowns = [];
	nav._addElement_li = (parent, page, name, opts) => links.push({parent, page, name, opts});
	nav._addElement_dropdown = (parent, name, opts) => dropdowns.push({parent, name, opts});
	nav._addElement_divider = () => {};
	nav._addElement_label = () => {};
	nav._addElement_button = () => {};
	nav.highlightCurrentPage = () => {};
	nav._initElements();
	assert(dropdowns.some(dropdown => dropdown.parent === "Mestre" && dropdown.name === "Campanhas" && dropdown.opts.isSide));
	assert(!dropdowns.some(dropdown => dropdown.parent == null && dropdown.name === "Campanhas"));
	for (const link of links) assert(fs.existsSync(path.join(__dirname, "..", link.page)), `Missing navigation page: ${link.page}`);

	links.length = 0;
	await nav._initCampaignElements();
	assert.deepStrictEqual(links.map(link => link.opts.aHash), ["earlier", "later", "newer", "undated"]);
	assert.deepStrictEqual(links.map(link => link.opts.date), [2024, null, 2025, null]);
	assert(links.every(link => link.parent === "Campanhas" && link.opts.isSide && link.opts.isAddDateSpacer));
	assert.strictEqual(links[0].opts.color, "#5ab3a8");
	assert.strictEqual(nav._getCampaignColor(campaigns[1]), nav._getCampaignColor({...campaigns[1], name: "Renamed"}));
	assert(!nav._getCampaignColor({id: "unsafe", color: "red; invalid"}).includes("invalid"));
	assert(nav._addElement_getSourcePrefix({color: "#5ab3a8"}).includes(`style="color: #5ab3a8"`));
	console.log("##### Navigation Tests Passed #####");
	return true;
}

module.exports = testNavigation();

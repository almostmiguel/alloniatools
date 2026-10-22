"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("../js/utils.js");

async function testAncestryFeatFilters () {
	const node = {toggleClass () { return this; }, children () { return this; }, get () { return []; }};
	const box = {off () { return this; }, on () { return this; }};
	const source = fs.readFileSync(path.join(__dirname, "../js/ancestries.js"), "utf8");
	const AncestriesPage = vm.runInNewContext(`${source}\nAncestriesPage;`, {
		BaseComponent: class {},
		window: {addEventListener () {}},
		Parser,
		UrlUtil,
		FilterBox: {EVNT_VALCHANGE: "change"},
		MiscUtil: {pDefer () {}},
		$: () => node,
		setTimeout () {},
	});
	const aiuvarin = {name: "Aiuvarin", source: "PC1", versatile: true, traits: ["aiuvarin"]};
	const other = {name: "Nefilim", source: "PC1", versatile: true, traits: ["nefilim"]};
	const standard = {name: "Anão da Forja", source: "PC1"};
	const pills = {"Anão": 0, Aiuvarin: 0, Nefilim: 2, Elfo: 1, _isActive: true};
	const ancestryFilter = {
		header: "Ancestry & Heritage",
		getValues: () => ({"Ancestry & Heritage": pills}),
		setValue: (key, value) => { pills[key] = value; },
	};
	const hooks = {};
	let refreshes = 0;
	const page = {
		activeAncestry: {name: "anão"},
		activeAncestryAllHeritages: [aiuvarin, other, standard],
		_state: {isShowFeats: false, [UrlUtil.getStateKeyHeritage(aiuvarin)]: true, [UrlUtil.getStateKeyHeritage(standard)]: true},
		_featFilter: {_ancestryFilter: ancestryFilter},
		_handleFeatFilterChange () { refreshes++; },
		_getActiveHeritages: AncestriesPage.prototype._getActiveHeritages,
		_setFeatAncestryFilters: AncestriesPage.prototype._setFeatAncestryFilters,
		_initHashAndStateSync () {},
		filterBox: box,
		featFilterBox: box,
		_list: {items: []},
		_listFeat: {items: []},
		_addHook () {},
		_addHookAll () {},
		_addHookBase (key, callback) { (hooks[key] ||= []).push(callback); },
		_render_renderAncestry () {},
		_render_renderHeritageTabs () {},
		_render_renderFeat () {},
		_updateImageEmptyState () {},
		_handleFilterChange () {},
		_$wrpOutline: node,
		_$divNoHeritage: node,
		_$divNoContent: node,
		_isAnyHeritageActive: () => true,
		_isAnyContentActive: () => true,
	};
	const selected = () => Object.keys(pills).filter(key => !key.startsWith("_") && pills[key] === 1).sort();
	page._setFeatAncestryFilters();
	assert.deepStrictEqual(selected(), ["Aiuvarin", "Anão"]);
	assert.strictEqual(pills.Nefilim, 0, "Stale heritage exclusions must be cleared.");
	assert.strictEqual(pills._isActive, true, "Filter metadata must not be overwritten.");
	assert(!Object.hasOwn(pills, "aiuvarin") && !Object.hasOwn(pills, "Anão da Forja"), "Only existing, canonical filter pills should be set.");
	assert.strictEqual(refreshes, 1);

	await AncestriesPage.prototype._pDoRender.call(page);
	pills.Aiuvarin = 0;
	pills.Elfo = 1;
	page._state.isShowFeats = true;
	hooks.isShowFeats.forEach(callback => callback());
	assert.deepStrictEqual(selected(), ["Aiuvarin", "Anão"], "Opening Show Feats must synchronize selected versatile heritages.");
	page._state[UrlUtil.getStateKeyHeritage(aiuvarin)] = false;
	hooks[UrlUtil.getStateKeyHeritage(aiuvarin)].forEach(callback => callback());
	assert.deepStrictEqual(selected(), ["Anão"], "Deselecting a heritage must remove its feat filter.");
	page._state[UrlUtil.getStateKeyHeritage(other)] = true;
	hooks[UrlUtil.getStateKeyHeritage(other)].forEach(callback => callback());
	assert.deepStrictEqual(selected(), ["Anão", "Nefilim"], "Selecting another heritage must update visible feat filters.");
	page.activeAncestry = {name: "elfo"};
	page._setFeatAncestryFilters();
	assert.deepStrictEqual(selected(), ["Elfo", "Nefilim"], "Changing ancestry must replace the old ancestry filter.");
	console.log("##### Ancestry Feat Filter Tests Passed #####");
	return true;
}

module.exports = testAncestryFeatFilters();

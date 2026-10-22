"use strict";

const fs = require("fs");
const path = require("path");
require("../js/utils.js");
require("../js/render.js");
require("../js/render-dice.js");
const {Omnidexer} = require("../js/omnidexer.js");

async function testReferenceData () {
	const readData = file => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", file), "utf8"));
	const errors = [];
	const quickReference = readData("generated/bookref-quick.json");
	const source = readData("quickreference.json");
	const contents = quickReference.reference?.["bookref-quick"]?.contents;
	const chapters = quickReference.data?.["bookref-quick"];
	const renderer = new Renderer();
	if (!contents?.length || !chapters?.length || contents.length !== chapters.length) {
		errors.push("Quick Reference needs nonempty, matching contents and chapters. Run npm run gen-all.");
	} else {
		contents.forEach((section, index) => {
			if (!section.headers?.length) errors.push(`Quick Reference: ${section.name} has no headings.`);
			if (chapters[index].type !== "section" || chapters[index].name !== source.quickReference[index]?.name) errors.push(`Quick Reference: ${section.name} is missing its main section heading.`);
			if (JSON.stringify(chapters[index].entries) !== JSON.stringify(source.quickReference[index]?.entries)) errors.push(`Quick Reference: ${section.name} does not match its source text.`);
			try {
				const html = renderer.render(chapters[index]);
				if (!html.trim()) errors.push(`Quick Reference: ${section.name} renders no content.`);
				if (!html.includes(`>${renderer.render(section.name)}</span>`)) errors.push(`Quick Reference: ${section.name} does not render its main heading.`);
			} catch (error) {
				errors.push(`Quick Reference: ${section.name} cannot render: ${error.message}`);
			}
		});
	}

	if (!source.pageReferences || !Object.keys(source.pageReferences).length) {
		errors.push("Quick Reference needs page-topic notes in pageReferences.");
	} else {
		const loadJSON = DataUtil.loadJSON;
		DataUtil.loadJSON = async url => {
			if (!url.endsWith("data/quickreference.json")) throw new Error(`Unexpected reference data URL: ${url}`);
			return source;
		};
		try {
			for (const topic of Object.keys(source.pageReferences)) {
				try {
					if (!(await Renderer.utils.pGetQuickReference(topic)).trim()) errors.push(`Quick Reference: ${topic} has no page notes.`);
				} catch (error) {
					errors.push(`Quick Reference: ${topic} page notes cannot render: ${error.message}`);
				}
			}
			if (await Renderer.utils.pGetQuickReference("__missing_topic__") !== Renderer.utils.HTML_NO_INFO) errors.push("Missing reference topics must display the no-information message.");
		} finally {
			DataUtil.loadJSON = loadJSON;
		}
	}

	const rules = readData("variantrules.json").variantrule;
	if (!rules?.length || !rules.some(rule => rule.category === "Subsystem")) errors.push("Variant Rules needs rule and subsystem entries.");
	const indexers = Omnidexer.TO_INDEX.filter(indexer => indexer.file === "variantrules.json");
	for (const rule of rules || []) {
		const matches = indexers.filter(indexer => indexer.include(rule));
		const category = rule.category === "Subsystem" ? Parser.CAT_ID_SUBSYSTEM : Parser.CAT_ID_VARIANT_RULE;
		if (matches.length !== 1 || matches[0].category !== category) errors.push(`Wrong search category for ${rule.name}.`);
		try {
			Renderer.variantrule.getRenderedString(rule);
		} catch (error) {
			errors.push(`Variant Rules: ${rule.name} cannot render: ${error.message}`);
		}
	}
	if (errors.length) errors.forEach(error => console.error(error));
	else console.log("##### Reference Data Tests Passed #####");
	return !errors.length;
}

module.exports = testReferenceData();

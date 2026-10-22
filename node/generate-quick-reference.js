const fs = require("fs");
const source = JSON.parse(fs.readFileSync("data/quickreference.json", "utf8"));

if (!Array.isArray(source.quickReference) || !source.quickReference.length) throw new Error("Quick Reference needs at least one section in data/quickreference.json.");

const contents = source.quickReference.map(section => {
	if (!section.name || !Array.isArray(section.entries) || !section.entries.length) throw new Error("Quick Reference sections need a name and entries.");
	return {name: section.name, headers: section.entries.map(entry => entry.name).filter(Boolean)};
});
const out = {
	reference: {
		"bookref-quick": {name: "Quick Reference", id: "bookref-quick", contents},
	},
	data: {
		"bookref-quick": source.quickReference.map(section => ({type: "section", name: section.name, entries: section.entries})),
	},
};
fs.writeFileSync("data/generated/bookref-quick.json", JSON.stringify(out), "utf8");
console.log("Updated Quick references.");

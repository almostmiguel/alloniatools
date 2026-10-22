"use strict";

function handleFail () {
	console.error("Tests failed!");
	process.exit(1);
}

async function main () {
	let testsPassed = true;
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-misc");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-campaigns");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-reference-data");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-navigation");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-heritage-images");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-ancestry-traits");
	if (!testsPassed) handleFail();
	testsPassed = testsPassed && await require("./test-ancestry-feat-filters");
	if (!testsPassed) handleFail();
	process.exit(0);
}

main()
	.then(() => console.log("Tests complete."))
	.catch(e => {
		console.error(e);
		throw e;
	});

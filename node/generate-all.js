async function main () {
	require("./generate-quick-reference");
	await require("./generate-search-index");
	require("./generate-feat-trees");
	require("./generate-nav-adventure-book-index");
}

main().catch(e => { throw e; });

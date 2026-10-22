"use strict";

window.addEventListener("load", async () => {
	BookUtil.renderArea = $(`#pagecontent`);
	try {
		const data = await DataUtil.loadJSON("data/adventures.json");
		$(`ul.contents`).append($(`<li><a href="adventures.html" class="lst--border"><span class="name">\u21FD All Campaigns</span></a></li>`));

		BookUtil.baseDataUrl = "data/adventure/adventure-";
		BookUtil.contentType = "campaign";
		BookUtil.bookIndex = data.adventure || [];
		BookUtil.initLinkGrabbers();
		BookUtil.initScrollTopFloat();

		const contents = BookUtil.bookIndex.map((campaign, index) => BookUtil.getContentsItem(
			index,
			campaign,
			{book: campaign, addOnclick: true, defaultHeadersHidden: true},
		)).join("");
		$(`ul.contents`).append(contents);
		BookUtil.addHeaderHandles(true);
		$(`.book-head-message`).text("Select a campaign and session from the list on the left.");
		$(`.book-loading-message`).text(BookUtil.bookIndex.length ? "Select a campaign to begin." : "No campaigns have been added yet.");

		window.onhashchange = BookUtil.booksHashChange;
		if (window.location.hash.length) BookUtil.booksHashChange();
		else $(`.contents-item`).show();

		window.dispatchEvent(new Event("toolsLoaded"));
	} catch (error) {
		$(`.book-loading-message`).text("Could not load campaigns. Check the campaign index and try again.");
		throw error;
	}
});

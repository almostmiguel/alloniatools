"use strict";

window.addEventListener("load", async () => {
	BookUtil.renderArea = $(`#pagecontent`);
	try {
		const data = await DataUtil.loadJSON("data/adventures.json");
		$(`ul.contents`).append($(`<li><a href="adventures.html" class="lst--border"><span class="name">\u21FD Todas as Campanhas</span></a></li>`));

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
		$(`.book-head-message`).text("Selecione uma campanha e uma sessão na lista à esquerda.");
		$(`.book-loading-message`).text(BookUtil.bookIndex.length ? "Selecione uma campanha para começar." : "Nenhuma campanha cadastrada.");

		window.onhashchange = BookUtil.booksHashChange;
		if (window.location.hash.length) BookUtil.booksHashChange();
		else $(`.contents-item`).show();

		window.dispatchEvent(new Event("toolsLoaded"));
	} catch (error) {
		$(`.book-loading-message`).text("Não foi possível carregar as campanhas. Confira o índice de campanhas e tente novamente.");
		throw error;
	}
});

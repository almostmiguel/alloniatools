"use strict";

class Campaigns {
	static sortCampaigns (dataList, a, b, opts) {
		a = dataList[a.ix];
		b = dataList[b.ix];
		const byName = () => SortUtil.ascSortLower(a.name, b.name);
		if (opts.sortBy === "storyline") return SortUtil.ascSortLower(a.storyline || "", b.storyline || "") || byName();
		if (opts.sortBy === "sessions") return SortUtil.ascSort(a.contents.length, b.contents.length) || byName();
		if (opts.sortBy === "published") return SortUtil.ascSort(a.published || "", b.published || "") || byName();
		return byName();
	}
}

const campaignsList = new BooksList({
	contentsUrl: "data/adventures.json",
	fnSort: Campaigns.sortCampaigns,
	sortByInitial: "name",
	sortDirInitial: "asc",
	dataProp: "adventure",
	rootPage: "adventure.html",
	rowBuilderFn: campaign => `<span class="col-6-2 bold">${campaign.name}</span>
		<span class="col-2-5">${campaign.storyline || "\u2014"}</span>
		<span class="col-1-3">${campaign.contents.length}</span>
		<span class="col-2">${BooksList.getDateStr(campaign)}</span>`,
});

window.addEventListener("load", () => campaignsList.pOnPageLoad());

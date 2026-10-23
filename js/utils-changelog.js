"use strict";

class UtilsChangelog {
	static renderChangelog (changelog, $wrp) {
		$wrp.empty();
		if (!changelog.length) {
			$(`<p class="text-muted text-center mt-3">Nenhuma alteração registrada.</p>`).appendTo($wrp);
			return;
		}

		changelog.slice().reverse().forEach(entry => {
			const $entry = $(`<section class="mb-4"></section>`).appendTo($wrp);
			const $header = $(`<div class="split-v-center"></div>`).appendTo($entry);
			$(`<h2></h2>`).text(`v${entry.ver}${entry.title ? ` \u2014 ${entry.title}` : ""}`).appendTo($header);
			$(`<span class="text-muted"></span>`).text(entry.date || "").appendTo($header);

			let $list = null;
			(entry.txt || "").split("\n").forEach(line => {
				if (line.trim().startsWith("- ")) {
					if (!$list) $list = $(`<ul></ul>`).appendTo($entry);
					$(`<li></li>`).text(line.trim().slice(2)).appendTo($list);
				} else {
					$list = null;
					if (line.trim()) $(`<p></p>`).text(line).appendTo($entry);
				}
			});
		});
	}
}

"use strict";

const fs = require("fs");
const path = require("path");
require("../js/utils.js");
require("../js/render.js");

function testCampaigns () {
	const root = path.join(__dirname, "..");
	const campaigns = JSON.parse(fs.readFileSync(path.join(root, "data/adventures.json"), "utf8")).adventure;
	const errors = [];
	const ids = new Set();
	const renderer = new Renderer();

	if (!Array.isArray(campaigns)) throw new Error("data/adventures.json must contain an adventure array.");
	for (const campaign of campaigns) {
		if (!campaign.id || !/^[a-z0-9-]+$/.test(campaign.id)) {
			errors.push("Campaign IDs must use lowercase letters, numbers, and hyphens.");
			continue;
		}
		if (ids.has(campaign.id)) errors.push(`Duplicate campaign ID: ${campaign.id}`);
		ids.add(campaign.id);
		if (!campaign.name || !campaign.source) errors.push(`${campaign.id}: missing name or source.`);
		if (campaign.color && !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(campaign.color)) errors.push(`${campaign.id}: color must be a hex value such as #5ab3a8.`);
		if (campaign.published) {
			const date = new Date(`${campaign.published}T00:00:00Z`);
			if (!/^\d{4}-\d{2}-\d{2}$/.test(campaign.published) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== campaign.published) errors.push(`${campaign.id}: start date must be a valid YYYY-MM-DD date.`);
		}
		if (!Array.isArray(campaign.contents) || !campaign.contents.length) {
			errors.push(`${campaign.id}: add at least one session to contents.`);
			continue;
		}

		const file = path.join(root, "data/adventure", `adventure-${campaign.id}.json`);
		if (!fs.existsSync(file)) {
			errors.push(`${campaign.id}: missing campaign content file.`);
			continue;
		}
		const body = JSON.parse(fs.readFileSync(file, "utf8"));
		if (body.id !== campaign.id) errors.push(`${campaign.id}: content file ID does not match the index.`);
		if (!Array.isArray(body.data) || body.data.length !== campaign.contents.length) {
			errors.push(`${campaign.id}: contents and data must have the same number of sessions.`);
			continue;
		}

		campaign.contents.forEach((session, index) => {
			const label = `${campaign.id}, session ${index + 1}`;
			if (!session.name || !body.data[index].name) errors.push(`${label}: missing session name.`);
			if (session.ordinal) {
				try {
					Parser.bookOrdinalToAbv(session.ordinal);
				} catch (error) {
					errors.push(`${label}: ${error.message}`);
				}
			}
			const names = new Set();
			MiscUtil.getWalker({isNoModification: true}).walk(body.data[index], {
				object: entry => { if (entry.name) names.add(entry.name); },
			});
			(session.headers || []).forEach(header => {
				const name = typeof header === "string" ? header : header.header;
				if (!names.has(name)) errors.push(`${label}: contents heading "${name}" does not exist in the session.`);
			});
			try {
				renderer.render(body.data[index]);
			} catch (error) {
				errors.push(`${label}: cannot render session: ${error.message}`);
			}
		});
	}
	if (errors.length) errors.forEach(error => console.error(error));
	else console.log("##### Campaign Tests Passed #####");
	return !errors.length;
}

module.exports = testCampaigns();

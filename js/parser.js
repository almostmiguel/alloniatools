// PARSING =============================================================================================================
Parser = {};
Parser._parse_aToB = function (abMap, a, fallback) {
	if (a === undefined || a === null) {
		throw new TypeError("undefined or null object passed to parser");
	}
	if (typeof a === "string") a = a.trim();
	if (abMap[a] !== undefined) return abMap[a];
	return fallback !== undefined ? fallback : a;
};

Parser._parse_bToA = function (abMap, b) {
	if (b === undefined || b === null) {
		throw new TypeError("undefined or null object passed to parser");
	}
	if (typeof b === "string") b = b.trim();
	for (const v in abMap) {
		if (!abMap.hasOwnProperty(v)) continue;
		if (abMap[v] === b) return v;
	}
	return b;
};
Parser.numberToText = function (number, freq) {
	if (number == null) {
		throw new TypeError(`undefined or null object passed to parser`);
	}
	// TODO: Hacky fix for frequencies
	if (typeof number === "string") return number;
	if (Math.abs(number) >= 100) return `${number}`;

	function getAsText (num) {
		const abs = Math.abs(num);
		switch (abs) {
			case 0:
				return "zero";
			case 1:
				if (freq) {
					return "once";
				} else return "one";
			case 2:
				if (freq) {
					return "twice";
				} else return "two";
			case 3:
				return "three";
			case 4:
				return "four";
			case 5:
				return "five";
			case 6:
				return "six";
			case 7:
				return "seven";
			case 8:
				return "eight";
			case 9:
				return "nine";
			case 10:
				return "ten";
			case 11:
				return "eleven";
			case 12:
				return "twelve";
			case 13:
				return "thirteen";
			case 14:
				return "fourteen";
			case 15:
				return "fifteen";
			case 16:
				return "sixteen";
			case 17:
				return "seventeen";
			case 18:
				return "eighteen";
			case 19:
				return "nineteen";
			case 20:
				return "twenty";
			case 30:
				return "thirty";
			case 40:
				return "forty";
			case 50:
				return "<span title=\"fiddy\">fifty</span>"; // :^)
			case 60:
				return "sixty";
			case 70:
				return "seventy";
			case 80:
				return "eighty";
			case 90:
				return "ninety";
			default: {
				const str = String(abs);
				return `${getAsText(Number(`${str[0]}0`))}-${getAsText(
					Number(str[1]),
				)}`;
			}
		}
	}

	if (freq) {
		return `${getAsText(number)} ${number > 2 ? "times" : ""}`;
	} else {
		return `${number < 0 ? "negative " : ""}${getAsText(number)}`;
	}
};

Parser._greatestCommonDivisor = function (a, b) {
	if (b < Number.EPSILON) return a;
	return Parser._greatestCommonDivisor(b, Math.floor(a % b));
};
Parser.numberToFractional = function (number) {
	const len = number.toString().length - 2;
	let denominator = 10 ** len;
	let numerator = number * denominator;
	const divisor = Parser._greatestCommonDivisor(numerator, denominator);
	numerator = Math.floor(numerator / divisor);
	denominator = Math.floor(denominator / divisor);

	return denominator === 1
		? String(numerator)
		: `${Math.floor(numerator)}/${Math.floor(denominator)}`;
};

Parser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

Parser._addCommas = function (intNum) {
	return `${intNum}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
};

Parser.numToBonus = function (intNum) {
	return `${intNum >= 0 ? "+" : ""}${intNum}`;
};

Parser.isValidCreatureLvl = function (lvl) {
	lvl = Number(lvl);
	return lvl > -2 && lvl < 26;
};

Parser.actionTypeKeyToFull = function (key) {
	key = key.toLowerCase();
	switch (key) {
		case "untrained":
			return "Skill (Untrained)";
		case "trained":
			return "Skill (Trained)";
		case "expert":
			return "Skill (Expert)";
		case "master":
			return "Skill (Master)";
		case "legendary":
			return "Skill (Legendary)";
		case "variantrule":
			return "Optional/Variant Action";
		default:
			return key.toTitleCase();
	}
};

Parser.SKILL_TO_ATB_ABV = {
	acrobatics: "dex",
	arcana: "int",
	athletics: "str",
	crafting: "int",
	deception: "cha",
	diplomacy: "cha",
	intimidation: "cha",
	lore: "int",
	medicine: "wis",
	nature: "wis",
	occultism: "int",
	performance: "cha",
	religion: "wis",
	society: "int",
	stealth: "dex",
	survival: "wis",
	thievery: "dex",
};

Parser.skillToAbilityAbv = function (skill) {
	return Parser._parse_aToB(Parser.SKILL_TO_ATB_ABV, skill);
};

Parser.SKILL_TO_SHORT = {
	acrobatics: "acro",
	arcana: "arc",
	athletics: "ath",
	crafting: "cra",
	deception: "dec",
	diplomacy: "dip",
	intimidation: "int",
	lore: "lore",
	medicine: "med",
	nature: "nat",
	occultism: "occ",
	performance: "per",
	religion: "rel",
	society: "soc",
	stealth: "ste",
	survival: "sur",
	thievery: "thi",
};

Parser.skillToShort = function (skill) {
	return Parser._parse_aToB(Parser.SKILL_TO_SHORT, skill);
};

Parser.XP_CHART = {
	"-4": 10,
	"-3": 15,
	"-2": 20,
	"-1": 30,
	0: 40,
	1: 60,
	2: 80,
	3: 120,
	4: 160,
};

Parser._getSourceStringFromSource = function (source) {
	if (source && source.source) return source.source;
	return source;
};
Parser._buildSourceCache = function (dict) {
	const out = {};
	Object.entries(dict).forEach(([k, v]) => (out[k.toLowerCase()] = v));
	return out;
};
Parser._sourceFullCache = null;
Parser.hasSourceFull = function (source) {
	Parser._sourceFullCache =
		Parser._sourceFullCache
		|| Parser._buildSourceCache(Parser.SOURCE_JSON_TO_FULL);
	return !!Parser._sourceFullCache[source.toLowerCase()];
};
Parser._sourceAbvCache = null;
Parser.hasSourceAbv = function (source) {
	Parser._sourceAbvCache =
		Parser._sourceAbvCache
		|| Parser._buildSourceCache(Parser.SOURCE_JSON_TO_ABV);
	return !!Parser._sourceAbvCache[source.toLowerCase()];
};
Parser._sourceDateCache = null;
Parser.hasSourceDate = function (source) {
	Parser._sourceDateCache =
		Parser._sourceDateCache
		|| Parser._buildSourceCache(Parser.SOURCE_JSON_TO_DATE);
	return !!Parser._sourceDateCache[source.toLowerCase()];
};
Parser.hasSourceStore = function (source) {
	Parser._sourceStoreCache =
		Parser._sourceStoreCache
		|| Parser._buildSourceCache(Parser.SOURCE_JSON_TO_STORE);
	return !!Parser._sourceStoreCache[source.toLowerCase()];
};
Parser.sourceJsonToFull = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceFull(source)) {
		return Parser._sourceFullCache[source.toLowerCase()].replace(
			/'/g,
			"\u2019",
		);
	}
	if (BrewUtil.hasSourceJson(source)) {
		return BrewUtil.sourceJsonToFull(source).replace(/'/g, "\u2019");
	}
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_FULL, source).replace(
		/'/g,
		"\u2019",
	);
};
Parser.sourceJsonToFullCompactPrefix = function (source) {
	let compact = Parser.sourceJsonToFull(source);
	Object.keys(Parser.SOURCE_PREFIX_TO_SHORT).forEach((prefix) => {
		compact = compact.replace(
			prefix,
			Parser.SOURCE_PREFIX_TO_SHORT[prefix] || prefix,
		);
	});
	Parser.COMPACT_PREFIX_MAP.forEach(
		(it) => (compact = compact.replace(it.re, it.replaceWith)),
	);
	return compact;
};
Parser.sourceJsonToAbv = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceAbv(source)) {
		return Parser._sourceAbvCache[source.toLowerCase()];
	}
	if (BrewUtil.hasSourceJson(source)) return BrewUtil.sourceJsonToAbv(source);
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_ABV, source);
};
Parser.sourceJsonToDate = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceDate(source)) {
		return Parser._sourceDateCache[source.toLowerCase()];
	}
	if (BrewUtil.hasSourceJson(source)) {
		return BrewUtil.sourceJsonToDate(source);
	}
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_DATE, source, null);
};
Parser.sourceJsonToStore = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceStore(source)) {
		return Parser._sourceStoreCache[source.toLowerCase()];
	}
	if (BrewUtil.hasSourceJson(source)) return BrewUtil.sourceJsonToUrl(source);
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_STORE, source, null);
};
Parser.sourceJsonToColor = function (source) {
	return `source${Parser._getSourceStringFromSource(source).replace(
		/[&\\/\\#,+()$~%.'":*?<>{}]/g,
		"_",
	)}`;
};

Parser.stringToSlug = function (str) {
	return str
		.trim()
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
};
Parser.stringToCasedSlug = function (str) {
	return str.replace(/[^\w ]+/g, "").replace(/ +/g, "-");
};

// TODO: Using conversion tables
Parser.priceToValue = function (price) {
	if (price == null) return 0;
	let mult = 0;
	let offset = 0;
	let amount = price.amount || 0;
	switch (price.coin) {
		case "cp":
			mult = 1;
			break;
		case "sp":
			mult = 10;
			break;
		case "gp":
			mult = 100;
			break;
		case "pp":
			mult = 1000;
			break;
	}
	// FIXME: This is rather stupid in retrospect, to modify the price if there is a note.
	// if (price.note != null) offset = 0.1;
	return mult * amount + offset;
};
Parser.priceToFull = function (price, noPlatinum) {
	if (price == null) return "\u2014";
	if (typeof price === "object") {
		if (price.entry) return price.entry;
		if (price.amount == null || price.coin == null) return "\u2014";
		if (price.amount === 0) return "0";
		return `${Parser._addCommas(price.amount)} ${price.coin}${price.note ? ` ${price.note}` : ""
		}`;
	} else if (typeof price === "number" && !isNaN(price)) {
		// assume it's all copper (1/100 gp)
		let coin = "";
		let divide = 1;
		if (noPlatinum) {
			switch (Math.floor(Math.log10(price))) {
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
				case 10:
				case 2:
					coin = "gp";
					divide = 100;
					break;
				case 1:
					coin = "sp";
					divide = 10;
					break;
				case 0:
					coin = "cp";
					divide = 1;
					break;
			}
		} else {
			switch (Math.floor(Math.log10(price))) {
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
				case 10:
				case 3:
					coin = "pp";
					divide = 1000;
					break;
				case 2:
					coin = "gp";
					divide = 100;
					break;
				case 1:
					coin = "sp";
					divide = 10;
					break;
				case 0:
					coin = "cp";
					divide = 1;
					break;
			}
		}
		return `${Parser._addCommas(price / divide)} ${coin}`;
	}
	return "\u2014";
};
Parser.itemValueToFull = function (item, isShortForm) {
	return Parser._moneyToFull(item, "value", "valueMult", isShortForm);
};
Parser.itemValueToFullMultiCurrency = function (item, isShortForm) {
	return Parser._moneyToFullMultiCurrency(
		item,
		"value",
		"valueMult",
		isShortForm,
	);
};
Parser._moneyToFull = function (it, prop, propMult, isShortForm) {
	if (it[prop]) {
		const { coin, mult } = Parser.getCurrencyAndMultiplier(
			it[prop],
			it.currencyConversion,
		);
		return `${(it[prop] * mult).toLocaleString(undefined, {
			maximumFractionDigits: 5,
		})} ${coin}`;
	} else if (it[propMult]) {
		return isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;
	}
	return "";
};
Parser._moneyToFullMultiCurrency = function (it, prop, propMult, isShortForm) {
	if (it[prop]) {
		const simplified = CurrencyUtil.doSimplifyCoins(
			{
				cp: it[prop],
			},
			{
				currencyConversionId: it.currencyConversion,
			},
		);

		const conversionTable = Parser.getCurrencyConversionTable(
			it.currencyConversion,
		);

		return [...conversionTable]
			.reverse()
			.filter((meta) => simplified[meta.coin])
			.map(
				(meta) =>
					`${simplified[meta.coin].toLocaleString(undefined, {
						maximumFractionDigits: 5,
					})} ${meta.coin}`,
			)
			.join(", ");
	} else if (it[propMult]) {
		return isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;
	}
	return "";
};
Parser.DEFAULT_CURRENCY_CONVERSION_TABLE = [
	{
		coin: "cp",
		mult: 1,
	},
	{
		coin: "sp",
		mult: 0.1,
	},
	{
		coin: "gp",
		mult: 0.01,
		isFallback: true,
	},
];
Parser.FULL_CURRENCY_CONVERSION_TABLE = [
	{
		coin: "cp",
		mult: 1,
	},
	{
		coin: "sp",
		mult: 0.1,
	},
	{
		coin: "gp",
		mult: 0.01,
		isFallback: true,
	},
	{
		coin: "pp",
		mult: 0.001,
	},
];
Parser.getCurrencyConversionTable = function (currencyConversionId) {
	const fromBrew = currencyConversionId
		? MiscUtil.get(
			BrewUtil.homebrewMeta,
			"currencyConversions",
			currencyConversionId,
		)
		: null;
	const conversionTable =
		fromBrew && fromBrew.length
			? fromBrew
			: Parser.DEFAULT_CURRENCY_CONVERSION_TABLE;
	if (conversionTable !== Parser.DEFAULT_CURRENCY_CONVERSION_TABLE) {
		conversionTable.sort((a, b) => SortUtil.ascSort(b.mult, a.mult));
	}
	return conversionTable;
};
Parser.getCurrencyAndMultiplier = function (value, currencyConversionId) {
	const conversionTable =
		Parser.getCurrencyConversionTable(currencyConversionId);

	if (!value) {
		return (
			conversionTable.find((it) => it.isFallback) || conversionTable[0]
		);
	}
	if (conversionTable.length === 1) return conversionTable[0];
	if (!Number.isInteger(value) && value < conversionTable[0].mult) {
		return conversionTable[0];
	}

	for (let i = conversionTable.length - 1; i >= 0; --i) {
		if (Number.isInteger(value * conversionTable[i].mult)) {
			return conversionTable[i];
		}
	}

	return conversionTable.last();
};
Parser.COIN_ABVS = ["cp", "sp", "gp", "pp"];
Parser.COIN_ABV_TO_FULL = {
	cp: "copper pieces",
	sp: "silver pieces",
	gp: "gold pieces",
	pp: "platinum pieces",
};
Parser.COIN_CONVERSIONS = [1, 10, 100, 1000];
Parser.coinAbvToFull = function (coin) {
	return Parser._parse_aToB(Parser.COIN_ABV_TO_FULL, coin);
};

Parser._decimalSeparator = (0.1).toLocaleString().substring(1, 2);
Parser._numberCleanRegexp =
	Parser._decimalSeparator === "."
		? new RegExp(/[\s,]*/g, "g")
		: new RegExp(/[\s.]*/g, "g");
Parser._costSplitRegexp =
	Parser._decimalSeparator === "."
		? new RegExp(/(\d+(\.\d+)?)([csegp]p)/)
		: new RegExp(/(\d+(,\d+)?)([csegp]p)/);
/** input e.g. "25 gp", "1,000pp" */
Parser.coinValueToNumber = function (value) {
	if (!value) return 0;
	// handle oddities
	if (value === "Varies") return 0;

	value = value
		.replace(/\s*/, "")
		.replace(Parser._numberCleanRegexp, "")
		.toLowerCase();
	const m = Parser._costSplitRegexp.exec(value);
	if (!m) throw new Error(`Badly formatted value "${value}"`);
	const ixCoin = Parser.COIN_ABVS.indexOf(m[3]);
	if (!~ixCoin) throw new Error(`Unknown coin type "${m[3]}"`);
	return Number(m[1]) * Parser.COIN_CONVERSIONS[ixCoin];
};

Parser.PROFICIENCIES = [
	"Untrained",
	"Trained",
	"Expert",
	"Master",
	"Legendary",
];
Parser.proficiencyAbvToFull = function (abv) {
	switch (abv) {
		case "t":
			return "trained";
		case "T":
			return "Trained";
		case "e":
			return "expert";
		case "E":
			return "Expert";
		case "m":
			return "master";
		case "M":
			return "Master";
		case "l":
			return "legendary";
		case "L":
			return "Legendary";
		case "u":
			return "untrained";
		case "U":
			return "Untrained";
		default:
			throw new Error(`Unknown proficiency rank ${abv}.`);
	}
};
Parser.proficiencyToNumber = function (prof) {
	switch (prof[0].toLowerCase()) {
		case "u":
			return 0;
		case "t":
			return 1;
		case "e":
			return 2;
		case "m":
			return 3;
		case "l":
			return 4;
		default:
			return 69;
	}
};
Parser.genderToFull = function (g) {
	switch (g.toLowerCase()) {
		case "m":
			return "male";
		case "f":
			return "female";
		case "a":
			return "agender";
		case "gf":
			return "genderfluid";
		case "nb":
			return "nonbinary";
		case "p":
			return "pangender";
		default:
			return g;
	}
};
Parser.savingThrowAbvToFull = function (abv) {
	switch (abv.toLowerCase()) {
		case "f":
		case "fort":
			return "Fortitude";
		case "r":
		case "ref":
			return "Reflex";
		case "w":
		case "will":
			return "Will";
		case "ac":
			return "AC";
		default:
			throw new Error(`Unknown saving throw abv ${abv}.`);
	}
};

Parser.speedToFullMap = function (speed) {
	return Object.keys(speed).map((k) => {
		if (k === "walk") return `${speed.walk} metros`;
		else return `${k.uppercaseFirst()} ${speed[k]} metros`;
	});
};

Parser.getClassSideBar = function (sidebarEntries) {
	sidebarEntries = MiscUtil.copy(sidebarEntries);
	const first = sidebarEntries.splice(0, 1)[0];
	return {
		type: "pf2-sidebar",
		name: first.name,
		entries: first.entries.concat(
			sidebarEntries
				.map((it) => [
					{ type: "pf2-title", name: it.name },
					...it.entries,
				])
				.flat(),
		),
	};
};
Parser.getClassSideBarEntries = function (cls) {
	let initProf = cls.initialProficiencies;
	const out = [];
	let sideBar = {
		type: "pf2-sidebar",
		name: `${cls.rarity ? "RARITY" : "INITIAL PROFICIENCIES"}`,
		entries: [],
	};
	if (cls.rarity) {
		out.push({ name: "RARITY", entries: [`{@trait ${cls.rarity}}`] });
	}
	const initProfText =
		"No 1º nível, você recebe as graduações de proficiência indicadas nas estatísticas a seguir. Você é destreinado em tudo que não estiver listado, a menos que obtenha uma graduação melhor de outra forma.";
	out.push({ name: "INITIAL PROFICIENCIES", entries: [initProfText] });
	out.push({
		name: "PERCEPTION",
		entries: [
			`${Parser.uiToFull(Parser.proficiencyAbvToFull(initProf.perception))} em Percepção`,
		],
	});
	out.push({
		name: "SAVING THROWS",
		entries: [
			`${Parser.uiToFull(Parser.proficiencyAbvToFull(initProf.fort))} em Fortitude`,
			`${Parser.uiToFull(Parser.proficiencyAbvToFull(initProf.ref))} em Reflexos`,
			`${Parser.uiToFull(Parser.proficiencyAbvToFull(initProf.will))} em Vontade`,
		],
	});

	function initProfParser (thing, entry) {
		Object.keys(thing).forEach((k) => {
			let thingArray = [];
			let prof = "";
			switch (k) {
				case "u": {
					thingArray = thing.u;
					prof = "Untrained";
					break;
				}
				case "t": {
					thingArray = thing.t;
					prof = "Trained";
					break;
				}
				case "e": {
					thingArray = thing.e;
					prof = "Expert";
					break;
				}
				case "m": {
					thingArray = thing.m;
					prof = "Master";
					break;
				}
				case "l": {
					thingArray = thing.l;
					prof = "Legendary";
					break;
				}
				case "add":
					return entry.push(
						`{@indentSubsequent Treinado em uma quantidade de perícias adicionais igual a ${thing.add} mais seu modificador de Inteligência}`,
					);
				default:
			}
			thingArray.forEach((element) => {
				if (typeof element === "object") {
					if (element.entry) {
						return entry.push(
							`{@indentSubsequent ${Parser.uiToFull(prof)} em ${element.entry}}`,
						);
					} else if (element.type === "and") {
						return entry.push(
							`{@indentSubsequent ${Parser.uiToFull(prof)} em ${element.skill
								.map((s) => `{@skill ${s}}`)
								.joinConjunct(", ", " e ")}}`,
						);
					} else {
						return entry.push(
							`{@indentSubsequent ${Parser.uiToFull(prof)} em ${element.skill.length === 1
								? ""
								: `à sua escolha entre`
							} ${element.skill
								.map((s) => `{@skill ${s}}`)
								.joinConjunct(", ", " ou ")}}`,
						);
					}
				} else {
					return entry.push(
						`{@indentSubsequent ${Parser.uiToFull(prof)} em ${element}}`,
					);
				}
			});
		});
	}

	const skillsEntries = [];
	const attacksEntries = [];
	const defensesEntries = [];
	initProfParser(initProf.skills, skillsEntries);
	out.push({ name: "SKILLS", entries: skillsEntries });
	initProfParser(initProf.attacks, attacksEntries);
	out.push({ name: "ATTACKS", entries: attacksEntries });
	initProfParser(initProf.defenses, defensesEntries);
	out.push({ name: "DEFENSES", entries: defensesEntries });

	if (initProf.classDc) {
		out.push({ name: "CLASS DC", entries: [initProf.classDc.entry] });
	}
	if (initProf.spells) {
		const spellsEntries = [];
		initProfParser(initProf.spells, spellsEntries);
		out.push({ name: "SPELLS", entries: spellsEntries });
	}
	return out.map(entry => ({...entry, name: Parser.uiToFull(entry.name)}));
};

Parser.spSchoolToStyle = function (school) {
	const rawColor = MiscUtil.get(
		Renderer.trait.TRAITS,
		school.toLowerCase(),
		"_data",
		"school",
		"color",
	);
	if (!rawColor || !rawColor.trim()) return "";
	const validColor = BrewUtil.getValidColor(rawColor);
	if (validColor.length) return `style="color: #${validColor}"`;
	return "";
};
Parser.spSchoolToAbv = function (school) {
	const schoolAbv = MiscUtil.get(
		Renderer.trait.TRAITS,
		school.toLowerCase(),
		"_data",
		"school",
		"short",
	);
	if (!schoolAbv || !schoolAbv.trim()) return school;
	return schoolAbv;
};

TR_AC = "Arcane";
TR_DV = "Divine";
TR_OC = "Occult";
TR_PR = "Primal";
Parser.TRADITIONS = [TR_AC, TR_DV, TR_OC, TR_PR];

Parser.getOrdinalForm = function (i) {
	i = Number(i);
	if (isNaN(i)) return "";
	const j = i % 10;
	const k = i % 100;
	if (j === 1 && k !== 11) return `${i}st`;
	if (j === 2 && k !== 12) return `${i}nd`;
	if (j === 3 && k !== 13) return `${i}rd`;
	return `${i}th`;
};

Parser.spLevelToFull = function (level) {
	return Parser.getOrdinalForm(level);
};

Parser.getArticle = function (str) {
	str = `${str}`;
	str = str.replace(/\d+/g, (...m) => Parser.numberToText(m[0]));
	return /^[aeiou]/.test(str) ? "an" : "a";
};

Parser.spLevelToFullLevelText = function (level, dash) {
	return `${Parser.spLevelToFull(level)}${
		level === 0 ? "s" : `${dash ? "-" : " "}level`
	}`;
};

Parser.COMPONENTS_TO_FULL = {};
Parser.COMPONENTS_TO_FULL["V"] = "verbal";
Parser.COMPONENTS_TO_FULL["M"] = "material";
Parser.COMPONENTS_TO_FULL["S"] = "somatic";
Parser.COMPONENTS_TO_FULL["F"] = "focus";

Parser.alignToFull = function (align) {
	switch (String(align).toLowerCase()) {
		case null:
			return "";
		case "any":
			return "Any";
		case "lg":
		case "lawful good":
			return "Lawful Good";
		case "ng":
		case "neutral good":
			return "Neutral Good";
		case "cg":
		case "chaotic good":
			return "Chaotic Good";
		case "ln":
		case "lawful neutral":
			return "Lawful Neutral";
		case "n":
		case "neutral":
			return "Neutral";
		case "cn":
		case "chaotic neutral":
			return "Chaotic Neutral";
		case "le":
		case "lawful evil":
			return "Lawful Evil";
		case "ne":
		case "neutral evil":
			return "Neutral Evil";
		case "ce":
		case "chaotic evil":
			return "Chaotic Evil";
		case "all":
			return "All";
		case "l":
		case "lawful":
			return "Lawful";
		case "c":
		case "chaotic":
			return "Chaotic";
		case "g":
		case "good":
			return "Good";
		case "e":
		case "evil":
			return "Evil";
		default:
			return "\u2014";
	}
};

Parser.CAT_ID_QUICKREF = 10;
Parser.CAT_ID_VARIANT_RULE = 11;
Parser.CAT_ID_SUBSYSTEM = 12;
Parser.CAT_ID_TABLE = 13;
Parser.CAT_ID_TABLE_GROUP = 14;
Parser.CAT_ID_BOOK = 15;

Parser.CAT_ID_ANCESTRY = 20;
Parser.CAT_ID_HERITAGE = 21;
Parser.CAT_ID_VE_HERITAGE = 22;
Parser.CAT_ID_BACKGROUND = 7;
Parser.CAT_ID_CLASS = 23;
Parser.CAT_ID_CLASS_FEATURE = 5;
Parser.CAT_ID_SUBCLASS = 24;
Parser.CAT_ID_SUBCLASS_FEATURE = 6;
Parser.CAT_ID_ARCHETYPE = 25;
Parser.CAT_ID_FEAT = 0;
Parser.CAT_ID_COMPANION = 26;
Parser.CAT_ID_FAMILIAR = 27;
Parser.CAT_ID_EIDOLON = 28;
Parser.CAT_ID_OPTIONAL_FEATURE = 30;
Parser.CAT_ID_OPTIONAL_FEATURE_LESSON = 31;

Parser.CAT_ID_ADVENTURE = 50;
Parser.CAT_ID_HAZARD = 51;

Parser.CAT_ID_ACTION = 8;
Parser.CAT_ID_CREATURE = 1;
Parser.CAT_ID_CONDITION = 60;
Parser.CAT_ID_ITEM = 2;
Parser.CAT_ID_SPELL = 3;
Parser.CAT_ID_AFFLICTION = 61;
Parser.CAT_ID_CURSE = 62;
Parser.CAT_ID_DISEASE = 63;
Parser.CAT_ID_ABILITY = 64;
Parser.CAT_ID_DEITY = 9;
Parser.CAT_ID_LANGUAGE = 65;
Parser.CAT_ID_PLACE = 66;
Parser.CAT_ID_PLANE = 67;
Parser.CAT_ID_NATION = 68;
Parser.CAT_ID_SETTLEMENT = 69;
Parser.CAT_ID_RITUAL = 70;
Parser.CAT_ID_VEHICLE = 71;
Parser.CAT_ID_RELICGIFT = 73;
Parser.CAT_ID_TRAIT = 4;
Parser.CAT_ID_ORGANIZATION = 72;
Parser.CAT_ID_EVENT = 74;
Parser.CAT_ID_FAMILIARABILITY = 75;

Parser.CAT_ID_PAGE = 99;

// FIXME:
Parser.CAT_ID_TO_FULL = {};
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_QUICKREF] = "Quick Reference";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VARIANT_RULE] = "Variant Rule";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBSYSTEM] = "Subsystem";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE_GROUP] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOOK] = "Book";

Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ANCESTRY] = "Ancestry";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HERITAGE] = "Heritage";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VE_HERITAGE] = "Versatile Heritage";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BACKGROUND] = "Background";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS] = "Class";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS_FEATURE] = "Class Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS] = "Subclass";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS_FEATURE] = "Subclass Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARCHETYPE] = "Archetype";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FEAT] = "Feat";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_COMPANION] = "Companion";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FAMILIAR] = "Familiar";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FAMILIARABILITY] = "Familiar Ability";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_EIDOLON] = "Eidolon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE] = "Optional Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE_LESSON] = "Lesson";

Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ADVENTURE] = "Campaign";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HAZARD] = "Hazard";

Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ACTION] = "Action";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CREATURE] = "Bestiary";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CONDITION] = "Condition";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM] = "Item";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SPELL] = "Spell";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_AFFLICTION] = "Affliction";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CURSE] = "Curse";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DISEASE] = "Disease";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ABILITY] = "Creature Ability";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DEITY] = "Deity";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LANGUAGE] = "Language";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PLACE] = "Place";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PLANE] = "Plane";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ORGANIZATION] = "Organization";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_EVENT] = "Event";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_NATION] = "Nation";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SETTLEMENT] = "Settlement";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RITUAL] = "Ritual";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VEHICLE] = "Vehicle";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RELICGIFT] = "Relic Gift";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TRAIT] = "Trait";

Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PAGE] = "Page";

Parser.pageCategoryToFull = function (catId) {
	return Parser._parse_aToB(Parser.CAT_ID_TO_FULL, catId);
};

Parser.CAT_ID_TO_PROP = {};
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_QUICKREF] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VARIANT_RULE] = "variantrule";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBSYSTEM] = "variantrule";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE] = "table";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE_GROUP] = "tableGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOOK] = "book";

Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ANCESTRY] = "ancestry";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HERITAGE] = "heritage";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VE_HERITAGE] = "versatileHeritage";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BACKGROUND] = "background";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS] = "class";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS_FEATURE] = "classFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS] = "subclass";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARCHETYPE] = "archetype";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FEAT] = "feat";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_COMPANION] = "companion";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FAMILIAR] = "familiar";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FAMILIARABILITY] = "familiarAbility";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_EIDOLON] = "eidolon";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE_LESSON] =
	"optionalfeature";

Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ADVENTURE] = "adventure";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HAZARD] = "hazard";

Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ACTION] = "action";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CREATURE] = "creature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CONDITION] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM] = "item";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SPELL] = "spell";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_AFFLICTION] = "affliction";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CURSE] = "curse";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DISEASE] = "disease";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ABILITY] = "ability";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DEITY] = "deity";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LANGUAGE] = "language";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PLACE] = "place";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PLANE] = "place";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ORGANIZATION] = "organization";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_EVENT] = "event";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_NATION] = "place";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SETTLEMENT] = "place";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RITUAL] = "ritual";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VEHICLE] = "vehicle";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RELICGIFT] = "relicGift";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TRAIT] = "trait";

Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PAGE] = null;

Parser.CAT_ID_TO_PROP[Parser.CAT_ID_GENERIC_DATA] = "generic";

Parser.pageCategoryToProp = function (catId) {
	return Parser._parse_aToB(Parser.CAT_ID_TO_PROP, catId);
};

Parser.ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];

Parser.bookOrdinalToAbv = (ordinal, preNoSuff) => {
	if (ordinal === undefined) return "";
	switch (ordinal.type) {
		case "part":
			return `${preNoSuff ? " " : ""}Part ${ordinal.identifier}${
				preNoSuff ? "" : " \u2014 "
			}`;
		case "chapter":
			return `${preNoSuff ? " " : ""}Ch. ${ordinal.identifier}${
				preNoSuff ? "" : ": "
			}`;
		case "session":
			return `${preNoSuff ? " " : ""}Session ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
		case "episode":
			return `${preNoSuff ? " " : ""}Ep. ${ordinal.identifier}${
				preNoSuff ? "" : ": "
			}`;
		case "appendix":
			return `${preNoSuff ? " " : ""}App. ${ordinal.identifier}${
				preNoSuff ? "" : ": "
			}`;
		case "level":
			return `${preNoSuff ? " " : ""}Nível ${ordinal.identifier}${
				preNoSuff ? "" : ": "
			}`;
		default:
			throw new Error(`Unhandled ordinal type "${ordinal.type}"`);
	}
};

Parser.nameToTokenName = function (name) {
	return name
		.normalize("NFD") // replace diactrics with their individual graphemes
		.replace(/[\u0300-\u036f]/g, "") // remove accent graphemes
		.replace(/Æ/g, "AE")
		.replace(/æ/g, "ae")
		.replace(/"/g, "");
};

Parser.TM_A = "action";
Parser.TM_AA = "two";
Parser.TM_AAA = "three";
Parser.TM_R = "reaction";
Parser.TM_F = "free";
Parser.TM_ROUND = "round";
Parser.TM_MINS = "minute";
Parser.TM_HRS = "hour";
Parser.TM_DAYS = "day";
Parser.TM_VARIES = "varies";
Parser.TIME_ACTIONS = [Parser.TM_A, Parser.TM_R, Parser.TM_F];

Parser.TM_TO_ACTIVITY = {};
Parser.TM_TO_ACTIVITY[Parser.TM_F] = "Free Action";
Parser.TM_TO_ACTIVITY[Parser.TM_R] = "Reaction";
Parser.TM_TO_ACTIVITY[Parser.TM_A] = "Action";
Parser.TM_TO_ACTIVITY[Parser.TM_AA] = "Two-Action";
Parser.TM_TO_ACTIVITY[Parser.TM_AAA] = "Three-Action";
Parser.TM_TO_ACTIVITY[Parser.TM_ROUND] = "Rounds";
Parser.TM_TO_ACTIVITY[Parser.TM_VARIES] = "Varies";
Parser.TM_TO_ACTIVITY[Parser.TM_MINS] = "Minutes";
Parser.TM_TO_ACTIVITY[Parser.TM_HRS] = "Hours";
Parser.TM_TO_ACTIVITY[Parser.TM_DAYS] = "Days";

Parser.ACTIVITY_TYPE_TO_IDX = Object.keys(Parser.TM_TO_ACTIVITY)
	.map((a, ix) => ({ [a]: ix }))
	.reduce((a, b) => Object.assign(a, b), {});
Parser.activityTypeToNumber = function (activity) {
	return Parser._parse_aToB(Parser.ACTIVITY_TYPE_TO_IDX, activity, 900000000);
};

Parser.timeToActivityType = function (time) {
	if (time == null) return null;
	if (time.unit == null) return null;
	switch (time.unit) {
		case Parser.TM_VARIES:
		case Parser.TM_DAYS:
		case Parser.TM_HRS:
		case Parser.TM_MINS:
		case Parser.TM_ROUND:
		case Parser.TM_R:
		case Parser.TM_F:
			return Parser.TM_TO_ACTIVITY[time.unit];
		case Parser.TM_A: {
			if (time.number === 1) return Parser.TM_TO_ACTIVITY[Parser.TM_A];
			if (time.number === 2) return Parser.TM_TO_ACTIVITY[Parser.TM_AA];
			if (time.number === 3) return Parser.TM_TO_ACTIVITY[Parser.TM_AAA];
		}
	}
};

Parser.getNormalisedTime = function (time) {
	if (time == null) return 0;
	if (time === "Exploration") return 900000000;
	if (time === "Downtime") return 900000001;
	let multiplier = 1;
	let offset = 0;
	switch (time.unit) {
		case Parser.TM_F:
			offset = 1;
			break;
		case Parser.TM_R:
			offset = 2;
			break;
		case Parser.TM_A:
			multiplier = 10;
			break;
		case Parser.TM_AA:
			multiplier = 20;
			break;
		case Parser.TM_AAA:
			multiplier = 30;
			break;
		case Parser.TM_ROUND:
			multiplier = 60;
			break;
		case Parser.TM_MINS:
			multiplier = 600;
			break;
		case Parser.TM_HRS:
			multiplier = 36000;
			break;
		case Parser.TM_DAYS:
			multiplier = 864000;
			break;
		case Parser.TM_VARIES:
			multiplier = 100;
			break;
	}
	return multiplier * time.number + offset;
};

Parser.timeToFullEntry = function (time) {
	if (time.entry != null) return time.entry;
	if (Parser.TIME_ACTIONS.includes(time.unit)) {
		if (time.number === 1 && time.unit === Parser.TM_F) return "{@as f}";
		if (time.number === 1 && time.unit === Parser.TM_R) return "{@as r}";
		if (time.number === 2 && time.unit === Parser.TM_A) return "{@as 2}";
		if (time.number === 3 && time.unit === Parser.TM_A) return "{@as 3}";
		return "{@as 1}";
	}
	return `${time.number} ${time.unit}${time.number >= 2 ? "s" : ""}`;
};

Parser.freqToFullEntry = function (freq) {
	if (freq.special != null) return freq.special;
	return `${Parser.numberToText(freq.number, true)} ${
		freq.recurs ? "every" : "per"
	} ${freq.interval || ""} ${
		freq.interval >= 2
			? `${freq.unit}s`
			: freq.customUnit
				? freq.customUnit
				: freq.unit
	}${freq.overcharge ? ", plus overcharge" : ""}`;
};

Parser.timeToTableStr = function (time) {
	if (time.unit === "varies") return "Varies";
	if (Parser.TIME_ACTIONS.includes(time.unit)) {
		if (time.number === 1 && time.unit === Parser.TM_F) {
			return "Free Action";
		}
		if (time.number === 1 && time.unit === Parser.TM_R) return "Reaction";
		if (time.number === 2 && time.unit === Parser.TM_A) return "Two-Action";
		if (time.number === 3 && time.unit === Parser.TM_A) {
			return "Three-Action";
		}
		return "Action";
	}
	return `${time.number} ${time.unit.uppercaseFirst()}${
		time.number >= 2 ? "s" : ""
	}`;
};

Parser.durationToFull = function (duration) {
	if (duration == null) return null;
	if (duration.entry) return duration.entry;
	if (
		duration.sustained
		&& (duration.unit == null || duration.unit === "unlimited")
	) {
		return "sustained";
	}
	const rendered = `${duration.number == null ? "" : `${duration.number} `}${
		duration.number > 1 ? `${duration.unit}s` : duration.unit
	}`;
	if (duration.sustained) return `sustained up to ${rendered}`;
	else return rendered;
};

UNT_FEET = "feet";
UNT_MILES = "mile";
Parser.INCHES_PER_FOOT = 12;
Parser.FEET_PER_MILE = 5280;

RNG_SELF = "self";
RNG_UNLIMITED = "unlimited";
RNG_UNLIMITED_SAME_PLANE = "planetary";
RNG_UNLIMITED_OTHER_PLANE = "interplanar";
RNG_TOUCH = "touch";

Parser.rangeToFull = function (range) {
	if (range == null) return "";
	if (range.entry) return range.entry;
	if (range.unit === UNT_FEET) {
		return `${range.number} ${range.number === 1 ? "foot" : "feet"}`;
	}
	if (range.unit === UNT_MILES) {
		return `${range.number} ${range.number === 1 ? "mile" : "miles"}`;
	}
	return range.unit;
};

// TODO: Handle range/area types: emanation, cone etc?
Parser.getNormalisedRange = function (range) {
	if (!MiscUtil.isObject(range)) return 0;
	let multiplier = 1;
	let distance = 0;
	let offset = 0;

	switch (range.unit) {
		case null:
			distance = 0;
			break;
		case UNT_FEET:
			multiplier = Parser.INCHES_PER_FOOT;
			distance = range.number;
			break;
		case UNT_MILES:
			multiplier = Parser.INCHES_PER_FOOT * Parser.FEET_PER_MILE;
			distance = range.number;
			break;
		case RNG_TOUCH:
			distance = 1;
			break;
		case RNG_UNLIMITED_SAME_PLANE:
			distance = 900000000;
			break;
		case RNG_UNLIMITED_OTHER_PLANE:
			distance = 900000001;
			break;
		case RNG_UNLIMITED:
			distance = 900000002;
			break;
		case "unknown":
			distance = 900000003;
			break;
		default: {
			// it's homebrew?
			const fromBrew = MiscUtil.get(
				BrewUtil.homebrewMeta,
				"spellDistanceUnits",
				range.unit,
			);
			if (fromBrew) {
				const ftPerUnit = fromBrew.feetPerUnit;
				if (ftPerUnit != null) {
					multiplier = Parser.INCHES_PER_FOOT * ftPerUnit;
					distance = range.number;
				} else {
					distance = 910000000; // default to max distance, to have them displayed at the bottom
				}
			}
			break;
		}
	}
	// value in inches, to allow greater granularity
	return multiplier * distance + offset;
};

Parser.getFilterRange = function (object) {
	const fRan = object.range || { type: null };
	if (fRan.unit !== null) {
		let norm_range = Parser.getNormalisedRange(fRan);
		if (norm_range === 1) {
			return "Touch";
		} else if (norm_range < Parser.INCHES_PER_FOOT * 10) {
			return "5 feet";
		} else if (norm_range < Parser.INCHES_PER_FOOT * 25) {
			return "10 feet";
		} else if (norm_range < Parser.INCHES_PER_FOOT * 50) {
			return "25 feet";
		} else if (norm_range < Parser.INCHES_PER_FOOT * 100) {
			return "50 feet";
		} else if (norm_range < Parser.INCHES_PER_FOOT * 500) {
			return "100 feet";
		} else if (norm_range < Parser.INCHES_PER_FOOT * Parser.FEET_PER_MILE) {
			return "500 feet";
		} else if (norm_range < 900000000) {
			return "1 mile";
		} else if (norm_range < 900000001) {
			return "Planetary";
		} else if (norm_range < 900000002) {
			return "Unlimited";
		} else {
			return "Varies";
		}
	} else {
		return null;
	}
};

Parser.getFilterDuration = function (object) {
	const duration = object.duration || {};
	switch (duration.unit) {
		case null:
		case undefined:
			return "Instant";
		case "turn":
		case "round":
			return "1 Round";
		case "minute": {
			const amt = duration.number || 0;
			if (amt <= 1) return "1 Minute";
			if (amt <= 10) return "10 Minutes";
			if (amt <= 60) return "1 Hour";
			if (amt <= 8 * 60) return "8 Hours";
			return "24+ Hours";
		}
		case "hour": {
			const amt = duration.number || 0;
			if (amt <= 1) return "1 Hour";
			if (amt <= 8) return "8 Hours";
			return "24+ Hours";
		}
		case "week":
		case "day":
		case "year":
			return "24+ Hours";
		case "unlimited":
			return "Unlimited";
		default:
			return "Special";
	}
};

Parser.ATB_ABV_TO_FULL = {
	str: "Strength",
	dex: "Dexterity",
	con: "Constitution",
	int: "Intelligence",
	wis: "Wisdom",
	cha: "Charisma",
};

Parser.ATB_TO_NUM = {
	Strength: 1,
	Dexterity: 2,
	Constitution: 3,
	Intelligence: 4,
	Wisdom: 5,
	Charisma: 6,
	Free: 7,
};

Parser.attAbvToFull = function (abv) {
	return Parser._parse_aToB(Parser.ATB_ABV_TO_FULL, abv);
};

// TODO: Rework for better clarity?
Parser.CONDITION_TO_COLOR = {
	Blinded: "#525252",
	Clumsy: "#5c57af",
	Concealed: "#525252",
	Confused: "#c9c91e",
	Controlled: "#ed07bb",
	Dazzled: "#db8f48",
	Deafened: "#666464",
	Doomed: "#9e1414",
	Drained: "#72aa01",
	Dying: "#ff0000",
	Enfeebled: "#42a346",
	Fascinated: "#fc7b02",
	Fatigued: "#7913c6",
	"Flat-Footed": "#7f7f7f",
	Fleeing: "#c9ca18",
	Frightened: "#c9ca18",
	Grabbed: "#00e0ac",
	Immobilized: "#009f7a",
	Invisible: "#71738c",
	Paralyzed: "#015642",
	"Persistent Damage": "#ed6904",
	Petrified: "#2fd62f",
	Prone: "#00e070",
	Quickened: "#00d5e0",
	Restrained: "#007c5f",
	Sickened: "#008202",
	Slowed: "#2922a5",
	Stunned: "#4b43db",
	Stupefied: "#c94873",
	Unconscious: "#a0111b",
	Wounded: "#e81919",
};

SRC_3PP_SUFFIX = " 3pp";

AP_PREFIX = "Adventure Path: ";
AP_PREFIX_SHORT = "AP: ";

AoA_PREFIX = "Age of Ashes: ";
AoA_PREFIX_SHORT = "AoA: ";
AoE_PREFIX = "Agents of Edgewatch: ";
AoE_PREFIX_SHORT = "AoE: ";
AV_PREFIX = "Abomination Vaults: ";
AV_PREFIX_SHORT = "AV: ";
BL_PREFIX = "Blood Lords: ";
BL_PREFIX_SHORT = "BL: ";
CC_PREFIX = "Curtain Call: ";
CC_PREFIX_SHORT = "CC: ";
EC_PREFIX = "Extinction Curse: ";
EC_PREFIX_SHORT = "EC: ";
FRP_PREFIX = "Fists of the Ruby Phoenix: ";
FRP_PREFIX_SHORT = "FRP: ";
GW_PREFIX = "Gatewalkers: ";
GW_PREFIX_SHORT = "Gw: ";
LO_PREFIX = "Lost Omens: ";
LO_PREFIX_SHORT = "LO: ";
OoA_PREFIX = "Outlaws of Alkenstar: ";
OoA_PREFIX_SHORT = "OoA: ";
SevenDfS_PREFIX = "Seven Dooms for Sandpoint: ";
SevenDfS_PREFIX_SHORT = "7DfS: ";
SF_PREFIX = "Stolen Fate: ";
SF_PREFIX_SHORT = "SF: ";
SKT_PREFIX = "Sky King's Tomb: ";
SKT_PREFIX_SHORT = "SKT: ";
SoG_PREFIX = "Season of Ghosts: ";
SoG_PREFIX_SHORT = "SoG: ";
SoT_PREFIX = "Strength of Thousands: ";
SoT_PREFIX_SHORT = "SoT: ";
WoW_PREFIX = "Wardens of Wildwood: ";
WoW_PREFIX_SHORT = "WoW: ";
MS_PREFIX = "Myth-Speaker: ";
MS_PREFIX_SHORT = "MS: ";
RotR_PREFIX = "Revenge of the Runelords: ";
RotR_PREFIX_SHORT = "RotR: ";

Parser.COMPACT_PREFIX_MAP = [
	{ re: /Abomination Vaults #(\d): /, replaceWith: "AV$1: " },
	{ re: /Age of Ashes #(\d): /, replaceWith: "AoA$1: " },
	{ re: /Agents of Edgewatch #(\d): /, replaceWith: "AoE$1: " },
	{ re: /Blood Lords #(\d): /, replaceWith: "BL$1: " },
	{ re: /Curtain Call #(\d): /, replaceWith: "CC$1: " },
	{ re: /Extinction Curse #(\d): /, replaceWith: "EC$1: " },
	{ re: /Fists of the Ruby Phoenix #(\d): /, replaceWith: "FRP$1: " },
	{ re: /Gatewalkers #(\d): /, replaceWith: "Gw$1: " },
	{ re: /Myth-Speaker #(\d): /, replaceWith: "MS$1: " },
	{ re: /Outlaws of Alkenstar #(\d): /, replaceWith: "OoA$1: " },
	{ re: /Quest for the Frozen Flame #(\d): /, replaceWith: "QFF$1: " },
	{ re: /Revenge of the Runeords #(\d): /, replaceWith: "RotR$1: " },
	{ re: /Season of Ghosts #(\d): /, replaceWith: "SoG$1: " },
	{ re: /Seven Dooms for Sandpoint #(\d): /, replaceWith: "7DfS$1: " },
	{ re: /Shades of Blood #(\d): /, replaceWith: "SoB$1: " },
	{ re: /Sky King's Tomb #(\d): /, replaceWith: "SKT$1: " },
	{ re: /Spore War #(\d): /, replaceWith: "SoB$1: " },
	{ re: /Stolen Fate #(\d): /, replaceWith: "SF$1: " },
	{ re: /Strength of Thousands #(\d): /, replaceWith: "SoT$1: " },
	{ re: /Triumph of the Tusk #(\d): /, replaceWith: "SoT$1: " },
	{ re: /Wardens of Wildwood #(\d): /, replaceWith: "WoW$1: " },
];

Parser.SOURCE_PREFIX_TO_SHORT = {};
Parser.SOURCE_PREFIX_TO_SHORT[LO_PREFIX] = LO_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[AP_PREFIX] = AP_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[FRP_PREFIX] = FRP_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[AV_PREFIX] = AV_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[AoE_PREFIX] = AoE_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[EC_PREFIX] = EC_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[AoA_PREFIX] = AoA_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[SoT_PREFIX] = SoT_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[OoA_PREFIX] = OoA_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[BL_PREFIX] = BL_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[GW_PREFIX] = GW_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[SoG_PREFIX] = SoG_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[SKT_PREFIX] = SKT_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[SevenDfS_PREFIX] = SevenDfS_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[SF_PREFIX] = SF_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[WoW_PREFIX] = WoW_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[CC_PREFIX] = CC_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[MS_PREFIX] = MS_PREFIX_SHORT;
Parser.SOURCE_PREFIX_TO_SHORT[RotR_PREFIX] = RotR_PREFIX_SHORT;

Parser.SOURCE_JSON_TO_FULL = {};
Parser.SOURCE_JSON_TO_ABV = {};
Parser.SOURCE_JSON_TO_DATE = {};
Parser.SOURCE_JSON_TO_STORE = {};
Parser.SOURCES_AVAILABLE_DOCS_BOOK = {};
Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE = {};

// #region Listing of all the sources
SRC_7DfS0 = "7DfS0";
SRC_AAWS = "AAWS";
SRC_AFFM = "AFFM";
SRC_AFoF = "AFoF";
SRC_AoA0 = "AoA0";
SRC_AoA1 = "AoA1";
SRC_AoA2 = "AoA2";
SRC_AoA3 = "AoA3";
SRC_AoA4 = "AoA4";
SRC_AoA5 = "AoA5";
SRC_AoA6 = "AoA6";
SRC_AoE0 = "AoE0";
SRC_AoE1 = "AoE1";
SRC_AoE2 = "AoE2";
SRC_AoE3 = "AoE3";
SRC_AoE4 = "AoE4";
SRC_AoE5 = "AoE5";
SRC_AoE6 = "AoE6";
SRC_APG = "APG";
SRC_AV0 = "AV0";
SRC_AV1 = "AV1";
SRC_AV2 = "AV2";
SRC_AV3 = "AV3";
SRC_AVH = "AVH";
SRC_B1 = "B1";
SRC_B2 = "B2";
SRC_B3 = "B3";
SRC_BB = "BB";
SRC_BL0 = "BL0";
SRC_BL1 = "BL1";
SRC_BL2 = "BL2";
SRC_BL3 = "BL3";
SRC_BL4 = "BL4";
SRC_BL5 = "BL5";
SRC_BL6 = "BL6";
SRC_BotD = "BotD";
SRC_CC0 = "CC0";
SRC_CotT = "CotT";
SRC_CFD = "CFD";
SRC_CHD = "CHD";
SRC_CRB = "CRB";
SRC_DA = "DA";
SRC_DaLl = "DaLl";
SRC_EC0 = "EC0";
SRC_EC1 = "EC1";
SRC_EC2 = "EC2";
SRC_EC3 = "EC3";
SRC_EC4 = "EC4";
SRC_EC5 = "EC5";
SRC_EC6 = "EC6";
SRC_FoP = "FoP";
SRC_FRP0 = "FRP0";
SRC_FRP1 = "FRP1";
SRC_FRP2 = "FRP2";
SRC_FRP3 = "FRP3";
SRC_GMG = "GMG";
SRC_GMC = "GMC";
SRC_GnG = "G&G";
SRC_GW0 = "GW0";
SRC_GW1 = "GW1";
SRC_GW2 = "GW2";
SRC_GW3 = "GW3";
SRC_HotW = "HotW";
SRC_HPD = "HPD";
SRC_HStR = "HStR";
SRC_LOACLO = "LOACLO";
SRC_LOAG = "LOAG";
SRC_LOCG = "LOCG";
SRC_LODM = "LODM";
SRC_LOGM = "LOGM";
SRC_LOGMWS = "LOGMWS";
SRC_LOHh = "LOHh";
SRC_LOIL = "LOIL";
SRC_LOKL = "LOKL";
SRC_LOL = "LOL";
SRC_LOME = "LOME";
SRC_LOMM = "LOMM";
SRC_LOPSG = "LOPSG";
SRC_LOTG = "LOTG";
SRC_LOTGB = "LOTGB";
SRC_LOTXWG = "LOTXWG";
SRC_LORA = "LORA";
SRC_LOSK = "LOSK";
SRC_LOWG = "LOWG";
SRC_LTiBA = "LTiBA";
SRC_Mal = "Mal";
SRC_MotM = "MotM";
SRC_MC1 = "MC1";
SRC_MC2 = "MC2";
SRC_NGD = "NGD";
SRC_MS0 = "MS0";
SRC_OoA0 = "OoA0";
SRC_OoA1 = "OoA1";
SRC_OoA2 = "OoA2";
SRC_OoA3 = "OoA3";
SRC_PC1 = "PC1";
SRC_PC2 = "PC2";
SRC_PFUM = "PFUM";
SRC_POS1 = "POS1";
SRC_QFF0 = "QFF0";
SRC_QFF1 = "QFF1";
SRC_QFF2 = "QFF2";
SRC_QFF3 = "QFF3";
SRC_RoE = "RoE";
SRC_Rust = "Rust";
SRC_SaS = "SaS";
SRC_RotR0 = "RotR0";
SRC_SF0 = "SF0";
SRC_SF1 = "SF1";
SRC_SF2 = "SF2";
SRC_SF3 = "SF3";
SRC_SKT0 = "SKT0";
SRC_Sli = "Sli";
SRC_SoB0 = "SoB0";
SRC_SoG0 = "SoG0";
SRC_SoG1 = "SoG1";
SRC_SoG2 = "SoG2";
SRC_SoG3 = "SoG3";
SRC_SoG4 = "SoG4";
SRC_SoM = "SoM";
SRC_SoT0 = "SoT0";
SRC_SoT1 = "SoT1";
SRC_SoT2 = "SoT2";
SRC_SoT3 = "SoT3";
SRC_SoT4 = "SoT4";
SRC_SoT5 = "SoT5";
SRC_SoT6 = "SoT6";
SRC_SW0 = "SW0";
SRC_TaL = "TaL";
SRC_TEC = "TEC";
SRC_TiO = "TiO";
SRC_ToK = "ToK";
SRC_TotT0 = "TotT0";
SRC_TV = "TV";
SRC_WoI = "WoI";
SRC_WoW0 = "WoW0";
SRC_WoW1 = "WoW1";
SRC_WoW2 = "WoW2";
SRC_WoW3 = "WoW3";
SRC_WtD1 = "WtD1";
SRC_WtD2 = "WtD2";
SRC_WtD3 = "WtD3";
SRC_WtD4 = "WtD4";
SRC_WtD5 = "WtD5";
Parser.SOURCE_JSON_TO_ABV[SRC_7DfS0] = "7DfS0";
Parser.SOURCE_JSON_TO_ABV[SRC_AAWS] = "AAWS";
Parser.SOURCE_JSON_TO_ABV[SRC_AFFM] = "AFFM";
Parser.SOURCE_JSON_TO_ABV[SRC_AFoF] = "AFoF";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA0] = "AoA0";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA1] = "AoA1";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA2] = "AoA2";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA3] = "AoA3";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA4] = "AoA4";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA5] = "AoA5";
Parser.SOURCE_JSON_TO_ABV[SRC_AoA6] = "AoA6";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE0] = "AoE0";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE1] = "AoE1";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE2] = "AoE2";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE3] = "AoE3";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE4] = "AoE4";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE5] = "AoE5";
Parser.SOURCE_JSON_TO_ABV[SRC_AoE6] = "AoE6";
Parser.SOURCE_JSON_TO_ABV[SRC_APG] = "APG";
Parser.SOURCE_JSON_TO_ABV[SRC_AV0] = "AV0";
Parser.SOURCE_JSON_TO_ABV[SRC_AV1] = "AV1";
Parser.SOURCE_JSON_TO_ABV[SRC_AV2] = "AV2";
Parser.SOURCE_JSON_TO_ABV[SRC_AV3] = "AV3";
Parser.SOURCE_JSON_TO_ABV[SRC_AVH] = "AVH";
Parser.SOURCE_JSON_TO_ABV[SRC_B1] = "B1";
Parser.SOURCE_JSON_TO_ABV[SRC_B2] = "B2";
Parser.SOURCE_JSON_TO_ABV[SRC_B3] = "B3";
Parser.SOURCE_JSON_TO_ABV[SRC_BB] = "BB";
Parser.SOURCE_JSON_TO_ABV[SRC_BL0] = "BL0";
Parser.SOURCE_JSON_TO_ABV[SRC_BL1] = "BL1";
Parser.SOURCE_JSON_TO_ABV[SRC_BL2] = "BL2";
Parser.SOURCE_JSON_TO_ABV[SRC_BL3] = "BL3";
Parser.SOURCE_JSON_TO_ABV[SRC_BL4] = "BL4";
Parser.SOURCE_JSON_TO_ABV[SRC_BL5] = "BL5";
Parser.SOURCE_JSON_TO_ABV[SRC_BL6] = "BL6";
Parser.SOURCE_JSON_TO_ABV[SRC_BotD] = "BotD";
Parser.SOURCE_JSON_TO_ABV[SRC_CC0] = "CC0";
Parser.SOURCE_JSON_TO_ABV[SRC_CotT] = "CotT";
Parser.SOURCE_JSON_TO_ABV[SRC_CFD] = "CFD";
Parser.SOURCE_JSON_TO_ABV[SRC_CHD] = "CHD";
Parser.SOURCE_JSON_TO_ABV[SRC_CRB] = "CRB";
Parser.SOURCE_JSON_TO_ABV[SRC_DA] = "DA";
Parser.SOURCE_JSON_TO_ABV[SRC_DaLl] = "DaLl";
Parser.SOURCE_JSON_TO_ABV[SRC_EC0] = "EC0";
Parser.SOURCE_JSON_TO_ABV[SRC_EC1] = "EC1";
Parser.SOURCE_JSON_TO_ABV[SRC_EC2] = "EC2";
Parser.SOURCE_JSON_TO_ABV[SRC_EC3] = "EC3";
Parser.SOURCE_JSON_TO_ABV[SRC_EC4] = "EC4";
Parser.SOURCE_JSON_TO_ABV[SRC_EC5] = "EC5";
Parser.SOURCE_JSON_TO_ABV[SRC_EC6] = "EC6";
Parser.SOURCE_JSON_TO_ABV[SRC_FoP] = "FoP";
Parser.SOURCE_JSON_TO_ABV[SRC_FRP0] = "FRP0";
Parser.SOURCE_JSON_TO_ABV[SRC_FRP1] = "FRP1";
Parser.SOURCE_JSON_TO_ABV[SRC_FRP2] = "FRP2";
Parser.SOURCE_JSON_TO_ABV[SRC_FRP3] = "FRP3";
Parser.SOURCE_JSON_TO_ABV[SRC_GMG] = "GMG";
Parser.SOURCE_JSON_TO_ABV[SRC_GMC] = "GMC";
Parser.SOURCE_JSON_TO_ABV[SRC_GnG] = "G&G";
Parser.SOURCE_JSON_TO_ABV[SRC_GW0] = "Gw0";
Parser.SOURCE_JSON_TO_ABV[SRC_GW1] = "Gw1";
Parser.SOURCE_JSON_TO_ABV[SRC_GW2] = "Gw2";
Parser.SOURCE_JSON_TO_ABV[SRC_GW3] = "Gw3";
Parser.SOURCE_JSON_TO_ABV[SRC_HotW] = "HotW";
Parser.SOURCE_JSON_TO_ABV[SRC_HPD] = "HPD";
Parser.SOURCE_JSON_TO_ABV[SRC_HStR] = "HStR";
Parser.SOURCE_JSON_TO_ABV[SRC_LOACLO] = "ACLO";
Parser.SOURCE_JSON_TO_ABV[SRC_LOAG] = "LOAG";
Parser.SOURCE_JSON_TO_ABV[SRC_LOCG] = "LOCG";
Parser.SOURCE_JSON_TO_ABV[SRC_LODM] = "LODM";
Parser.SOURCE_JSON_TO_ABV[SRC_LOGM] = "LOGM";
Parser.SOURCE_JSON_TO_ABV[SRC_LOGMWS] = "LOGMWS";
Parser.SOURCE_JSON_TO_ABV[SRC_LOHh] = "LOHh";
Parser.SOURCE_JSON_TO_ABV[SRC_LOIL] = "LOIL";
Parser.SOURCE_JSON_TO_ABV[SRC_LOKL] = "LOKL";
Parser.SOURCE_JSON_TO_ABV[SRC_LOL] = "LOL";
Parser.SOURCE_JSON_TO_ABV[SRC_LOME] = "LOME";
Parser.SOURCE_JSON_TO_ABV[SRC_LOMM] = "LOMM";
Parser.SOURCE_JSON_TO_ABV[SRC_LOPSG] = "LOPSG";
Parser.SOURCE_JSON_TO_ABV[SRC_LOTG] = "LOTG";
Parser.SOURCE_JSON_TO_ABV[SRC_LOTGB] = "LOTGB";
Parser.SOURCE_JSON_TO_ABV[SRC_LOTXWG] = "LOTXWG";
Parser.SOURCE_JSON_TO_ABV[SRC_LORA] = "LORA";
Parser.SOURCE_JSON_TO_ABV[SRC_LOSK] = "LOSK";
Parser.SOURCE_JSON_TO_ABV[SRC_LOWG] = "LOWG";
Parser.SOURCE_JSON_TO_ABV[SRC_LTiBA] = "LTiBA";
Parser.SOURCE_JSON_TO_ABV[SRC_Mal] = "Mal";
Parser.SOURCE_JSON_TO_ABV[SRC_MotM] = "MotM";
Parser.SOURCE_JSON_TO_ABV[SRC_MC1] = "MC1";
Parser.SOURCE_JSON_TO_ABV[SRC_MC2] = "MC2";
Parser.SOURCE_JSON_TO_ABV[SRC_NGD] = "NGD";
Parser.SOURCE_JSON_TO_ABV[SRC_MS0] = "MS0";
Parser.SOURCE_JSON_TO_ABV[SRC_OoA0] = "OoA0";
Parser.SOURCE_JSON_TO_ABV[SRC_OoA1] = "OoA1";
Parser.SOURCE_JSON_TO_ABV[SRC_OoA2] = "OoA2";
Parser.SOURCE_JSON_TO_ABV[SRC_OoA3] = "OoA3";
Parser.SOURCE_JSON_TO_ABV[SRC_PC1] = "PC1";
Parser.SOURCE_JSON_TO_ABV[SRC_PC2] = "PC2";
Parser.SOURCE_JSON_TO_ABV[SRC_PFUM] = "PFUM";
Parser.SOURCE_JSON_TO_ABV[SRC_POS1] = "POS1";
Parser.SOURCE_JSON_TO_ABV[SRC_QFF0] = "QFF0";
Parser.SOURCE_JSON_TO_ABV[SRC_QFF1] = "QFF1";
Parser.SOURCE_JSON_TO_ABV[SRC_QFF2] = "QFF2";
Parser.SOURCE_JSON_TO_ABV[SRC_QFF3] = "QFF3";
Parser.SOURCE_JSON_TO_ABV[SRC_RoE] = "RoE";
Parser.SOURCE_JSON_TO_ABV[SRC_Rust] = "Rust";
Parser.SOURCE_JSON_TO_ABV[SRC_SaS] = "SaS";
Parser.SOURCE_JSON_TO_ABV[SRC_RotR0] = "RotR0";
Parser.SOURCE_JSON_TO_ABV[SRC_SF0] = "SF0";
Parser.SOURCE_JSON_TO_ABV[SRC_SF1] = "SF1";
Parser.SOURCE_JSON_TO_ABV[SRC_SF2] = "SF2";
Parser.SOURCE_JSON_TO_ABV[SRC_SF3] = "SF3";
Parser.SOURCE_JSON_TO_ABV[SRC_SKT0] = "SKT0";
Parser.SOURCE_JSON_TO_ABV[SRC_Sli] = "Sli";
Parser.SOURCE_JSON_TO_ABV[SRC_SoB0] = "SoB0";
Parser.SOURCE_JSON_TO_ABV[SRC_SoG0] = "SoG0";
Parser.SOURCE_JSON_TO_ABV[SRC_SoG1] = "SoG1";
Parser.SOURCE_JSON_TO_ABV[SRC_SoG2] = "SoG2";
Parser.SOURCE_JSON_TO_ABV[SRC_SoG3] = "SoG3";
Parser.SOURCE_JSON_TO_ABV[SRC_SoG4] = "SoG4";
Parser.SOURCE_JSON_TO_ABV[SRC_SoM] = "SoM";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT0] = "SoT0";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT1] = "SoT1";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT2] = "SoT2";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT3] = "SoT3";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT4] = "SoT4";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT5] = "SoT5";
Parser.SOURCE_JSON_TO_ABV[SRC_SoT6] = "SoT6";
Parser.SOURCE_JSON_TO_ABV[SRC_SW0] = "SW0";
Parser.SOURCE_JSON_TO_ABV[SRC_TaL] = "TaL";
Parser.SOURCE_JSON_TO_ABV[SRC_TEC] = "TEC";
Parser.SOURCE_JSON_TO_ABV[SRC_TiO] = "TiO";
Parser.SOURCE_JSON_TO_ABV[SRC_ToK] = "ToK";
Parser.SOURCE_JSON_TO_ABV[SRC_TotT0] = "TotT0";
Parser.SOURCE_JSON_TO_ABV[SRC_TV] = "TV";
Parser.SOURCE_JSON_TO_ABV[SRC_WoI] = "WoI";
Parser.SOURCE_JSON_TO_ABV[SRC_WoW0] = "WoW0";
Parser.SOURCE_JSON_TO_ABV[SRC_WoW1] = "WoW1";
Parser.SOURCE_JSON_TO_ABV[SRC_WoW2] = "WoW2";
Parser.SOURCE_JSON_TO_ABV[SRC_WoW3] = "WoW3";
Parser.SOURCE_JSON_TO_ABV[SRC_WtD1] = "WtD1";
Parser.SOURCE_JSON_TO_ABV[SRC_WtD2] = "WtD2";
Parser.SOURCE_JSON_TO_ABV[SRC_WtD3] = "WtD3";
Parser.SOURCE_JSON_TO_ABV[SRC_WtD4] = "WtD4";
Parser.SOURCE_JSON_TO_ABV[SRC_WtD5] = "WtD5";
Parser.SOURCE_JSON_TO_DATE[SRC_7DfS0] = "2024-03-08";
Parser.SOURCE_JSON_TO_DATE[SRC_AAWS] = "2021-02-24";
Parser.SOURCE_JSON_TO_DATE[SRC_AFFM] = "2023-07-23";
Parser.SOURCE_JSON_TO_DATE[SRC_AFoF] = "2022-07-25";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA0] = "2019-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA1] = "2019-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA2] = "2019-09-01";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA3] = "2019-09-18";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA4] = "2019-10-16";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA5] = "2019-11-13";
Parser.SOURCE_JSON_TO_DATE[SRC_AoA6] = "2019-12-12";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE0] = "2020-07-08";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE1] = "2020-07-30";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE2] = "2020-08-26";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE3] = "2020-09-15";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE4] = "2020-10-14";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE5] = "2020-11-15";
Parser.SOURCE_JSON_TO_DATE[SRC_AoE6] = "2020-12-15";
Parser.SOURCE_JSON_TO_DATE[SRC_APG] = "2020-07-30";
Parser.SOURCE_JSON_TO_DATE[SRC_AV0] = "2021-01-15";
Parser.SOURCE_JSON_TO_DATE[SRC_AV1] = "2021-01-15";
Parser.SOURCE_JSON_TO_DATE[SRC_AV2] = "2021-02-24";
Parser.SOURCE_JSON_TO_DATE[SRC_AV3] = "2021-04-07";
Parser.SOURCE_JSON_TO_DATE[SRC_AVH] = "2022-05-25";
Parser.SOURCE_JSON_TO_DATE[SRC_B1] = "2019-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_B2] = "2020-05-27";
Parser.SOURCE_JSON_TO_DATE[SRC_B3] = "2021-04-07";
Parser.SOURCE_JSON_TO_DATE[SRC_BB] = "2020-11-11";
Parser.SOURCE_JSON_TO_DATE[SRC_BL0] = "2022-06-29";
Parser.SOURCE_JSON_TO_DATE[SRC_BL1] = "2022-07-27";
Parser.SOURCE_JSON_TO_DATE[SRC_BL2] = "2022-08-31";
Parser.SOURCE_JSON_TO_DATE[SRC_BL3] = "2022-09-21";
Parser.SOURCE_JSON_TO_DATE[SRC_BL4] = "2022-10-19";
Parser.SOURCE_JSON_TO_DATE[SRC_BL5] = "2022-11-16";
Parser.SOURCE_JSON_TO_DATE[SRC_BL6] = "2022-12-14";
Parser.SOURCE_JSON_TO_DATE[SRC_BotD] = "2022-04-27";
Parser.SOURCE_JSON_TO_DATE[SRC_CC0] = "2024-07-10";
Parser.SOURCE_JSON_TO_DATE[SRC_CotT] = "2025-04-02";
Parser.SOURCE_JSON_TO_DATE[SRC_CFD] = "2019-10-16";
Parser.SOURCE_JSON_TO_DATE[SRC_CHD] = "2019-10-16";
Parser.SOURCE_JSON_TO_DATE[SRC_CRB] = "2019-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_DA] = "2022-07-27";
Parser.SOURCE_JSON_TO_DATE[SRC_DaLl] = "2021-05-30";
Parser.SOURCE_JSON_TO_DATE[SRC_EC0] = "2020-01-13";
Parser.SOURCE_JSON_TO_DATE[SRC_EC1] = "2020-01-30";
Parser.SOURCE_JSON_TO_DATE[SRC_EC2] = "2020-02-26";
Parser.SOURCE_JSON_TO_DATE[SRC_EC3] = "2020-03-26";
Parser.SOURCE_JSON_TO_DATE[SRC_EC4] = "2020-04-29";
Parser.SOURCE_JSON_TO_DATE[SRC_EC5] = "2020-05-27";
Parser.SOURCE_JSON_TO_DATE[SRC_EC6] = "2020-06-24";
Parser.SOURCE_JSON_TO_DATE[SRC_FoP] = "2019-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_FRP0] = "2021-04-12";
Parser.SOURCE_JSON_TO_DATE[SRC_FRP1] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[SRC_FRP2] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[SRC_FRP3] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[SRC_GMG] = "2020-02-26";
Parser.SOURCE_JSON_TO_DATE[SRC_GMC] = "2023-11-15";
Parser.SOURCE_JSON_TO_DATE[SRC_GnG] = "2021-10-13";
Parser.SOURCE_JSON_TO_DATE[SRC_GW0] = "2023-01-10";
Parser.SOURCE_JSON_TO_DATE[SRC_GW1] = "2023-01-25";
Parser.SOURCE_JSON_TO_DATE[SRC_GW2] = "2023-02-22";
Parser.SOURCE_JSON_TO_DATE[SRC_GW3] = "2023-03-29";
Parser.SOURCE_JSON_TO_DATE[SRC_HotW] = "2024-05-22";
Parser.SOURCE_JSON_TO_DATE[SRC_HPD] = "2021-11-10";
Parser.SOURCE_JSON_TO_DATE[SRC_HStR] = "2021-10-21";
Parser.SOURCE_JSON_TO_DATE[SRC_LOACLO] = "2021-12-22";
Parser.SOURCE_JSON_TO_DATE[SRC_LOAG] = "2021-02-24";
Parser.SOURCE_JSON_TO_DATE[SRC_LOCG] = "2019-10-16";
Parser.SOURCE_JSON_TO_DATE[SRC_LODM] = "2024-11-20";
Parser.SOURCE_JSON_TO_DATE[SRC_LOGM] = "2020-01-29";
Parser.SOURCE_JSON_TO_DATE[SRC_LOGMWS] = "2020-01-29";
Parser.SOURCE_JSON_TO_DATE[SRC_LOHh] = "2023-06-28";
Parser.SOURCE_JSON_TO_DATE[SRC_LOIL] = "2021-11-06";
Parser.SOURCE_JSON_TO_DATE[SRC_LOKL] = "2022-05-25";
Parser.SOURCE_JSON_TO_DATE[SRC_LOL] = "2020-07-30";
Parser.SOURCE_JSON_TO_DATE[SRC_LOME] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[SRC_LOMM] = "2021-12-22";
Parser.SOURCE_JSON_TO_DATE[SRC_LOPSG] = "2020-10-14";
Parser.SOURCE_JSON_TO_DATE[SRC_LOTG] = "2022-08-31";
Parser.SOURCE_JSON_TO_DATE[SRC_LOTGB] = "2021-10-13";
Parser.SOURCE_JSON_TO_DATE[SRC_LOTXWG] = "2024-04-24";
Parser.SOURCE_JSON_TO_DATE[SRC_LORA] = "2025-03-05";
Parser.SOURCE_JSON_TO_DATE[SRC_LOSK] = "2025-06-04";
Parser.SOURCE_JSON_TO_DATE[SRC_LOWG] = "2019-08-31";
Parser.SOURCE_JSON_TO_DATE[SRC_LTiBA] = "2020-07-25";
Parser.SOURCE_JSON_TO_DATE[SRC_Mal] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[SRC_MotM] = "2022-02-23";
Parser.SOURCE_JSON_TO_DATE[SRC_MC1] = "2024-03-27";
Parser.SOURCE_JSON_TO_DATE[SRC_MC2] = "2025-11-05";
Parser.SOURCE_JSON_TO_DATE[SRC_NGD] = "2021-10-13";
Parser.SOURCE_JSON_TO_DATE[SRC_MS0] = "2025-06-16";
Parser.SOURCE_JSON_TO_DATE[SRC_OoA0] = "2022-03-28";
Parser.SOURCE_JSON_TO_DATE[SRC_OoA1] = "2022-04-27";
Parser.SOURCE_JSON_TO_DATE[SRC_OoA2] = "2022-05-25";
Parser.SOURCE_JSON_TO_DATE[SRC_OoA3] = "2022-06-29";
Parser.SOURCE_JSON_TO_DATE[SRC_PC1] = "2023-11-15";
Parser.SOURCE_JSON_TO_DATE[SRC_PC2] = "2024-08-01";
Parser.SOURCE_JSON_TO_DATE[SRC_PFUM] = "2021-11-11";
Parser.SOURCE_JSON_TO_DATE[SRC_POS1] = "2021-03-06";
Parser.SOURCE_JSON_TO_DATE[SRC_QFF0] = "2021-12-20";
Parser.SOURCE_JSON_TO_DATE[SRC_QFF1] = "2021-01-26";
Parser.SOURCE_JSON_TO_DATE[SRC_QFF2] = "2021-02-23";
Parser.SOURCE_JSON_TO_DATE[SRC_QFF3] = "2021-03-30";
Parser.SOURCE_JSON_TO_DATE[SRC_RoE] = "2023-08-02";
Parser.SOURCE_JSON_TO_DATE[SRC_Rust] = "2023-10-18";
Parser.SOURCE_JSON_TO_DATE[SRC_SaS] = "2022-05-25";
Parser.SOURCE_JSON_TO_DATE[SRC_RotR0] = "2025-09-25";
Parser.SOURCE_JSON_TO_DATE[SRC_SF0] = "2023-04-13";
Parser.SOURCE_JSON_TO_DATE[SRC_SF1] = "2023-04-26";
Parser.SOURCE_JSON_TO_DATE[SRC_SF2] = "2023-05-24";
Parser.SOURCE_JSON_TO_DATE[SRC_SF3] = "2023-06-28";
Parser.SOURCE_JSON_TO_DATE[SRC_SKT0] = "2023-07-13";
Parser.SOURCE_JSON_TO_DATE[SRC_Sli] = "2020-07-30";
Parser.SOURCE_JSON_TO_DATE[SRC_SoB0] = "2025-03-27";
Parser.SOURCE_JSON_TO_DATE[SRC_SoG0] = "2023-10-02";
Parser.SOURCE_JSON_TO_DATE[SRC_SoG1] = "2023-10-18";
Parser.SOURCE_JSON_TO_DATE[SRC_SoG2] = "2023-11-15";
Parser.SOURCE_JSON_TO_DATE[SRC_SoG3] = "2023-12-23";
Parser.SOURCE_JSON_TO_DATE[SRC_SoG4] = "2024-01-31";
Parser.SOURCE_JSON_TO_DATE[SRC_SoM] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT0] = "2021-07-26";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT1] = "2021-08-05";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT2] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT3] = "2021-10-13";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT4] = "2021-10-13";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT5] = "2021-11-10";
Parser.SOURCE_JSON_TO_DATE[SRC_SoT6] = "2021-07-26";
Parser.SOURCE_JSON_TO_DATE[SRC_SW0] = "2024-12-18";
Parser.SOURCE_JSON_TO_DATE[SRC_TaL] = "2019-09-11";
Parser.SOURCE_JSON_TO_DATE[SRC_TEC] = "2023-05-24";
Parser.SOURCE_JSON_TO_DATE[SRC_TiO] = "2020-12-09";
Parser.SOURCE_JSON_TO_DATE[SRC_ToK] = "2021-11-19";
Parser.SOURCE_JSON_TO_DATE[SRC_TotT0] = "2024-10-09";
Parser.SOURCE_JSON_TO_DATE[SRC_TV] = "2023-02-22";
Parser.SOURCE_JSON_TO_DATE[SRC_WoI] = "2024-10-30";
Parser.SOURCE_JSON_TO_DATE[SRC_WoW0] = "2024-04-23";
Parser.SOURCE_JSON_TO_DATE[SRC_WoW1] = "2024-04-23";
Parser.SOURCE_JSON_TO_DATE[SRC_WoW2] = "2024-05-22";
Parser.SOURCE_JSON_TO_DATE[SRC_WoW3] = "2024-06-26";
Parser.SOURCE_JSON_TO_DATE[SRC_WtD1] = "2023-05-31";
Parser.SOURCE_JSON_TO_DATE[SRC_WtD2] = "2023-07-26";
Parser.SOURCE_JSON_TO_DATE[SRC_WtD3] = "2023-09-27";
Parser.SOURCE_JSON_TO_DATE[SRC_WtD4] = "2023-11-28";
Parser.SOURCE_JSON_TO_DATE[SRC_WtD5] = "2024-01-31";
Parser.SOURCE_JSON_TO_FULL[SRC_7DfS0] = "Seven Dooms for Sandpoint Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_AAWS] = "Azarketi Ancestry Web Supplement";
Parser.SOURCE_JSON_TO_FULL[SRC_AFFM] = "A Few Flowers More";
Parser.SOURCE_JSON_TO_FULL[SRC_AFoF] = "A Fistful of Flowers";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA0] = "Age of Ashes Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA1] = "Age of Ashes #1: Hellknight Hill";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA2] = "Age of Ashes #2: Cult of Cinders";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA3] = "Age of Ashes #3: Tomorrow Must Burn";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA4] = "Age of Ashes #4: Fires of the Haunted City";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA5] = "Age of Ashes #5: Against the Scarlet Triad";
Parser.SOURCE_JSON_TO_FULL[SRC_AoA6] = "Age of Ashes #6: Broken Promises";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE0] = "Agents of Edgewatch Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE1] = "Agents of Edgewatch #1: Devil at the Dreaming Palace";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE2] = "Agents of Edgewatch #2: Sixty Feet Under";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE3] = "Agents of Edgewatch #3: All or Nothing";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE4] = "Agents of Edgewatch #4: Assault on Hunting Lodge Seven";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE5] = "Agents of Edgewatch #5: Belly of the Black Whale";
Parser.SOURCE_JSON_TO_FULL[SRC_AoE6] = "Agents of Edgewatch #6: Ruins of the Radiant Siege";
Parser.SOURCE_JSON_TO_FULL[SRC_APG] = "Advanced Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_AV0] = "Abomination Vaults Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_AV1] = "Abomination Vaults #1: Ruins of Gauntlight";
Parser.SOURCE_JSON_TO_FULL[SRC_AV2] = "Abomination Vaults #2: Hands of the Devil";
Parser.SOURCE_JSON_TO_FULL[SRC_AV3] = "Abomination Vaults #3: Eyes of Empty Death";
Parser.SOURCE_JSON_TO_FULL[SRC_AVH] = "Abomination Vaults Hardcover";
Parser.SOURCE_JSON_TO_FULL[SRC_B1] = "Bestiary";
Parser.SOURCE_JSON_TO_FULL[SRC_B2] = "Bestiary 2";
Parser.SOURCE_JSON_TO_FULL[SRC_B3] = "Bestiary 3";
Parser.SOURCE_JSON_TO_FULL[SRC_BB] = "Beginner Box";
Parser.SOURCE_JSON_TO_FULL[SRC_BL0] = "Blood Lords Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_BL1] = "Blood Lords #1: Zombie Feast";
Parser.SOURCE_JSON_TO_FULL[SRC_BL2] = "Blood Lords #2: Graveclaw";
Parser.SOURCE_JSON_TO_FULL[SRC_BL3] = "Blood Lords #3: Field of Maidens";
Parser.SOURCE_JSON_TO_FULL[SRC_BL4] = "Blood Lords #4: The Ghouls Hunger";
Parser.SOURCE_JSON_TO_FULL[SRC_BL5] = "Blood Lords #5: A Taste of Ashes";
Parser.SOURCE_JSON_TO_FULL[SRC_BL6] = "Blood Lords #6: Ghost King's Rage";
Parser.SOURCE_JSON_TO_FULL[SRC_BotD] = "Book of the Dead";
Parser.SOURCE_JSON_TO_FULL[SRC_CC0] = "Curtain Call Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_CotT] = "Claws of the Tyrant";
Parser.SOURCE_JSON_TO_FULL[SRC_CFD] = "Critical Fumble Deck";
Parser.SOURCE_JSON_TO_FULL[SRC_CHD] = "Critical Hit Deck";
Parser.SOURCE_JSON_TO_FULL[SRC_CRB] = "Core Rulebook";
Parser.SOURCE_JSON_TO_FULL[SRC_DA] = "Dark Archive";
Parser.SOURCE_JSON_TO_FULL[SRC_DaLl] = "Dinner at Lionlodge";
Parser.SOURCE_JSON_TO_FULL[SRC_EC0] = "Extinction Curse Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_EC1] = "Extinction Curse #1: The Show Must Go On";
Parser.SOURCE_JSON_TO_FULL[SRC_EC2] = "Extinction Curse #2: Legacy of the Lost God";
Parser.SOURCE_JSON_TO_FULL[SRC_EC3] = "Extinction Curse #3: Life's Long Shadows";
Parser.SOURCE_JSON_TO_FULL[SRC_EC4] = "Extinction Curse #4: Siege of the Dinosaurs";
Parser.SOURCE_JSON_TO_FULL[SRC_EC5] = "Extinction Curse #5: Lord of the Black Sands";
Parser.SOURCE_JSON_TO_FULL[SRC_EC6] = "Extinction Curse #6: The Apocalypse Prophet";
Parser.SOURCE_JSON_TO_FULL[SRC_FoP] = "The Fall of Plaguestone";
Parser.SOURCE_JSON_TO_FULL[SRC_FRP0] = "Fists of the Ruby Phoenix Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_FRP1] = "Fists of the Ruby Phoenix #1: Despair on Danger Island";
Parser.SOURCE_JSON_TO_FULL[SRC_FRP2] = "Fists of the Ruby Phoenix #2: Ready? Fight!";
Parser.SOURCE_JSON_TO_FULL[SRC_FRP3] = "Fists of the Ruby Phoenix #3: King of the Mountain";
Parser.SOURCE_JSON_TO_FULL[SRC_GMG] = "Gamemastery Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_GMC] = "GM Core";
Parser.SOURCE_JSON_TO_FULL[SRC_GnG] = "Guns & Gears";
Parser.SOURCE_JSON_TO_FULL[SRC_GW0] = "Gatewalkers Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_GW1] = "Gatewalkers #1: The Seventh Arch";
Parser.SOURCE_JSON_TO_FULL[SRC_GW2] = "Gatewalkers #2: They Watched the Stars";
Parser.SOURCE_JSON_TO_FULL[SRC_GW3] = "Gatewalkers #3: Dreamers of the Nameless Spires";
Parser.SOURCE_JSON_TO_FULL[SRC_HotW] = "Howl of the Wild";
Parser.SOURCE_JSON_TO_FULL[SRC_HPD] = "Hero Point Deck";
Parser.SOURCE_JSON_TO_FULL[SRC_HStR] = "Head-Shot the Rot";
Parser.SOURCE_JSON_TO_FULL[SRC_LOACLO] = "Lost Omens: Absalom, City of Lost Omens";
Parser.SOURCE_JSON_TO_FULL[SRC_LOAG] = "Lost Omens: Ancestry Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LOCG] = "Lost Omens: Character Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LODM] = "Lost Omens: Divine Mysteries";
Parser.SOURCE_JSON_TO_FULL[SRC_LOGM] = "Lost Omens: Gods & Magic";
Parser.SOURCE_JSON_TO_FULL[SRC_LOGMWS] = "Lost Omens: Gods & Magic Web Supplement";
Parser.SOURCE_JSON_TO_FULL[SRC_LOHh] = "Lost Omens: Highhelm";
Parser.SOURCE_JSON_TO_FULL[SRC_LOIL] = "Lost Omens: Impossible Lands";
Parser.SOURCE_JSON_TO_FULL[SRC_LOKL] = "Lost Omens: Knights of Lastwall";
Parser.SOURCE_JSON_TO_FULL[SRC_LOL] = "Lost Omens: Legends";
Parser.SOURCE_JSON_TO_FULL[SRC_LOME] = "Lost Omens: The Mwangi Expanse";
Parser.SOURCE_JSON_TO_FULL[SRC_LOMM] = "Lost Omens: Monsters of Myth";
Parser.SOURCE_JSON_TO_FULL[SRC_LOPSG] = "Lost Omens: Pathfinder Society Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LOTG] = "Lost Omens: Travel Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LOTGB] = "Lost Omens: The Grand Bazaar";
Parser.SOURCE_JSON_TO_FULL[SRC_LOTXWG] = "Lost Omens: Tian Xia World Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LORA] = "Lost Omens: Rival Academies";
Parser.SOURCE_JSON_TO_FULL[SRC_LOSK] = "Lost Omens: Shining Kingdoms";
Parser.SOURCE_JSON_TO_FULL[SRC_LOWG] = "Lost Omens: World Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_LTiBA] = "Little Trouble in Big Absalom";
Parser.SOURCE_JSON_TO_FULL[SRC_Mal] = "Malevolence";
Parser.SOURCE_JSON_TO_FULL[SRC_MotM] = "Mark of the Mantis";
Parser.SOURCE_JSON_TO_FULL[SRC_MC1] = "Monster Core";
Parser.SOURCE_JSON_TO_FULL[SRC_MC2] = "Monster Core 2";
Parser.SOURCE_JSON_TO_FULL[SRC_NGD] = "Night of the Gray Death";
Parser.SOURCE_JSON_TO_FULL[SRC_MS0] = "Myth-Speaker Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_OoA0] = "Outlaws of Alkenstar Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_OoA1] = "Outlaws of Alkenstar #1: Punks in a Powder Keg";
Parser.SOURCE_JSON_TO_FULL[SRC_OoA2] = "Outlaws of Alkenstar #2: Cradle of Quartz";
Parser.SOURCE_JSON_TO_FULL[SRC_OoA3] = "Outlaws of Alkenstar #3: The Smoking Gun";
Parser.SOURCE_JSON_TO_FULL[SRC_PC1] = "Player Core";
Parser.SOURCE_JSON_TO_FULL[SRC_PC2] = "Player Core 2";
Parser.SOURCE_JSON_TO_FULL[SRC_PFUM] = "PATHFINDER: FUMBUS!";
Parser.SOURCE_JSON_TO_FULL[SRC_POS1] = "Pathfinder One-Shot: Sundered Waves";
Parser.SOURCE_JSON_TO_FULL[SRC_QFF0] = "Quest for the Frozen Flame Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_QFF1] = "Quest for the Frozen Flame #1: Broken Tusk Moon";
Parser.SOURCE_JSON_TO_FULL[SRC_QFF2] = "Quest for the Frozen Flame #2: Lost Mammoth Valley";
Parser.SOURCE_JSON_TO_FULL[SRC_QFF3] = "Quest for the Frozen Flame #3: Burning Tundra";
Parser.SOURCE_JSON_TO_FULL[SRC_RoE] = "Rage of Elements";
Parser.SOURCE_JSON_TO_FULL[SRC_Rust] = "Rusthenge";
Parser.SOURCE_JSON_TO_FULL[SRC_SaS] = "Shadows at Sundown";
Parser.SOURCE_JSON_TO_FULL[SRC_RotR0] = "Revenge of the Runelords Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SF0] = "Stolen Fate Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SF1] = "Stolen Fate #1: The Choosing";
Parser.SOURCE_JSON_TO_FULL[SRC_SF2] = "Stolen Fate #2: The Destiny War";
Parser.SOURCE_JSON_TO_FULL[SRC_SF3] = "Stolen Fate #3: Worst of All Possible Worlds";
Parser.SOURCE_JSON_TO_FULL[SRC_SKT0] = "Sky King's Tomb Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_Sli] = "The Slithering";
Parser.SOURCE_JSON_TO_FULL[SRC_SoB0] = "Shades of Blood Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SoG0] = "Season of Ghosts Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SoG1] = "Season of Ghosts #1: The Summer That Never Was";
Parser.SOURCE_JSON_TO_FULL[SRC_SoG2] = "Season of Ghosts #2: Let the Leaves Fall";
Parser.SOURCE_JSON_TO_FULL[SRC_SoG3] = "Season of Ghosts #3: No Breath to Cry";
Parser.SOURCE_JSON_TO_FULL[SRC_SoG4] = "Season of Ghosts #4: To Bloom Below the Web";
Parser.SOURCE_JSON_TO_FULL[SRC_SoM] = "Secrets of Magic";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT0] = "Strength of Thousands Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT1] = "Strength of Thousands #1: Kindled Magic";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT2] = "Strength of Thousands #2: Spoken on the Song Wind";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT3] = "Strength of Thousands #3: Hurricane's Howl";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT4] = "Strength of Thousands #4: Secrets of the Temple-City";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT5] = "Strength of Thousands #5: Doorway to the Red Star";
Parser.SOURCE_JSON_TO_FULL[SRC_SoT6] = "Strength of Thousands #6: Shadows of the Ancients";
Parser.SOURCE_JSON_TO_FULL[SRC_SW0] = "Spore War Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_TaL] = "Torment and Legacy";
Parser.SOURCE_JSON_TO_FULL[SRC_TEC] = "The Enmity Cycle";
Parser.SOURCE_JSON_TO_FULL[SRC_TiO] = "Troubles in Otari";
Parser.SOURCE_JSON_TO_FULL[SRC_ToK] = "Threshold of Knowledge";
Parser.SOURCE_JSON_TO_FULL[SRC_TotT0] = "Triumph of the Tusk Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_TV] = "Treasure Vault";
Parser.SOURCE_JSON_TO_FULL[SRC_WoI] = "War of Immortals";
Parser.SOURCE_JSON_TO_FULL[SRC_WoW0] = "Wardens of Wildwood Player's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_WoW1] = "Wardens of Wildwood #1: Pactbreaker";
Parser.SOURCE_JSON_TO_FULL[SRC_WoW2] = "Wardens of Wildwood #2: Severed at the Root";
Parser.SOURCE_JSON_TO_FULL[SRC_WoW3] = "Wardens of Wildwood #3: Shepherd of Decay";
Parser.SOURCE_JSON_TO_FULL[SRC_WtD1] = "Wake the Dead #1";
Parser.SOURCE_JSON_TO_FULL[SRC_WtD2] = "Wake the Dead #2";
Parser.SOURCE_JSON_TO_FULL[SRC_WtD3] = "Wake the Dead #3";
Parser.SOURCE_JSON_TO_FULL[SRC_WtD4] = "Wake the Dead #4";
Parser.SOURCE_JSON_TO_FULL[SRC_WtD5] = "Wake the Dead #5";
Parser.SOURCE_JSON_TO_STORE[SRC_7DfS0] = "https://downloads.paizo.com/SevenDoomsforSandpoint_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_AAWS] =
	"https://paizo-images.s3-us-west-2.amazonaws.com/image/download/Azarketi+Ancestry.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_AFFM] = "https://paizo.com/products/btq02eio";
Parser.SOURCE_JSON_TO_STORE[SRC_AFoF] = "https://paizo.com/products/btq02d8f";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA0] = "https://paizo.com/products/btq024wj";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA1] = "https://paizo.com/products/btq024tw";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA2] = "https://paizo.com/products/btq022ci";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA3] = "https://paizo.com/products/btq022lx";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA4] = "https://paizo.com/products/btq0204d";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA5] = "https://paizo.com/products/btq023dz";
Parser.SOURCE_JSON_TO_STORE[SRC_AoA6] = "https://paizo.com/products/btq023g1";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE0] = "https://paizo.com/products/btq01zth";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE1] = "https://paizo.com/products/btq01znq";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE2] = "https://paizo.com/products/btq01znt";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE3] = "https://paizo.com/products/btq01zrs";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE4] = "https://paizo.com/products/btq0233p";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE5] = "https://paizo.com/products/btq02065";
Parser.SOURCE_JSON_TO_STORE[SRC_AoE6] = "https://paizo.com/products/btq021cb";
Parser.SOURCE_JSON_TO_STORE[SRC_APG] = "https://paizo.com/products/btq023ih";
Parser.SOURCE_JSON_TO_STORE[SRC_AV0] = "https://paizo.com/community/blog/v5748dyo6shjm";
Parser.SOURCE_JSON_TO_STORE[SRC_AV1] = "https://paizo.com/products/btq026kj";
Parser.SOURCE_JSON_TO_STORE[SRC_AV2] = "https://paizo.com/products/btq027jm";
Parser.SOURCE_JSON_TO_STORE[SRC_AV3] = "https://paizo.com/products/btq024xm";
Parser.SOURCE_JSON_TO_STORE[SRC_AVH] = "https://paizo.com/products/btq02ajj";
Parser.SOURCE_JSON_TO_STORE[SRC_B1] = "https://paizo.com/products/btq01zp4";
Parser.SOURCE_JSON_TO_STORE[SRC_B2] = "https://paizo.com/products/btq022yq";
Parser.SOURCE_JSON_TO_STORE[SRC_B3] = "https://paizo.com/products/btq027mn";
Parser.SOURCE_JSON_TO_STORE[SRC_BB] = "https://paizo.com/products/btq023dx";
Parser.SOURCE_JSON_TO_STORE[SRC_BL0] = "https://paizo.com/community/blog/v5748dyo6si34";
Parser.SOURCE_JSON_TO_STORE[SRC_BL1] = "https://paizo.com/products/btq02art";
Parser.SOURCE_JSON_TO_STORE[SRC_BL2] = "https://paizo.com/products/btq02asf";
Parser.SOURCE_JSON_TO_STORE[SRC_BL3] = "https://paizo.com/products/btq02c11";
Parser.SOURCE_JSON_TO_STORE[SRC_BL4] = "https://paizo.com/products/btq02c4e";
Parser.SOURCE_JSON_TO_STORE[SRC_BL5] = "https://paizo.com/products/btq02d51";
Parser.SOURCE_JSON_TO_STORE[SRC_BL6] = "https://paizo.com/products/btq02d71";
Parser.SOURCE_JSON_TO_STORE[SRC_BotD] = "https://paizo.com/products/btq02c0j";
Parser.SOURCE_JSON_TO_STORE[SRC_CC0] = "https://downloads.paizo.com/CurtainCall_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_CotT] = "https://paizo.com/products/btq0740q";
Parser.SOURCE_JSON_TO_STORE[SRC_CFD] = "https://paizo.com/products/btq024ud";
Parser.SOURCE_JSON_TO_STORE[SRC_CHD] = "https://paizo.com/products/btq024tn";
Parser.SOURCE_JSON_TO_STORE[SRC_CRB] = "https://paizo.com/products/btq01zp3";
Parser.SOURCE_JSON_TO_STORE[SRC_DA] = "https://paizo.com/products/btq02arq";
Parser.SOURCE_JSON_TO_STORE[SRC_DaLl] = "https://paizo.com/products/btq027ug";
Parser.SOURCE_JSON_TO_STORE[SRC_EC0] = "https://paizo.com/products/btq022ks";
Parser.SOURCE_JSON_TO_STORE[SRC_EC1] = "https://paizo.com/products/btq01zqb";
Parser.SOURCE_JSON_TO_STORE[SRC_EC2] = "https://paizo.com/products/btq01zrd";
Parser.SOURCE_JSON_TO_STORE[SRC_EC3] = "https://paizo.com/products/btq01zuh";
Parser.SOURCE_JSON_TO_STORE[SRC_EC4] = "https://paizo.com/products/btq0216l";
Parser.SOURCE_JSON_TO_STORE[SRC_EC5] = "https://paizo.com/products/btq021by";
Parser.SOURCE_JSON_TO_STORE[SRC_EC6] = "https://paizo.com/products/btq021f4";
Parser.SOURCE_JSON_TO_STORE[SRC_FoP] = "https://paizo.com/products/btq01zoh";
Parser.SOURCE_JSON_TO_STORE[SRC_FRP0] = "https://paizo-images.s3-us-west-2.amazonaws.com/image/download/Fists+of+the+Ruby+Phoenix+Player's+Guide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_FRP1] = "https://paizo.com/products/btq027qd";
Parser.SOURCE_JSON_TO_STORE[SRC_FRP2] = "https://paizo.com/products/btq027sp";
Parser.SOURCE_JSON_TO_STORE[SRC_FRP3] = "https://paizo.com/products/btq027sq";
Parser.SOURCE_JSON_TO_STORE[SRC_GMG] = "https://paizo.com/products/btq022c1";
Parser.SOURCE_JSON_TO_STORE[SRC_GMC] = "https://store.paizo.com/pathfinder-gm-core/";
Parser.SOURCE_JSON_TO_STORE[SRC_GnG] = "https://paizo.com/products/btq026mw";
Parser.SOURCE_JSON_TO_STORE[SRC_GW0] = "https://downloads.paizo.com/GatewalkersPlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_GW1] = "https://paizo.com/products/btq02dsq";
Parser.SOURCE_JSON_TO_STORE[SRC_GW2] = "https://paizo.com/products/btq02dw1";
Parser.SOURCE_JSON_TO_STORE[SRC_GW3] = "https://paizo.com/products/btq02ef2";
Parser.SOURCE_JSON_TO_STORE[SRC_HotW] = "https://paizo.com/products/btq02ew4";
Parser.SOURCE_JSON_TO_STORE[SRC_HPD] = "https://paizo.com/products/btq024ut";
Parser.SOURCE_JSON_TO_STORE[SRC_HStR] = "https://paizo.com/products/btq02anr";
Parser.SOURCE_JSON_TO_STORE[SRC_LOACLO] = "https://paizo.com/products/btq02ap2";
Parser.SOURCE_JSON_TO_STORE[SRC_LOAG] = "https://paizo.com/products/btq026k5";
Parser.SOURCE_JSON_TO_STORE[SRC_LOCG] = "https://paizo.com/products/btq01zt4";
Parser.SOURCE_JSON_TO_STORE[SRC_LODM] = "https://paizo.com/products/btq02oal";
Parser.SOURCE_JSON_TO_STORE[SRC_LOGM] = "https://paizo.com/products/btq021wf";
Parser.SOURCE_JSON_TO_STORE[SRC_LOGMWS] = "https://paizo-images.s3-us-west-2.amazonaws.com/image/download/PZO9303+Gods+%26+Magic+Web+Supplement.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_LOHh] = "https://paizo.com/products/btq02e6p";
Parser.SOURCE_JSON_TO_STORE[SRC_LOIL] = "https://paizo.com/products/btq02dxx";
Parser.SOURCE_JSON_TO_STORE[SRC_LOKL] = "https://paizo.com/products/btq02c3a";
Parser.SOURCE_JSON_TO_STORE[SRC_LOL] = "https://paizo.com/products/btq023gd";
Parser.SOURCE_JSON_TO_STORE[SRC_LOME] = "https://paizo.com/products/btq026i4";
Parser.SOURCE_JSON_TO_STORE[SRC_LOMM] = "https://paizo.com/products/btq027u2";
Parser.SOURCE_JSON_TO_STORE[SRC_LOPSG] = "https://paizo.com/products/btq0250x";
Parser.SOURCE_JSON_TO_STORE[SRC_LOTG] = "https://paizo.com/products/btq02c20";
Parser.SOURCE_JSON_TO_STORE[SRC_LOTGB] = "https://paizo.com/products/btq027kc";
Parser.SOURCE_JSON_TO_STORE[SRC_LOTXWG] = "https://paizo.com/products/btq02ex6";
Parser.SOURCE_JSON_TO_STORE[SRC_LORA] = "https://paizo.com/products/btq05yck";
Parser.SOURCE_JSON_TO_STORE[SRC_LOSK] = "https://paizo.com/products/btq08pw5";
Parser.SOURCE_JSON_TO_STORE[SRC_LOWG] = "https://paizo.com/products/btq01zoj";
Parser.SOURCE_JSON_TO_STORE[SRC_LTiBA] = "https://paizo.com/products/btq024ys";
Parser.SOURCE_JSON_TO_STORE[SRC_Mal] = "https://paizo.com/products/btq027qf";
Parser.SOURCE_JSON_TO_STORE[SRC_MotM] = "https://paizo.com/products/btq02c32";
Parser.SOURCE_JSON_TO_STORE[SRC_MC1] = "https://store.paizo.com/pathfinder-monster-core/";
Parser.SOURCE_JSON_TO_STORE[SRC_MC2] = "https://store.paizo.com/pathfinder-monster-core-2/";
Parser.SOURCE_JSON_TO_STORE[SRC_NGD] = "https://paizo.com/products/btq027o0";
Parser.SOURCE_JSON_TO_STORE[SRC_MS0] = "https://downloads.paizo.com/Myth-Speaker_Players-Guide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_OoA0] = "https://downloads.paizo.com/Outlaws+of+Alkenstar+Player's+Guide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_OoA1] = "https://paizo.com/products/btq02ajl";
Parser.SOURCE_JSON_TO_STORE[SRC_OoA2] = "https://paizo.com/products/btq02am3";
Parser.SOURCE_JSON_TO_STORE[SRC_OoA3] = "https://paizo.com/products/btq02aot";
Parser.SOURCE_JSON_TO_STORE[SRC_PC1] = "https://paizo.com/products/btq02ej2";
Parser.SOURCE_JSON_TO_STORE[SRC_PC2] = "https://paizo.com/products/btq02ej5";
Parser.SOURCE_JSON_TO_STORE[SRC_PFUM] = "https://www.kickstarter.com/projects/dynamiteent/pathfinder-fumbus?ref=Pf2eTools";
Parser.SOURCE_JSON_TO_STORE[SRC_POS1] = "https://paizo.com/products/btq027oe";
Parser.SOURCE_JSON_TO_STORE[SRC_QFF0] = "https://downloads.paizo.com/QuestfortheFrozenFlame_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_QFF1] = "https://paizo.com/products/btq02asv";
Parser.SOURCE_JSON_TO_STORE[SRC_QFF2] = "https://paizo.com/products/btq029ud";
Parser.SOURCE_JSON_TO_STORE[SRC_QFF3] = "https://paizo.com/products/btq029wg";
Parser.SOURCE_JSON_TO_STORE[SRC_RoE] = "https://paizo.com/products/btq02eal";
Parser.SOURCE_JSON_TO_STORE[SRC_Rust] = "https://paizo.com/products/btq02epv";
Parser.SOURCE_JSON_TO_STORE[SRC_SaS] = "https://paizo.com/products/btq02d7e";
Parser.SOURCE_JSON_TO_STORE[SRC_RotR0] = "https://downloads.paizo.com/RevengeoftheRunelord_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_SF0] = "https://downloads.paizo.com/StolenFatePlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_SF1] = "https://paizo.com/products/btq02e0v";
Parser.SOURCE_JSON_TO_STORE[SRC_SF2] = "https://paizo.com/products/btq02e51";
Parser.SOURCE_JSON_TO_STORE[SRC_SF3] = "https://paizo.com/products/btq02e6r";
Parser.SOURCE_JSON_TO_STORE[SRC_SKT0] = "https://downloads.paizo.com/SkyKingsTombPlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_Sli] = "https://paizo.com/products/btq023hg";
Parser.SOURCE_JSON_TO_STORE[SRC_SoB0] = "https://downloads.paizo.com/ShadesOfBlood_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_SoG0] = "https://downloads.paizo.com/SeasonofGhosts_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_SoG1] = "https://paizo.com/products/btq02efy";
Parser.SOURCE_JSON_TO_STORE[SRC_SoG2] = "https://paizo.com/products/btq02eha";
Parser.SOURCE_JSON_TO_STORE[SRC_SoG3] = "https://paizo.com/products/btq02eje";
Parser.SOURCE_JSON_TO_STORE[SRC_SoG4] = "https://paizo.com/products/btq02eno";
Parser.SOURCE_JSON_TO_STORE[SRC_SoM] = "https://paizo.com/products/btq027uy";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT0] = "https://paizo.com/community/blog/v5748dyo6shr4";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT1] = "https://paizo.com/products/btq026li";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT2] = "https://paizo.com/products/btq026mv";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT3] = "https://paizo.com/products/btq027kb";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT4] = "https://paizo.com/products/btq027nz";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT5] = "https://paizo.com/products/btq027s2";
Parser.SOURCE_JSON_TO_STORE[SRC_SoT6] = "https://paizo.com/products/btq027u1";
Parser.SOURCE_JSON_TO_STORE[SRC_SW0] = "https://downloads.paizo.com/SporeWar_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_TaL] = "https://paizo.com/products/btq021ax";
Parser.SOURCE_JSON_TO_STORE[SRC_TEC] = "https://paizo.com/products/btq02e50";
Parser.SOURCE_JSON_TO_STORE[SRC_TiO] = "https://paizo.com/products/btq026k1";
Parser.SOURCE_JSON_TO_STORE[SRC_ToK] = "https://paizo.com/products/btq027qf";
Parser.SOURCE_JSON_TO_STORE[SRC_TotT0] = "https://downloads.paizo.com/TriumphOfTheTusk_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_TV] = "https://paizo.com/products/btq02eav";
Parser.SOURCE_JSON_TO_STORE[SRC_WoI] = "https://paizo.com/products/btq02oar";
Parser.SOURCE_JSON_TO_STORE[SRC_WoW0] = "https://downloads.paizo.com/WardensofWildwood_PlayersGuide.pdf";
Parser.SOURCE_JSON_TO_STORE[SRC_WoW1] = "https://paizo.com/products/btq02ev4";
Parser.SOURCE_JSON_TO_STORE[SRC_WoW2] = "https://paizo.com/products/btq02ewl";
Parser.SOURCE_JSON_TO_STORE[SRC_WoW3] = "https://paizo.com/products/btq02ez1";
Parser.SOURCE_JSON_TO_STORE[SRC_WtD1] = "https://paizo.com/products/btq02eic";
Parser.SOURCE_JSON_TO_STORE[SRC_WtD2] = "https://www.dynamite.com/htmlfiles/viewProduct.html?PRO=C72513033022202011";
Parser.SOURCE_JSON_TO_STORE[SRC_WtD3] = "https://www.dynamite.com/htmlfiles/viewProduct.html?PRO=C72513033022203011";
Parser.SOURCE_JSON_TO_STORE[SRC_WtD4] = "https://www.dynamite.com/htmlfiles/viewProduct.html?PRO=C72513033022204011";
Parser.SOURCE_JSON_TO_STORE[SRC_WtD5] = "https://www.dynamite.com/htmlfiles/viewProduct.html?PRO=C72513033022205011";

Parser.SOURCES_ADVENTURES = new Set([
	SRC_7DfS0,
	SRC_AFFM,
	SRC_AFoF,
	SRC_AoA0,
	SRC_AoA1,
	SRC_AoA2,
	SRC_AoA3,
	SRC_AoA4,
	SRC_AoA5,
	SRC_AoA6,
	SRC_AoE0,
	SRC_AoE1,
	SRC_AoE2,
	SRC_AoE3,
	SRC_AoE4,
	SRC_AoE5,
	SRC_AoE6,
	SRC_AV0,
	SRC_AV1,
	SRC_AV2,
	SRC_AV3,
	SRC_AVH,
	SRC_BB,
	SRC_BL0,
	SRC_BL1,
	SRC_BL2,
	SRC_BL3,
	SRC_BL4,
	SRC_BL5,
	SRC_BL6,
	SRC_CC0,
	SRC_CotT,
	SRC_DaLl,
	SRC_EC0,
	SRC_EC1,
	SRC_EC2,
	SRC_EC3,
	SRC_EC4,
	SRC_EC5,
	SRC_EC6,
	SRC_FoP,
	SRC_FRP0,
	SRC_FRP1,
	SRC_FRP2,
	SRC_FRP3,
	SRC_GW0,
	SRC_GW1,
	SRC_GW2,
	SRC_GW3,
	SRC_HStR,
	SRC_LTiBA,
	SRC_Mal,
	SRC_MotM,
	SRC_NGD,
	SRC_MS0,
	SRC_OoA0,
	SRC_OoA1,
	SRC_OoA2,
	SRC_OoA3,
	SRC_POS1,
	SRC_QFF0,
	SRC_QFF1,
	SRC_QFF2,
	SRC_QFF3,
	SRC_Rust,
	SRC_SaS,
	SRC_RotR0,
	SRC_SF0,
	SRC_SF1,
	SRC_SF2,
	SRC_SF3,
	SRC_SKT0,
	SRC_Sli,
	SRC_SoB0,
	SRC_SoG0,
	SRC_SoG1,
	SRC_SoG2,
	SRC_SoG3,
	SRC_SoG4,
	SRC_SoT0,
	SRC_SoT1,
	SRC_SoT2,
	SRC_SoT3,
	SRC_SoT4,
	SRC_SoT5,
	SRC_SoT6,
	SRC_SW0,
	SRC_TaL,
	SRC_TEC,
	SRC_TiO,
	SRC_ToK,
	SRC_TotT0,
	SRC_WoW0,
	SRC_WoW1,
	SRC_WoW2,
	SRC_WoW3,
]);
Parser.SOURCES_VANILLA = new Set([
	SRC_APG,
	SRC_B1,
	SRC_B2,
	SRC_B3,
	SRC_BotD,
	SRC_CRB,
	SRC_DA,
	SRC_GMG,
	SRC_GMC,
	SRC_GnG,
	SRC_HotW,
	SRC_PC1,
	SRC_PC2,
	SRC_MC1,
	SRC_MC2,
	SRC_RoE,
	SRC_SoM,
]);
Parser.TAG_TO_DEFAULT_SOURCE = {
	ability: SRC_B1,
	action: SRC_CRB,
	ancestry: SRC_CRB,
	archetype: SRC_CRB,
	background: SRC_CRB,
	class: SRC_CRB,
	classFeature: SRC_CRB,
	companion: SRC_CRB,
	companionAbility: SRC_CRB,
	condition: SRC_CRB,
	creature: SRC_B1,
	creatureTemplate: SRC_B1,
	curse: SRC_GMG,
	deity: SRC_CRB,
	disease: SRC_GMG,
	domain: SRC_CRB,
	eidolon: SRC_SoM,
	event: SRC_LOTG,
	familiar: SRC_APG,
	familiarAbility: SRC_CRB,
	feat: SRC_CRB,
	group: SRC_CRB,
	hazard: SRC_CRB,
	item: SRC_CRB,
	language: SRC_CRB,
	nation: SRC_GMG,
	optfeature: SRC_APG,
	organization: SRC_LOCG,
	place: SRC_GMG,
	plane: SRC_GMG,
	relicGift: SRC_GMG,
	ritual: SRC_CRB,
	settlement: SRC_GMG,
	skill: SRC_CRB,
	spell: SRC_CRB,
	subclassFeature: SRC_CRB,
	table: SRC_CRB,
	trait: SRC_CRB,
	trap: SRC_CRB,
	variantrule: SRC_GMG,
	vehicle: SRC_GMG,
	versatileHeritage: SRC_APG,
};

Parser._tagSourceIndex = null;
Parser._pTagSourceIndex = null;

Parser.pInitTagSourceIndex = async function () {
	if (Parser._tagSourceIndex) return;
	if (Parser._pTagSourceIndex) return Parser._pTagSourceIndex;

	Parser._pTagSourceIndex = (async () => {
		if (typeof XMLHttpRequest === "undefined") {
			Parser._tagSourceIndex = {};
			return;
		}

		try {
			Parser._tagSourceIndex = await DataUtil._pLoad(UrlUtil.link("data/generated/tag-source-index.json"));
		} catch {
			// The index is generated during builds. Source checkouts without generated data retain the legacy defaults.
			Parser._tagSourceIndex = {};
		}
	})();

	return Parser._pTagSourceIndex;
};
[
	SRC_AAWS,
	SRC_APG,
	SRC_B1,
	SRC_B2,
	SRC_B3,
	SRC_BotD,
	SRC_CFD,
	SRC_CHD,
	SRC_CRB,
	SRC_DA,
	SRC_GMG,
	SRC_GnG,
	SRC_HotW,
	SRC_HPD,
	SRC_LOACLO,
	SRC_LOAG,
	SRC_LOCG,
	SRC_LODM,
	SRC_LOGM,
	SRC_LOGMWS,
	SRC_LOHh,
	SRC_LOIL,
	SRC_LOKL,
	SRC_LOL,
	SRC_LOME,
	SRC_LOMM,
	SRC_LOPSG,
	SRC_LOTG,
	SRC_LOTGB,
	SRC_LOTXWG,
	SRC_LORA,
	SRC_LOSK,
	SRC_LOWG,
	SRC_PC1,
	SRC_PC2,
	SRC_PFUM,
	SRC_RoE,
	SRC_SoM,
	SRC_TV,
	SRC_WoI,
].forEach((src) => {
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = src;
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = src;
});
[
	SRC_7DfS0,
	SRC_AFFM,
	SRC_AFoF,
	SRC_AoA0,
	SRC_AoA1,
	SRC_AoA2,
	SRC_AoA3,
	SRC_AoA4,
	SRC_AoA5,
	SRC_AoA6,
	SRC_AoE0,
	SRC_AoE1,
	SRC_AoE2,
	SRC_AoE3,
	SRC_AoE4,
	SRC_AoE5,
	SRC_AoE6,
	SRC_AV0,
	SRC_AV1,
	SRC_AV2,
	SRC_AV3,
	SRC_AVH,
	SRC_BB,
	SRC_BL0,
	SRC_BL1,
	SRC_BL2,
	SRC_BL3,
	SRC_BL4,
	SRC_BL5,
	SRC_BL6,
	SRC_CC0,
	SRC_CotT,
	SRC_DaLl,
	SRC_EC0,
	SRC_EC1,
	SRC_EC2,
	SRC_EC3,
	SRC_EC4,
	SRC_EC5,
	SRC_EC6,
	SRC_FoP,
	SRC_FRP0,
	SRC_FRP1,
	SRC_FRP2,
	SRC_FRP3,
	SRC_GW0,
	SRC_GW1,
	SRC_GW2,
	SRC_GW3,
	SRC_HStR,
	SRC_LTiBA,
	SRC_Mal,
	SRC_MotM,
	SRC_NGD,
	SRC_MS0,
	SRC_OoA0,
	SRC_OoA1,
	SRC_OoA2,
	SRC_OoA3,
	SRC_POS1,
	SRC_QFF0,
	SRC_QFF1,
	SRC_QFF2,
	SRC_QFF3,
	SRC_Rust,
	SRC_SaS,
	SRC_RotR0,
	SRC_SF0,
	SRC_SF1,
	SRC_SF2,
	SRC_SF3,
	SRC_SKT0,
	SRC_Sli,
	SRC_SoB0,
	SRC_SoG0,
	SRC_SoG1,
	SRC_SoG2,
	SRC_SoG3,
	SRC_SoG4,
	SRC_SoT0,
	SRC_SoT1,
	SRC_SoT2,
	SRC_SoT3,
	SRC_SoT4,
	SRC_SoT5,
	SRC_SoT6,
	SRC_SW0,
	SRC_TaL,
	SRC_TEC,
	SRC_TiO,
	SRC_ToK,
	SRC_TotT0,
	SRC_WoW0,
	SRC_WoW1,
	SRC_WoW2,
	SRC_WoW3,
].forEach((src) => {
	Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src] = src;
	Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src.toLowerCase()] = src;
});
Parser.SOURCES_ACCESSORIES = new Set(SRC_CFD, SRC_CHD, SRC_HPD, SRC_WtD1, SRC_WtD2, SRC_WtD3, SRC_WtD4, SRC_WtD5);
// #endregion

Parser.SOURCES_CORE_SUPPLEMENTS = new Set(
	Object.keys(Parser.SOURCE_JSON_TO_FULL).filter(
		(it) =>
			!Parser.SOURCES_ADVENTURES.has(it)
			&& !Parser.SOURCES_ACCESSORIES.has(it),
	),
);

Parser.getTagSource = function (tag, source, name) {
	if (source && source.trim()) return source;
	tag = tag.trim();
	if (tag.startsWith("@")) tag = tag.slice(1);

	const uniqueSource = name && Parser._tagSourceIndex?.[tag]?.[name.trim().toLowerCase()];
	if (uniqueSource) return uniqueSource;

	if (!Parser.TAG_TO_DEFAULT_SOURCE[tag]) {
		throw new Error(`Unhandled tag source "${tag}"`);
	}
	return Parser.TAG_TO_DEFAULT_SOURCE[tag];
};

Parser.getTraitName = function (trait) {
	const name = trait
		? Parser.parseTraits([trait.replace(/\|.+/, "")], { toNone: true })[0]
		: "";
	if (name === name.toUpperCase()) return name;
	else if (name.length <= 2) {
		return name.toUpperCase(); // Alignment traits: CG, LE, ...
	} else return name.toTitleCase();
};

// Interface labels only. Saved filter keys, URLs, and authored content stay unchanged.
Parser.UI_LABELS = {
	"Home": "Início",
	"Rules": "Regras",
	"Player": "Jogador",
	"Players": "Jogadores",
	"Game Master": "Mestre",
	"Game Masters": "Mestres",
	"References": "Referências",
	"Utilities": "Utilitários",
	"Settings": "Configurações",
	"Help": "Ajuda",
	"Search": "Busca",
	"Ancestries": "Ancestralidades",
	"Ancestry": "Ancestralidade",
	"Backgrounds": "Biografias",
	"Background": "Biografia",
	"Classes": "Classes",
	"Class": "Classe",
	"Feats": "Talentos",
	"Feat": "Talento",
	"Archetypes": "Arquétipos",
	"Archetype": "Arquétipo",
	"Companions & Familiars": "Companheiros e Familiares",
	"Companions &amp; Familiars": "Companheiros e Familiares",
	"Familiar Abilities": "Habilidades de Familiar",
	"Familiar Ability": "Habilidade de Familiar",
	"Optional Features": "Características Opcionais",
	"Opt. Feature": "Característica Opcional",
	"Feature": "Característica",
	"Features": "Características",
	"Campaigns": "Campanhas",
	"Campaign": "Campanha",
	"Campaign Sessions": "Sessões da Campanha",
	"View All Campaigns": "Ver Todas as Campanhas",
	"Undated": "Sem data",
	"Events": "Eventos",
	"Event": "Evento",
	"Hazards": "Perigos",
	"Hazard": "Perigo",
	"Relic Gifts": "Dons de Relíquia",
	"Relic Gift": "Dom de Relíquia",
	"Actions": "Ações",
	"Action": "Ação",
	"Bestiary": "Bestiário",
	"Creature": "Criatura",
	"Conditions": "Condições",
	"Condition": "Condição",
	"Items": "Itens",
	"Item": "Item",
	"Spells": "Magias",
	"Spell": "Magia",
	"Afflictions": "Aflições",
	"Affliction": "Aflição",
	"Rituals": "Rituais",
	"Ritual": "Ritual",
	"Vehicles": "Veículos",
	"Vehicle": "Veículo",
	"Deities": "Divindades",
	"Deity": "Divindade",
	"Languages": "Idiomas",
	"Language": "Idioma",
	"Planes & Places": "Planos e Lugares",
	"Organizations": "Organizações",
	"Organization": "Organização",
	"Creature Abilities": "Habilidades de Criatura",
	"Abilities": "Habilidades",
	"Ability": "Habilidade",
	"Traits": "Traços",
	"Trait": "Traço",
	"Quick Reference": "Referência Rápida",
	"Rules Glossary": "Glossário de Regras",
	"Changelog": "Histórico de Alterações",
	"Tables": "Tabelas",
	"Table": "Tabela",
	"Name": "Nome",
	"Source": "Fonte",
	"Sources": "Fontes",
	"Time": "Tempo",
	"Type": "Tipo",
	"Category": "Categoria",
	"Categories": "Categorias",
	"Subcategory": "Subcategoria",
	"Level": "Nível",
	"Lvl.": "Nív.",
	"Rarity": "Raridade",
	"Prerequisites": "Pré-requisitos",
	"Prerequisite": "Pré-requisito",
	"Setting": "Cenário",
	"Sessions": "Sessões",
	"Started": "Início",
	"Alignment": "Tendência",
	"Follower Alignment": "Tendência dos Devotos",
	"Accepted Alignment": "Tendência Aceita",
	"Size": "Tamanho",
	"Domains": "Domínios",
	"Domain": "Domínio",
	"Pantheon": "Panteão",
	"Aspects": "Aspectos",
	"Aspect": "Aspecto",
	"Tier": "Grau",
	"Cast Time": "Tempo de Conjuração",
	"Price": "Preço",
	"Bulk": "Volume",
	"Number": "Quantidade",
	"Total:": "Total:",
	"Reset": "Redefinir",
	"Reset Selection": "Redefinir Seleção",
	"Reset All": "Redefinir Tudo",
	"Show All": "Mostrar Tudo",
	"Hide All": "Ocultar Tudo",
	"All": "Todos",
	"Clear": "Limpar",
	"None": "Nenhum",
	"Default": "Padrão",
	"Hide": "Ocultar",
	"Show": "Mostrar",
	"Save": "Salvar",
	"Cancel": "Cancelar",
	"Close": "Fechar",
	"Confirm": "Confirmar",
	"Load": "Carregar",
	"Select": "Selecionar",
	"Back": "Voltar",
	"Skip": "Pular",
	"Add": "Adicionar",
	"Subtract": "Remover",
	"Add All": "Adicionar Todos",
	"Filter": "Filtrar",
	"Filters": "Filtros",
	"Filter...": "Filtrar...",
	"Search...": "Buscar...",
	"Search everywhere...": "Buscar no site...",
	"Loading...": "Carregando...",
	"Info": "Informações",
	"Mechanics": "Mecânicas",
	"Images": "Imagens",
	"Image": "Imagem",
	"Fluff": "Descrição",
	"Lore": "História",
	"Statblock": "Ficha",
	"Fonts": "Fontes Tipográficas",
	"Font:": "Fonte:",
	"Downloads": "Downloads",
	"Intercession": "Intercessão",
	"Activity": "Atividade",
	"Skill": "Perícia",
	"Skills": "Perícias",
	"General": "Geral",
	"Ancestry & Heritage": "Ancestralidade e Herança",
	"Subclass": "Subclasse",
	"Untrained": "Destreinado",
	"Trained": "Treinado",
	"Expert": "Especialista",
	"Master": "Mestre",
	"Legendary": "Lendário",
	"Ability Boosts": "Melhorias de Atributo",
	"Ability Flaw": "Defeito de Atributo",
	"Hit Points": "Pontos de Vida",
	"Speed": "Velocidade",
	"Speed Types": "Tipos de Velocidade",
	"Speeds": "Velocidades",
	"Miscellaneous": "Diversos",
	"Other Options": "Outras Opções",
	"Benefits": "Benefícios",
	"Dedication Level": "Nível de Dedicação",
	"Skill Proficiencies": "Proficiências em Perícias",
	"Lore Proficiencies": "Proficiências em Saber",
	"Perception": "Percepção",
	"Precise Senses": "Sentidos Precisos",
	"Imprecise Senses": "Sentidos Imprecisos",
	"Vague Senses": "Sentidos Vagos",
	"Other Senses": "Outros Sentidos",
	"Perception and Senses": "Percepção e Sentidos",
	"Senses": "Sentidos",
	"Strength": "Força",
	"Dexterity": "Destreza",
	"Constitution": "Constituição",
	"Intelligence": "Inteligência",
	"Wisdom": "Sabedoria",
	"Charisma": "Carisma",
	"Ability Modifiers": "Modificadores de Atributo",
	"Armor Class": "Classe de Armadura",
	"Fortitude": "Fortitude",
	"Reflex": "Reflexos",
	"Will": "Vontade",
	"Immunities": "Imunidades",
	"Weaknesses": "Fraquezas",
	"Resistances": "Resistências",
	"Defenses": "Defesas",
	"Spellcasting Type": "Tipo de Conjuração",
	"Spell DC": "CD de Magia",
	"Highest Spell Level": "Nível Máximo de Magia",
	"Ritual Traditions": "Tradições de Ritual",
	"Spellcasting": "Conjuração",
	"Found In": "Encontrado em",
	"Additional Skills": "Perícias Adicionais",
	"Initial Proficiencies": "Proficiências Iniciais",
	"Required Number of Abilities": "Quantidade de Habilidades Necessárias",
	"Granted Abilities": "Habilidades Concedidas",
	"Tradition": "Tradição",
	"Divine Font": "Fonte Divina",
	"Divine Ability": "Atributo Divino",
	"Divine Sanctification": "Santificação Divina",
	"Divine Skill": "Perícia Divina",
	"Favored Weapon": "Arma Favorita",
	"Cleric Spells by Level": "Magias de Clérigo por Nível",
	"Devotee Benefits": "Benefícios de Devoto",
	"Applicable Skills": "Perícias Aplicáveis",
	"Stealth DC": "CD de Furtividade",
	"Minimum Proficiency": "Proficiência Mínima",
	"Stealth": "Furtividade",
	"Hardness": "Dureza",
	"Saving Throws": "Salvamentos",
	"Saving Throw": "Salvamento",
	"Damage": "Dano",
	"Damage Type": "Tipo de Dano",
	"Hands": "Mãos",
	"Weapon Damage": "Dano da Arma",
	"Group": "Grupo",
	"Weapon Range": "Alcance da Arma",
	"AC Bonus": "Bônus de CA",
	"HP": "PV",
	"BT": "LQ",
	"Shield Stats": "Estatísticas de Escudo",
	"Ammunition": "Munição",
	"Applies to...": "Aplica-se a...",
	"Feature Type": "Tipo de Característica",
	"Item Type": "Tipo de Item",
	"Secondary Casters": "Conjuradores Secundários",
	"Primary Checks": "Testes Primários",
	"Primary Check": "Teste Primário",
	"Secondary Checks": "Testes Secundários",
	"Checks": "Testes",
	"Range": "Alcance",
	"Duration": "Duração",
	"Tradition & Spell List": "Tradição e Lista de Magias",
	"Spell Type": "Tipo de Magia",
	"Focus Spells": "Magias de Foco",
	"Components": "Componentes",
	"Area Type": "Tipo de Área",
	"School": "Escola",
	"Rule Category": "Categoria de Regra",
	"Long": "Comprimento",
	"Wide": "Largura",
	"High": "Altura",
	"Space": "Espaço",
	"Crew Size": "Tamanho da Tripulação",
	"Members": "Membros",
	"Crew": "Tripulação",
	"Passengers": "Passageiros",
	"Reprinted": "Republicado",
	"Variant": "Variante",
	"Optional": "Opcional",
	"Subsystem": "Subsistema",
	"Adventure": "Aventura",
	"Has Trigger": "Possui Gatilho",
	"Has Frequency": "Possui Frequência",
	"Has Prerequisites": "Possui Pré-requisitos",
	"Has Requirements": "Possui Requerimentos",
	"Has Cost": "Possui Custo",
	"Has Special": "Possui Especial",
	"Leads to...": "Leva a...",
	"Has Images": "Possui Imagens",
	"Has Info": "Possui Informações",
	"Has Lore": "Possui História",
	"Common": "Comum",
	"Uncommon": "Incomum",
	"Rare": "Raro",
	"Unique": "Único",
	"Trivial": "Trivial",
	"Low": "Baixa",
	"Moderate": "Moderada",
	"Severe": "Severa",
	"Extreme": "Extrema",
	"Cost": "Custo",
	"Frequency": "Frequência",
	"Requirements": "Requerimentos",
	"Special": "Especial",
	"Onset": "Latência",
	"Maximum Duration": "Duração Máxima",
	"KEY ABILITY": "ATRIBUTO CHAVE",
	"Homebrew": "Conteúdo Próprio",
	"Research": "Pesquisa",
	"Copy Code": "Copiar Código",
	"Word Wrap": "Quebra de Linha",
	"Footnote": "Nota de Rodapé",
	"Homebrew Modifications": "Modificações de Conteúdo Próprio",
	"Overcome": "Superar",
	"Usage": "Uso",
	"Tempted Curse": "Maldição Tentadora",
	"Access": "Acesso",
	"Support Benefit": "Benefício de Suporte",
	"Advanced Maneuver": "Manobra Avançada",
	"Home Plane": "Plano Natal",
	"Suggested Attacks": "Ataques Sugeridos",
	"Eidolon Abilities": "Habilidades de Eidolon",
	"Initiative": "Iniciativa",
	"Str": "For",
	"Dex": "Des",
	"Con": "Con",
	"Int": "Int",
	"Wis": "Sab",
	"Cha": "Car",
	"AC": "CA",
	"Thresholds": "Limiares",
	"Constant": "Constante",
	"Weak": "Fraco",
	"Elite": "Elite",
	"Pantheon Members": "Membros do Panteão",
	"Covenant Members": "Membros do Pacto",
	"Areas of Concern": "Áreas de Interesse",
	"Cleric Spells": "Magias de Clérigo",
	"Religious Symbol": "Símbolo Religioso",
	"Ranged": "À Distância",
	"Melee": "Corpo a Corpo",
	"Description": "Descrição",
	"Disable": "Desabilitar",
	"Routine": "Rotina",
	"Craft Requirements": "Requerimentos de Fabricação",
	"Destruction": "Destruição",
	"Tea Ceremony": "Cerimônia do Chá",
	"Devil": "Diabo",
	"Activate": "Ativação",
	"Communication": "Comunicação",
	"Fort Save": "Salvamento de Fortitude",
	"Fort": "Fort",
	"Ref Save": "Salvamento de Reflexos",
	"Ref": "Ref",
	"Will Save": "Salvamento de Vontade",
	"Dex Cap": "Limite de Des",
	"Speed Penalty": "Penalidade de Velocidade",
	"Proficiency": "Proficiência",
	"Check Penalty": "Penalidade em Testes",
	"Reload": "Recarga",
	"Typical Speakers": "Falantes Típicos",
	"Regions": "Regiões",
	"Government": "Governo",
	"Capital": "Capital",
	"Population": "População",
	"Religions": "Religiões",
	"Primary Exports": "Principais Exportações",
	"Primary Imports": "Principais Importações",
	"Enemies": "Inimigos",
	"Factions": "Facções",
	"Threats": "Ameaças",
	"Scope and Influence": "Abrangência e Influência",
	"Goals": "Objetivos",
	"Headquarters": "Sede",
	"Key Members": "Membros Importantes",
	"Allies": "Aliados",
	"Assets": "Recursos",
	"Membership Requirements": "Requerimentos de Admissão",
	"Accepted Alignments": "Tendências Aceitas",
	"Values": "Valores",
	"Anathema": "Anátema",
	"Divinities": "Divindades",
	"Native Inhabitants": "Habitantes Nativos",
	"Key Anchor": "Âncora Principal",
	"Entry": "Entrada",
	"Cast": "Conjuração",
	"Area": "Área",
	"Targets": "Alvos",
	"Prohibited": "Proibido",
	"Traditions": "Tradições",
	"Amp": "Amplificação",
	"Piloting Check": "Teste de Pilotagem",
	"Collision": "Colisão",
	"Dynamic Viewer": "Visualizador Dinâmico",
	"Go to Page": "Ir para a Página",
	"Open as Popup Window": "Abrir em Janela Separada",
	"Show Source Data": "Mostrar Dados de Origem",
	"Toggle short/long text": "Alternar Texto Curto/Completo",
	"Previous": "Anterior",
	"Next": "Próxima",
	"Collapse All": "Recolher Tudo",
	"Expand All": "Expandir Tudo",
	"Back to Top": "Voltar ao Topo",
	"Find": "Localizar",
	"Expand": "Expandir",
	"Collapse": "Recolher",
	"Print View": "Visualização de Impressão",
	"Printer View": "Visualização de Impressão",
	"Table View": "Visualização em Tabela",
	"Book View": "Visualização de Livro",
	"View Entire Document": "Ver Documento Completo",
	"Deep Backgrounds": "Biografias Detalhadas",
	"Create a Deep Background": "Criar Biografia Detalhada",
	"Buy Equipment": "Comprar Equipamento",
	"Change Base Item": "Alterar Item Base",
	"Rune Builder": "Construtor de Runas",
	"Save & Exit": "Salvar e Sair",
	"Cancel & Exit": "Cancelar e Sair",
	"Encounter Builder": "Construtor de Encontros",
	"Proficiency without Level": "Proficiência sem Nível",
	"Group Info": "Informações do Grupo",
	"Players:": "Jogadores:",
	"Level:": "Nível:",
	"Advanced Mode": "Modo Avançado",
	"Save to URL": "Salvar no Link",
	"Save to File": "Salvar em Arquivo",
	"Load from File": "Carregar de Arquivo",
	"Copy as Text": "Copiar como Texto",
	"Add Column": "Adicionar Coluna",
	"Combine as": "Combinar como",
	"Always Save on Close": "Sempre Salvar ao Fechar",
	"Filter Combination Logic": "Lógica de Combinação dos Filtros",
	"Unsaved Changes": "Alterações Não Salvas",
	"Select by Date": "Selecionar por Data",
	"Show as Dropdowns": "Mostrar como Menus",
	"Show Filter": "Mostrar Filtros",
	"Toggle Filter Summary": "Alternar Resumo dos Filtros",
	"Show Feats": "Mostrar Talentos",
	"Class Features": "Características de Classe",
	"Select All": "Selecionar Tudo",
	"Select Official": "Selecionar Oficiais",
	"Standard Heritages Only": "Apenas Heranças Padrão",
	"Versatile Heritages Only": "Apenas Heranças Versáteis",
	"Download CSV": "Baixar CSV",
	"Copy CSV to Clipboard": "Copiar CSV para a Área de Transferência",
	"Pin (Toggle)": "Fixar/Desafixar",
	"To Top": "Voltar ao Topo",
	"Include unofficial": "Incluir Não Oficiais",
	"Include Blacklisted": "Incluir Conteúdo Bloqueado",
	"Collapse All Results": "Recolher Todos os Resultados",
	"Expand All Results": "Expandir Todos os Resultados",
	"Toggle Preview": "Alternar Prévia",
	"Spell Level": "Nível de Magia",
	"Alphabetical": "Alfabética",
	"Sort order:": "Ordenar por:",
	"No results found.": "Nenhum resultado encontrado.",
	"No results.": "Nenhum resultado.",
	"Enter a search.": "Digite uma busca.",
	"No updates recorded yet.": "Nenhuma alteração registrada.",
	"Are You Sure?": "Tem certeza?",
	"Hotkey: f": "Atalho: F",
	"Feeling Lucky?": "Estou com sorte",
	"Copied link!": "Link copiado!",
	"Day Mode": "Modo Claro",
	"Night Mode": "Modo Escuro",
	"Disable Wide Mode": "Desativar Modo Amplo",
	"Enable Wide Mode (Experimental)": "Ativar Modo Amplo (Experimental)",
	"Save State to File": "Salvar Dados em Arquivo",
	"Load State from File": "Carregar Dados de Arquivo",
	"Add as App": "Instalar Aplicativo",
	"Clear Offline Cache": "Limpar Cache Offline",
	"Remove Column": "Remover Coluna",
	"Remove Player": "Remover Jogador",
	"Remove Player Group": "Remover Grupo de Jogadores",
	"Randomize Creature": "Sortear Criatura",
	"Save Encounter": "Salvar Encontro",
	"Enter Encounter Name": "Digite o Nome do Encontro",
	"Reload Current Encounter": "Recarregar Encontro Atual",
	"Load Encounter": "Carregar Encontro",
	"Saved Encounters": "Encontros Salvos",
	"No saved encounters": "Nenhum encontro salvo",
	"Save Item": "Salvar Item",
	"Reload Current Item": "Recarregar Item Atual",
	"Saved Items": "Itens Salvos",
	"No saved items": "Nenhum item salvo",
	"Select Currency Conversion Table": "Selecionar Tabela de Conversão de Moedas",
	"Select Display Mode": "Selecionar Modo de Exibição",
	"Popout Window (SHIFT for Source Data)": "Abrir em Janela Separada (SHIFT para Dados de Origem)",
	"Dice Roller": "Rolador de Dados",
	"Copy to input": "Copiar para o Campo",
	"Zoom Out": "Diminuir Zoom",
	"Zoom In": "Aumentar Zoom",
	"Reset Zoom": "Redefinir Zoom",
	"or": "ou",
	"where": "onde",
	"and the latest": "e a versão mais recente do",
	"Title": "Título",
	"Abbreviation": "Abreviação",
	"Source URL": "URL da Fonte",
	"Author(s)": "Autor(es)",
	"Converted By": "Convertido por",
	"JSON Identifier": "Identificador JSON",
	"Select a Homebrew Source": "Selecionar Fonte de Conteúdo Próprio",
	"Use an Existing Source": "Usar Fonte Existente",
	"File Type Mismatch": "Tipo de Arquivo Incompatível",
	"Two (book style)": "Duas (estilo de livro)",
	"One": "Uma",
	"Print columns:": "Colunas de Impressão:",
	"Applied when printing the page.": "Aplicado ao imprimir a página.",
	"Browse your campaigns and session notes": "Consulte suas campanhas e anotações de sessão",
	"Find campaign...": "Buscar campanha...",
	"Browse content. Press F to find, and G to go to page.": "Consulte o conteúdo. Pressione F para localizar ou G para ir a uma página.",
	"See what changed.": "Veja o que mudou.",
	"A search engine to add to your browser.": "Uma ferramenta de busca para adicionar ao seu navegador.",
	"Your campaigns": "Suas campanhas",
	"Open": "Abra",
	"Rules at the table": "Regras à mesa",
	"while hovering over a reference to keep its window open.": "ao passar o cursor sobre uma referência para manter a janela aberta.",
	"Based on": "Baseado em",
	"Source license": "Licença do Código-fonte",
	". Not affiliated with or endorsed by Paizo Inc.": ". Sem afiliação ou endosso da Paizo Inc.",
	"Pf2eTools is not affiliated with or endorsed by Paizo Inc.": "Pf2eTools não possui afiliação ou endosso da Paizo Inc.",
	"A searchable selection of commonly used rules and tables.": "Consulte e busque regras e tabelas usadas com frequência.",
	"Browse your campaigns and read the notes for each session.": "Consulte suas campanhas e leia as anotações de cada sessão.",
	"Set filters to buy equipment during character creation": "Ajustar filtros para comprar equipamento durante a criação de personagem",
	"Change the item you are adding Runes to": "Alterar o item que receberá as runas",
	"Add Runes to basic Items": "Adicionar runas a itens básicos",
	"Save as new Item and exit Runebuilder": "Salvar como novo item e sair do construtor de runas",
	"Discard changes and exit Runebuilder": "Descartar alterações e sair do construtor de runas",
	"Reset filters. SHIFT to reset everything.": "Redefinir filtros. Segure SHIFT para redefinir tudo.",
	"View this feat on the Feats page": "Ver este talento na página de Talentos",
	"Toggle Ancestry Features": "Alternar Características de Ancestralidade",
	"Toggle Feat View": "Alternar Visualização de Talentos",
	"Show Heritage Sources": "Mostrar Fontes das Heranças",
	"Adjust your filters to see more.": "Ajuste os filtros para ver mais opções.",
	"Toggle a button to view ancestry and heritage information.": "Ative um botão para ver informações de ancestralidade e herança.",
	"Select Heritages to display them here.": "Selecione heranças para exibi-las aqui.",
	"Hide Archetypes Search Bar and Entry List": "Ocultar Barra de Busca e Lista de Arquétipos",
	"Toggle Class Features": "Alternar Características de Classe",
	"Toggle Class Info": "Alternar Informações de Classe",
	"Select All; Ctrl to Deselect All": "Selecionar Tudo; CTRL para Desmarcar Tudo",
	"Show Subclass Sources": "Mostrar Fontes das Subclasses",
	"Toggle a button to view class information": "Ative um botão para ver informações de classe",
	"Select a section to begin": "Selecione uma seção para começar",
	"Select a campaign and session from the list on the left.": "Selecione uma campanha e uma sessão na lista à esquerda.",
	"This feature is unsupported. Expect bugs.": "Este recurso é experimental e pode apresentar erros.",
	"Add the site to your home screen.": "Adicione o site à sua tela inicial.",
	"Clear cached site files and images.": "Limpe os arquivos e imagens do site armazenados em cache.",
	"Disclaimer: unlikely to search everywhere. Use with caution.": "A busca pode não abranger todo o conteúdo do site.",
	"Include unofficial source results": "Incluir resultados de fontes não oficiais",
	"Include blacklisted content results": "Incluir resultados de conteúdo bloqueado",
	"Filter unofficial source results": "Filtrar resultados de fontes não oficiais",
	"Filter blacklisted content results": "Filtrar resultados de conteúdo bloqueado",
	"Hide Search Bar and Entry List": "Ocultar Barra de Busca e Lista de Entradas",
	"Scale Creature By Level (Highly Experimental)": "Ajustar Criatura por Nível (Experimental)",
	"Reset Level Scaling": "Redefinir Ajuste de Nível",
	"Toggle Narrow Reading Width": "Alternar Largura de Leitura Reduzida",
	"Warning: Slow": "Aviso: pode ser lento",
	"Add runes to this item by clicking the buttons on the left.": "Adicione runas a este item usando os botões à esquerda.",
	"New Encounter (SHIFT-click to reset players)": "Novo Encontro (SHIFT + clique para redefinir jogadores)",
	"Add (SHIFT for 5)": "Adicionar (SHIFT para 5)",
	"Subtract (SHIFT for 5)": "Remover (SHIFT para 5)",
	"Get link to filters (SHIFT adds list; CTRL copies @filter tag)": "Obter link dos filtros (SHIFT inclui a lista; CTRL copia a etiqueta @filter)",
	"Get Link to Filters": "Obter Link dos Filtros",
	"Shift/Ctrl to open in a new window/tab.": "SHIFT/CTRL para abrir em nova janela/aba.",
	"Images available on the Archives of Nethys.": "Imagens disponíveis no Archives of Nethys.",
	"Images available on the Demiplane.": "Imagens disponíveis no Demiplane.",
	"This trait is used in the following statblocks.": "Este traço é usado nas seguintes fichas.",
	"UPDATE YOUR BROWSER": "ATUALIZE SEU NAVEGADOR",
	"It looks like you're using an outdated/unsupported browser.": "Seu navegador parece estar desatualizado ou não é compatível.",
	"Left-click to open an area as a new window.": "Clique com o botão esquerdo para abrir uma área em outra janela.",
	"-left-click to jump to an area.": " + clique esquerdo para ir a uma área.",
	"Right-click and drag to pan.": "Clique com o botão direito e arraste para mover.",
	"-scroll to zoom.": " + rolagem para ajustar o zoom.",
	"Select a entry from the list to view it here": "Selecione uma entrada na lista para exibir aqui",
	"Select an entry from the list to view it here": "Selecione uma entrada na lista para exibir aqui",
	"Select a background from the list to view it here": "Selecione uma biografia na lista para exibir aqui",
	"Select an background from the list to view it here": "Selecione uma biografia na lista para exibir aqui",
	"Select a deity from the list to view it here": "Selecione uma divindade na lista para exibir aqui",
	"Select an deity from the list to view it here": "Selecione uma divindade na lista para exibir aqui",
	"Select a hazard from the list to view it here": "Selecione um perigo na lista para exibir aqui",
	"Select an hazard from the list to view it here": "Selecione um perigo na lista para exibir aqui",
	"Select a language from the list to view it here": "Selecione um idioma na lista para exibir aqui",
	"Select an language from the list to view it here": "Selecione um idioma na lista para exibir aqui",
	"Select a organization from the list to view it here": "Selecione uma organização na lista para exibir aqui",
	"Select an organization from the list to view it here": "Selecione uma organização na lista para exibir aqui",
	"Select a spell from the list to view it here": "Selecione uma magia na lista para exibir aqui",
	"Select an spell from the list to view it here": "Selecione uma magia na lista para exibir aqui",
	"Select a table from the list to view it here": "Selecione uma tabela na lista para exibir aqui",
	"Select an table from the list to view it here": "Selecione uma tabela na lista para exibir aqui",
	"Select a trait from the list to view it here": "Selecione um traço na lista para exibir aqui",
	"Select an trait from the list to view it here": "Selecione um traço na lista para exibir aqui",
	"Select a rule from the list to view it here": "Selecione uma regra na lista para exibir aqui",
	"Select an rule from the list to view it here": "Selecione uma regra na lista para exibir aqui",
	"Select a feat from the list to view it here": "Selecione um talento na lista para exibir aqui",
	"Select an feat from the list to view it here": "Selecione um talento na lista para exibir aqui",
	"Select a archetype from the list to view it here": "Selecione um arquétipo na lista para exibir aqui",
	"Select an archetype from the list to view it here": "Selecione um arquétipo na lista para exibir aqui",
	"Select a gift from the list on the left to view it here": "Selecione um dom na lista à esquerda para exibir aqui",
	"Random Trivial": "Sortear Trivial",
	"Adjust to Trivial": "Ajustar para Trivial",
	"Trivial:": "Trivial:",
	"Trivial: ? XP": "Trivial: ? XP",
	"Randomly generate a Trivial-threat encounter": "Gerar encontro aleatório de ameaça trivial",
	"Random Low": "Sortear Baixa",
	"Adjust to Low": "Ajustar para Baixa",
	"Low:": "Baixa:",
	"Low: ? XP": "Baixa: ? XP",
	"Randomly generate a Low-threat encounter": "Gerar encontro aleatório de ameaça baixa",
	"Random Moderate": "Sortear Moderada",
	"Adjust to Moderate": "Ajustar para Moderada",
	"Moderate:": "Moderada:",
	"Moderate: ? XP": "Moderada: ? XP",
	"Randomly generate a Moderate-threat encounter": "Gerar encontro aleatório de ameaça moderada",
	"Random Severe": "Sortear Severa",
	"Adjust to Severe": "Ajustar para Severa",
	"Severe:": "Severa:",
	"Severe: ? XP": "Severa: ? XP",
	"Randomly generate a Severe-threat encounter": "Gerar encontro aleatório de ameaça severa",
	"Random Extreme": "Sortear Extrema",
	"Adjust to Extreme": "Ajustar para Extrema",
	"Extreme:": "Extrema:",
	"Extreme: ? XP": "Extrema: ? XP",
	"Randomly generate a Extreme-threat encounter": "Gerar encontro aleatório de ameaça extrema",
	"WARNING: Encounter includes over-leveled creatures.": "AVISO: o encontro inclui criaturas de nível elevado.",
	"Difficulty: ?": "Dificuldade: ?",
	"Encounter XP: ?": "XP do Encontro: ?",
	"The following search syntax is available:": "Você pode usar a seguinte sintaxe de busca:",
	"Invalid input! Try &quot;/help&quot;": "Entrada inválida! Tente &quot;/help&quot;",
	"Fireball: 6d6": "Bola de Fogo: 6d6",
	"Activatable": "Ativável",
	"Alters Relic": "Altera Relíquia",
	"Any": "Qualquer",
	"Armor": "Armadura",
	"Basic": "Básico",
	"Can be Dismissed": "Pode ser Dispensada",
	"Can be Heightened": "Pode ser Elevada",
	"Cantrip": "Truque Mágico",
	"Cantrips": "Truques Mágicos",
	"Core": "Básico",
	"Display Class if Any Subclass is Visible": "Exibir Classe se Alguma Subclasse Estiver Visível",
	"Display Standard Heritages": "Exibir Heranças Padrão",
	"Display Versatile Heritages": "Exibir Heranças Versáteis",
	"Equipment": "Equipamento",
	"Focus": "Foco",
	"Free": "Livre",
	"Generic": "Genérico",
	"Generic Variant": "Variante Genérica",
	"Grants Ability": "Concede Habilidade",
	"Grants Equipment": "Concede Equipamento",
	"Grants Passive Attribute": "Concede Atributo Passivo",
	"Grants Sense": "Concede Sentido",
	"Grants Situational Benefit": "Concede Benefício Situacional",
	"Grants Temporary Hit Points": "Concede Pontos de Vida Temporários",
	"Has Battle Form": "Possui Forma de Batalha",
	"Has Divine Intercession": "Possui Intercessão Divina",
	"Has Drawback": "Possui Desvantagem",
	"Has Fonts": "Possui Fontes Tipográficas",
	"Has Routine": "Possui Rotina",
	"Has Table Number": "Possui Número de Tabela",
	"Has Targets": "Possui Alvos",
	"Has a Cost": "Possui Custo",
	"Heritage": "Herança",
	"Instant": "Instantânea",
	"Is Resettable": "Pode ser Rearmado",
	"Is Rollable": "Permite Rolagem",
	"Is Rune": "É Runa",
	"Must be a Creature": "Deve Ser uma Criatura",
	"NPC": "PDM",
	"Optional/Variant Action": "Ação Opcional/Variante",
	"Planetary": "Planetário",
	"Possible Elementalist Spells": "Magias Possíveis de Elementalista",
	"Regional": "Regional",
	"Somatic": "Somático",
	"Soul Seed Gift": "Dom de Semente da Alma",
	"Specific Variant": "Variante Específica",
	"Std.Her.": "Her. Padrão",
	"Summoning": "Invocação",
	"Sustained": "Sustentada",
	"THP": "PVT",
	"Touch": "Toque",
	"Unarmed Attack": "Ataque Desarmado",
	"Unlimited": "Ilimitado",
	"V.Her.": "Her. Versátil",
	"Varies": "Varia",
	"Verbal": "Verbal",
	"Enter a Number": "Digite um Número",
	"Choose": "Escolha",
	"Select an Option": "Selecione uma Opção",
	"Enter Text": "Digite um Texto",
	"Choose Color": "Escolha uma Cor",
	"Select Direction": "Selecione uma Direção",
	"Enter Dice": "Digite uma Rolagem",
	"Version": "Versão",
	"class feat": "talento de classe",
	"general feat": "talento geral",
	"skill feat": "talento de perícia",
	"ancestry feat": "talento de ancestralidade",
	"skill increase": "incremento de perícia",
	"ability boosts": "melhorias de atributo",
	"Your": "Seu",
	"Choose a Language": "Escolha um Idioma",
	"Trained in": "Treinado em",
	"Attacks": "Ataques",
	"Class DC": "CD de Classe",
	"Weapon": "Arma",
	"GM Influence": "Influência do Mestre",
	"Hide Feats": "Ocultar Talentos",
	"Select Class": "Selecionar Classe",
	"Select Ancestry": "Selecionar Ancestralidade",
	"Versatile Heritages": "Heranças Versáteis",
	"Standard Heritages": "Heranças Padrão",
	"Edition": "Edição",
	"Color": "Cor",
	"Random": "Aleatório",
	"HOME": "INÍCIO",
	"RULES": "REGRAS",
	"PLAYER": "JOGADOR",
	"PLAYERS": "JOGADORES",
	"GAME MASTER": "MESTRE",
	"GAME MASTERS": "MESTRES",
	"REFERENCES": "REFERÊNCIAS",
	"UTILITIES": "UTILITÁRIOS",
	"SETTINGS": "CONFIGURAÇÕES",
	"HELP": "AJUDA",
	"SEARCH": "BUSCA",
	"ANCESTRIES": "ANCESTRALIDADES",
	"ANCESTRY": "ANCESTRALIDADE",
	"BACKGROUNDS": "BIOGRAFIAS",
	"BACKGROUND": "BIOGRAFIA",
	"CLASSES": "CLASSES",
	"CLASS": "CLASSE",
	"FEATS": "TALENTOS",
	"FEAT": "TALENTO",
	"ARCHETYPES": "ARQUÉTIPOS",
	"ARCHETYPE": "ARQUÉTIPO",
	"FAMILIAR ABILITIES": "HABILIDADES DE FAMILIAR",
	"FAMILIAR ABILITY": "HABILIDADE DE FAMILIAR",
	"OPTIONAL FEATURES": "CARACTERÍSTICAS OPCIONAIS",
	"FEATURE": "CARACTERÍSTICA",
	"FEATURES": "CARACTERÍSTICAS",
	"CAMPAIGNS": "CAMPANHAS",
	"CAMPAIGN": "CAMPANHA",
	"CAMPAIGN SESSIONS": "SESSÕES DA CAMPANHA",
	"VIEW ALL CAMPAIGNS": "VER TODAS AS CAMPANHAS",
	"UNDATED": "SEM DATA",
	"EVENTS": "EVENTOS",
	"EVENT": "EVENTO",
	"HAZARDS": "PERIGOS",
	"HAZARD": "PERIGO",
	"RELIC GIFTS": "DONS DE RELÍQUIA",
	"RELIC GIFT": "DOM DE RELÍQUIA",
	"ACTIONS": "AÇÕES",
	"ACTION": "AÇÃO",
	"BESTIARY": "BESTIÁRIO",
	"CREATURE": "CRIATURA",
	"CONDITIONS": "CONDIÇÕES",
	"CONDITION": "CONDIÇÃO",
	"ITEMS": "ITENS",
	"ITEM": "ITEM",
	"SPELLS": "MAGIAS",
	"SPELL": "MAGIA",
	"AFFLICTIONS": "AFLIÇÕES",
	"AFFLICTION": "AFLIÇÃO",
	"RITUALS": "RITUAIS",
	"RITUAL": "RITUAL",
	"VEHICLES": "VEÍCULOS",
	"VEHICLE": "VEÍCULO",
	"DEITIES": "DIVINDADES",
	"DEITY": "DIVINDADE",
	"LANGUAGES": "IDIOMAS",
	"LANGUAGE": "IDIOMA",
	"ORGANIZATIONS": "ORGANIZAÇÕES",
	"ORGANIZATION": "ORGANIZAÇÃO",
	"CREATURE ABILITIES": "HABILIDADES DE CRIATURA",
	"ABILITIES": "HABILIDADES",
	"ABILITY": "HABILIDADE",
	"TRAITS": "TRAÇOS",
	"TRAIT": "TRAÇO",
	"QUICK REFERENCE": "REFERÊNCIA RÁPIDA",
	"RULES GLOSSARY": "GLOSSÁRIO DE REGRAS",
	"CHANGELOG": "HISTÓRICO DE ALTERAÇÕES",
	"TABLES": "TABELAS",
	"TABLE": "TABELA",
	"NAME": "NOME",
	"SOURCE": "FONTE",
	"SOURCES": "FONTES",
	"TIME": "TEMPO",
	"TYPE": "TIPO",
	"CATEGORY": "CATEGORIA",
	"CATEGORIES": "CATEGORIAS",
	"SUBCATEGORY": "SUBCATEGORIA",
	"LEVEL": "NÍVEL",
	"RARITY": "RARIDADE",
	"PREREQUISITES": "PRÉ-REQUISITOS",
	"PREREQUISITE": "PRÉ-REQUISITO",
	"SETTING": "CENÁRIO",
	"SESSIONS": "SESSÕES",
	"STARTED": "INÍCIO",
	"ALIGNMENT": "TENDÊNCIA",
	"FOLLOWER ALIGNMENT": "TENDÊNCIA DOS DEVOTOS",
	"ACCEPTED ALIGNMENT": "TENDÊNCIA ACEITA",
	"SIZE": "TAMANHO",
	"DOMAINS": "DOMÍNIOS",
	"DOMAIN": "DOMÍNIO",
	"PANTHEON": "PANTEÃO",
	"ASPECTS": "ASPECTOS",
	"ASPECT": "ASPECTO",
	"TIER": "GRAU",
	"CAST TIME": "TEMPO DE CONJURAÇÃO",
	"PRICE": "PREÇO",
	"BULK": "VOLUME",
	"NUMBER": "QUANTIDADE",
	"RESET": "REDEFINIR",
	"RESET SELECTION": "REDEFINIR SELEÇÃO",
	"RESET ALL": "REDEFINIR TUDO",
	"SHOW ALL": "MOSTRAR TUDO",
	"HIDE ALL": "OCULTAR TUDO",
	"ALL": "TODOS",
	"CLEAR": "LIMPAR",
	"NONE": "NENHUM",
	"DEFAULT": "PADRÃO",
	"HIDE": "OCULTAR",
	"SHOW": "MOSTRAR",
	"SAVE": "SALVAR",
	"CANCEL": "CANCELAR",
	"CLOSE": "FECHAR",
	"CONFIRM": "CONFIRMAR",
	"LOAD": "CARREGAR",
	"SELECT": "SELECIONAR",
	"BACK": "VOLTAR",
	"SKIP": "PULAR",
	"ADD": "ADICIONAR",
	"SUBTRACT": "REMOVER",
	"ADD ALL": "ADICIONAR TODOS",
	"FILTER": "FILTRAR",
	"FILTERS": "FILTROS",
	"INFO": "INFORMAÇÕES",
	"MECHANICS": "MECÂNICAS",
	"IMAGES": "IMAGENS",
	"IMAGE": "IMAGEM",
	"FLUFF": "DESCRIÇÃO",
	"LORE": "HISTÓRIA",
	"STATBLOCK": "FICHA",
	"FONTS": "FONTES TIPOGRÁFICAS",
	"DOWNLOADS": "DOWNLOADS",
	"INTERCESSION": "INTERCESSÃO",
	"ACTIVITY": "ATIVIDADE",
	"SKILL": "PERÍCIA",
	"SKILLS": "PERÍCIAS",
	"GENERAL": "GERAL",
	"SUBCLASS": "SUBCLASSE",
	"UNTRAINED": "DESTREINADO",
	"TRAINED": "TREINADO",
	"EXPERT": "ESPECIALISTA",
	"MASTER": "MESTRE",
	"LEGENDARY": "LENDÁRIO",
	"ABILITY BOOSTS": "MELHORIAS DE ATRIBUTO",
	"ABILITY FLAW": "DEFEITO DE ATRIBUTO",
	"HIT POINTS": "PONTOS DE VIDA",
	"SPEED": "VELOCIDADE",
	"SPEED TYPES": "TIPOS DE VELOCIDADE",
	"SPEEDS": "VELOCIDADES",
	"MISCELLANEOUS": "DIVERSOS",
	"OTHER OPTIONS": "OUTRAS OPÇÕES",
	"BENEFITS": "BENEFÍCIOS",
	"DEDICATION LEVEL": "NÍVEL DE DEDICAÇÃO",
	"SKILL PROFICIENCIES": "PROFICIÊNCIAS EM PERÍCIAS",
	"LORE PROFICIENCIES": "PROFICIÊNCIAS EM SABER",
	"PERCEPTION": "PERCEPÇÃO",
	"PRECISE SENSES": "SENTIDOS PRECISOS",
	"IMPRECISE SENSES": "SENTIDOS IMPRECISOS",
	"VAGUE SENSES": "SENTIDOS VAGOS",
	"OTHER SENSES": "OUTROS SENTIDOS",
	"PERCEPTION AND SENSES": "PERCEPÇÃO E SENTIDOS",
	"SENSES": "SENTIDOS",
	"STRENGTH": "FORÇA",
	"DEXTERITY": "DESTREZA",
	"CONSTITUTION": "CONSTITUIÇÃO",
	"INTELLIGENCE": "INTELIGÊNCIA",
	"WISDOM": "SABEDORIA",
	"CHARISMA": "CARISMA",
	"ABILITY MODIFIERS": "MODIFICADORES DE ATRIBUTO",
	"ARMOR CLASS": "CLASSE DE ARMADURA",
	"FORTITUDE": "FORTITUDE",
	"REFLEX": "REFLEXOS",
	"WILL": "VONTADE",
	"IMMUNITIES": "IMUNIDADES",
	"WEAKNESSES": "FRAQUEZAS",
	"RESISTANCES": "RESISTÊNCIAS",
	"DEFENSES": "DEFESAS",
	"SPELLCASTING TYPE": "TIPO DE CONJURAÇÃO",
	"SPELL DC": "CD DE MAGIA",
	"HIGHEST SPELL LEVEL": "NÍVEL MÁXIMO DE MAGIA",
	"RITUAL TRADITIONS": "TRADIÇÕES DE RITUAL",
	"SPELLCASTING": "CONJURAÇÃO",
	"FOUND IN": "ENCONTRADO EM",
	"ADDITIONAL SKILLS": "PERÍCIAS ADICIONAIS",
	"INITIAL PROFICIENCIES": "PROFICIÊNCIAS INICIAIS",
	"REQUIRED NUMBER OF ABILITIES": "QUANTIDADE DE HABILIDADES NECESSÁRIAS",
	"GRANTED ABILITIES": "HABILIDADES CONCEDIDAS",
	"TRADITION": "TRADIÇÃO",
	"DIVINE FONT": "FONTE DIVINA",
	"DIVINE ABILITY": "ATRIBUTO DIVINO",
	"DIVINE SANCTIFICATION": "SANTIFICAÇÃO DIVINA",
	"DIVINE SKILL": "PERÍCIA DIVINA",
	"FAVORED WEAPON": "ARMA FAVORITA",
	"CLERIC SPELLS BY LEVEL": "MAGIAS DE CLÉRIGO POR NÍVEL",
	"DEVOTEE BENEFITS": "BENEFÍCIOS DE DEVOTO",
	"APPLICABLE SKILLS": "PERÍCIAS APLICÁVEIS",
	"STEALTH DC": "CD DE FURTIVIDADE",
	"MINIMUM PROFICIENCY": "PROFICIÊNCIA MÍNIMA",
	"STEALTH": "FURTIVIDADE",
	"HARDNESS": "DUREZA",
	"SAVING THROWS": "SALVAMENTOS",
	"SAVING THROW": "SALVAMENTO",
	"DAMAGE": "DANO",
	"DAMAGE TYPE": "TIPO DE DANO",
	"HANDS": "MÃOS",
	"WEAPON DAMAGE": "DANO DA ARMA",
	"GROUP": "GRUPO",
	"WEAPON RANGE": "ALCANCE DA ARMA",
	"AC BONUS": "BÔNUS DE CA",
	"SHIELD STATS": "ESTATÍSTICAS DE ESCUDO",
	"AMMUNITION": "MUNIÇÃO",
	"FEATURE TYPE": "TIPO DE CARACTERÍSTICA",
	"ITEM TYPE": "TIPO DE ITEM",
	"SECONDARY CASTERS": "CONJURADORES SECUNDÁRIOS",
	"PRIMARY CHECKS": "TESTES PRIMÁRIOS",
	"PRIMARY CHECK": "TESTE PRIMÁRIO",
	"SECONDARY CHECKS": "TESTES SECUNDÁRIOS",
	"CHECKS": "TESTES",
	"RANGE": "ALCANCE",
	"DURATION": "DURAÇÃO",
	"SPELL TYPE": "TIPO DE MAGIA",
	"FOCUS SPELLS": "MAGIAS DE FOCO",
	"COMPONENTS": "COMPONENTES",
	"AREA TYPE": "TIPO DE ÁREA",
	"SCHOOL": "ESCOLA",
	"RULE CATEGORY": "CATEGORIA DE REGRA",
	"LONG": "COMPRIMENTO",
	"WIDE": "LARGURA",
	"HIGH": "ALTURA",
	"SPACE": "ESPAÇO",
	"CREW SIZE": "TAMANHO DA TRIPULAÇÃO",
	"MEMBERS": "MEMBROS",
	"CREW": "TRIPULAÇÃO",
	"PASSENGERS": "PASSAGEIROS",
	"REPRINTED": "REPUBLICADO",
	"VARIANT": "VARIANTE",
	"OPTIONAL": "OPCIONAL",
	"SUBSYSTEM": "SUBSISTEMA",
	"ADVENTURE": "AVENTURA",
	"HAS TRIGGER": "POSSUI GATILHO",
	"HAS FREQUENCY": "POSSUI FREQUÊNCIA",
	"HAS PREREQUISITES": "POSSUI PRÉ-REQUISITOS",
	"HAS REQUIREMENTS": "POSSUI REQUERIMENTOS",
	"HAS COST": "POSSUI CUSTO",
	"HAS SPECIAL": "POSSUI ESPECIAL",
	"HAS IMAGES": "POSSUI IMAGENS",
	"HAS INFO": "POSSUI INFORMAÇÕES",
	"HAS LORE": "POSSUI HISTÓRIA",
	"COMMON": "COMUM",
	"UNCOMMON": "INCOMUM",
	"RARE": "RARO",
	"UNIQUE": "ÚNICO",
	"TRIVIAL": "TRIVIAL",
	"LOW": "BAIXA",
	"MODERATE": "MODERADA",
	"SEVERE": "SEVERA",
	"EXTREME": "EXTREMA",
	"COST": "CUSTO",
	"FREQUENCY": "FREQUÊNCIA",
	"REQUIREMENTS": "REQUERIMENTOS",
	"SPECIAL": "ESPECIAL",
	"ONSET": "LATÊNCIA",
	"MAXIMUM DURATION": "DURAÇÃO MÁXIMA",
	"HOMEBREW": "CONTEÚDO PRÓPRIO",
	"RESEARCH": "PESQUISA",
	"COPY CODE": "COPIAR CÓDIGO",
	"WORD WRAP": "QUEBRA DE LINHA",
	"FOOTNOTE": "NOTA DE RODAPÉ",
	"HOMEBREW MODIFICATIONS": "MODIFICAÇÕES DE CONTEÚDO PRÓPRIO",
	"OVERCOME": "SUPERAR",
	"USAGE": "USO",
	"TEMPTED CURSE": "MALDIÇÃO TENTADORA",
	"ACCESS": "ACESSO",
	"SUPPORT BENEFIT": "BENEFÍCIO DE SUPORTE",
	"ADVANCED MANEUVER": "MANOBRA AVANÇADA",
	"HOME PLANE": "PLANO NATAL",
	"SUGGESTED ATTACKS": "ATAQUES SUGERIDOS",
	"EIDOLON ABILITIES": "HABILIDADES DE EIDOLON",
	"INITIATIVE": "INICIATIVA",
	"STR": "FOR",
	"DEX": "DES",
	"CON": "CON",
	"INT": "INT",
	"WIS": "SAB",
	"CHA": "CAR",
	"THRESHOLDS": "LIMIARES",
	"CONSTANT": "CONSTANTE",
	"WEAK": "FRACO",
	"ELITE": "ELITE",
	"PANTHEON MEMBERS": "MEMBROS DO PANTEÃO",
	"COVENANT MEMBERS": "MEMBROS DO PACTO",
	"AREAS OF CONCERN": "ÁREAS DE INTERESSE",
	"CLERIC SPELLS": "MAGIAS DE CLÉRIGO",
	"RELIGIOUS SYMBOL": "SÍMBOLO RELIGIOSO",
	"RANGED": "À DISTÂNCIA",
	"MELEE": "CORPO A CORPO",
	"DESCRIPTION": "DESCRIÇÃO",
	"DISABLE": "DESABILITAR",
	"ROUTINE": "ROTINA",
	"CRAFT REQUIREMENTS": "REQUERIMENTOS DE FABRICAÇÃO",
	"DESTRUCTION": "DESTRUIÇÃO",
	"TEA CEREMONY": "CERIMÔNIA DO CHÁ",
	"DEVIL": "DIABO",
	"ACTIVATE": "ATIVAÇÃO",
	"COMMUNICATION": "COMUNICAÇÃO",
	"FORT SAVE": "SALVAMENTO DE FORTITUDE",
	"FORT": "FORT",
	"REF SAVE": "SALVAMENTO DE REFLEXOS",
	"REF": "REF",
	"WILL SAVE": "SALVAMENTO DE VONTADE",
	"DEX CAP": "LIMITE DE DES",
	"SPEED PENALTY": "PENALIDADE DE VELOCIDADE",
	"PROFICIENCY": "PROFICIÊNCIA",
	"CHECK PENALTY": "PENALIDADE EM TESTES",
	"RELOAD": "RECARGA",
	"TYPICAL SPEAKERS": "FALANTES TÍPICOS",
	"REGIONS": "REGIÕES",
	"GOVERNMENT": "GOVERNO",
	"CAPITAL": "CAPITAL",
	"POPULATION": "POPULAÇÃO",
	"RELIGIONS": "RELIGIÕES",
	"PRIMARY EXPORTS": "PRINCIPAIS EXPORTAÇÕES",
	"PRIMARY IMPORTS": "PRINCIPAIS IMPORTAÇÕES",
	"ENEMIES": "INIMIGOS",
	"FACTIONS": "FACÇÕES",
	"THREATS": "AMEAÇAS",
	"SCOPE AND INFLUENCE": "ABRANGÊNCIA E INFLUÊNCIA",
	"GOALS": "OBJETIVOS",
	"HEADQUARTERS": "SEDE",
	"KEY MEMBERS": "MEMBROS IMPORTANTES",
	"ALLIES": "ALIADOS",
	"ASSETS": "RECURSOS",
	"MEMBERSHIP REQUIREMENTS": "REQUERIMENTOS DE ADMISSÃO",
	"ACCEPTED ALIGNMENTS": "TENDÊNCIAS ACEITAS",
	"VALUES": "VALORES",
	"ANATHEMA": "ANÁTEMA",
	"DIVINITIES": "DIVINDADES",
	"NATIVE INHABITANTS": "HABITANTES NATIVOS",
	"KEY ANCHOR": "ÂNCORA PRINCIPAL",
	"ENTRY": "ENTRADA",
	"CAST": "CONJURAÇÃO",
	"AREA": "ÁREA",
	"TARGETS": "ALVOS",
	"PROHIBITED": "PROIBIDO",
	"TRADITIONS": "TRADIÇÕES",
	"AMP": "AMPLIFICAÇÃO",
	"PILOTING CHECK": "TESTE DE PILOTAGEM",
	"COLLISION": "COLISÃO",
	"DYNAMIC VIEWER": "VISUALIZADOR DINÂMICO",
	"GO TO PAGE": "IR PARA A PÁGINA",
	"OPEN AS POPUP WINDOW": "ABRIR EM JANELA SEPARADA",
	"SHOW SOURCE DATA": "MOSTRAR DADOS DE ORIGEM",
	"PREVIOUS": "ANTERIOR",
	"NEXT": "PRÓXIMA",
	"COLLAPSE ALL": "RECOLHER TUDO",
	"EXPAND ALL": "EXPANDIR TUDO",
	"BACK TO TOP": "VOLTAR AO TOPO",
	"FIND": "LOCALIZAR",
	"EXPAND": "EXPANDIR",
	"COLLAPSE": "RECOLHER",
	"PRINT VIEW": "VISUALIZAÇÃO DE IMPRESSÃO",
	"PRINTER VIEW": "VISUALIZAÇÃO DE IMPRESSÃO",
	"TABLE VIEW": "VISUALIZAÇÃO EM TABELA",
	"BOOK VIEW": "VISUALIZAÇÃO DE LIVRO",
	"VIEW ENTIRE DOCUMENT": "VER DOCUMENTO COMPLETO",
	"DEEP BACKGROUNDS": "BIOGRAFIAS DETALHADAS",
	"CREATE A DEEP BACKGROUND": "CRIAR BIOGRAFIA DETALHADA",
	"BUY EQUIPMENT": "COMPRAR EQUIPAMENTO",
	"CHANGE BASE ITEM": "ALTERAR ITEM BASE",
	"RUNE BUILDER": "CONSTRUTOR DE RUNAS",
	"ENCOUNTER BUILDER": "CONSTRUTOR DE ENCONTROS",
	"PROFICIENCY WITHOUT LEVEL": "PROFICIÊNCIA SEM NÍVEL",
	"GROUP INFO": "INFORMAÇÕES DO GRUPO",
	"ADVANCED MODE": "MODO AVANÇADO",
	"SAVE TO URL": "SALVAR NO LINK",
	"SAVE TO FILE": "SALVAR EM ARQUIVO",
	"LOAD FROM FILE": "CARREGAR DE ARQUIVO",
	"COPY AS TEXT": "COPIAR COMO TEXTO",
	"ADD COLUMN": "ADICIONAR COLUNA",
	"COMBINE AS": "COMBINAR COMO",
	"ALWAYS SAVE ON CLOSE": "SEMPRE SALVAR AO FECHAR",
	"FILTER COMBINATION LOGIC": "LÓGICA DE COMBINAÇÃO DOS FILTROS",
	"UNSAVED CHANGES": "ALTERAÇÕES NÃO SALVAS",
	"SELECT BY DATE": "SELECIONAR POR DATA",
	"SHOW AS DROPDOWNS": "MOSTRAR COMO MENUS",
	"SHOW FILTER": "MOSTRAR FILTROS",
	"TOGGLE FILTER SUMMARY": "ALTERNAR RESUMO DOS FILTROS",
	"SHOW FEATS": "MOSTRAR TALENTOS",
	"CLASS FEATURES": "CARACTERÍSTICAS DE CLASSE",
	"SELECT ALL": "SELECIONAR TUDO",
	"SELECT OFFICIAL": "SELECIONAR OFICIAIS",
	"STANDARD HERITAGES ONLY": "APENAS HERANÇAS PADRÃO",
	"VERSATILE HERITAGES ONLY": "APENAS HERANÇAS VERSÁTEIS",
	"DOWNLOAD CSV": "BAIXAR CSV",
	"COPY CSV TO CLIPBOARD": "COPIAR CSV PARA A ÁREA DE TRANSFERÊNCIA",
	"TO TOP": "VOLTAR AO TOPO",
	"INCLUDE UNOFFICIAL": "INCLUIR NÃO OFICIAIS",
	"INCLUDE BLACKLISTED": "INCLUIR CONTEÚDO BLOQUEADO",
	"COLLAPSE ALL RESULTS": "RECOLHER TODOS OS RESULTADOS",
	"EXPAND ALL RESULTS": "EXPANDIR TODOS OS RESULTADOS",
	"TOGGLE PREVIEW": "ALTERNAR PRÉVIA",
	"SPELL LEVEL": "NÍVEL DE MAGIA",
	"ALPHABETICAL": "ALFABÉTICA",
	"DAY MODE": "MODO CLARO",
	"NIGHT MODE": "MODO ESCURO",
	"DISABLE WIDE MODE": "DESATIVAR MODO AMPLO",
	"SAVE STATE TO FILE": "SALVAR DADOS EM ARQUIVO",
	"LOAD STATE FROM FILE": "CARREGAR DADOS DE ARQUIVO",
	"ADD AS APP": "INSTALAR APLICATIVO",
	"CLEAR OFFLINE CACHE": "LIMPAR CACHE OFFLINE",
	"REMOVE COLUMN": "REMOVER COLUNA",
	"REMOVE PLAYER": "REMOVER JOGADOR",
	"REMOVE PLAYER GROUP": "REMOVER GRUPO DE JOGADORES",
	"RANDOMIZE CREATURE": "SORTEAR CRIATURA",
	"SAVE ENCOUNTER": "SALVAR ENCONTRO",
	"ENTER ENCOUNTER NAME": "DIGITE O NOME DO ENCONTRO",
	"RELOAD CURRENT ENCOUNTER": "RECARREGAR ENCONTRO ATUAL",
	"LOAD ENCOUNTER": "CARREGAR ENCONTRO",
	"SAVED ENCOUNTERS": "ENCONTROS SALVOS",
	"NO SAVED ENCOUNTERS": "NENHUM ENCONTRO SALVO",
	"SAVE ITEM": "SALVAR ITEM",
	"RELOAD CURRENT ITEM": "RECARREGAR ITEM ATUAL",
	"SAVED ITEMS": "ITENS SALVOS",
	"NO SAVED ITEMS": "NENHUM ITEM SALVO",
	"SELECT CURRENCY CONVERSION TABLE": "SELECIONAR TABELA DE CONVERSÃO DE MOEDAS",
	"SELECT DISPLAY MODE": "SELECIONAR MODO DE EXIBIÇÃO",
	"DICE ROLLER": "ROLADOR DE DADOS",
	"COPY TO INPUT": "COPIAR PARA O CAMPO",
	"ZOOM OUT": "DIMINUIR ZOOM",
	"ZOOM IN": "AUMENTAR ZOOM",
	"RESET ZOOM": "REDEFINIR ZOOM",
	"TITLE": "TÍTULO",
	"ABBREVIATION": "ABREVIAÇÃO",
	"SOURCE URL": "URL DA FONTE",
	"CONVERTED BY": "CONVERTIDO POR",
	"JSON IDENTIFIER": "IDENTIFICADOR JSON",
	"SELECT A HOMEBREW SOURCE": "SELECIONAR FONTE DE CONTEÚDO PRÓPRIO",
	"USE AN EXISTING SOURCE": "USAR FONTE EXISTENTE",
	"FILE TYPE MISMATCH": "TIPO DE ARQUIVO INCOMPATÍVEL",
	"ONE": "UMA",
	"BROWSE YOUR CAMPAIGNS AND SESSION NOTES": "CONSULTE SUAS CAMPANHAS E ANOTAÇÕES DE SESSÃO",
	"YOUR CAMPAIGNS": "SUAS CAMPANHAS",
	"OPEN": "ABRA",
	"RULES AT THE TABLE": "REGRAS À MESA",
	"BASED ON": "BASEADO EM",
	"SOURCE LICENSE": "LICENÇA DO CÓDIGO-FONTE",
	"SET FILTERS TO BUY EQUIPMENT DURING CHARACTER CREATION": "AJUSTAR FILTROS PARA COMPRAR EQUIPAMENTO DURANTE A CRIAÇÃO DE PERSONAGEM",
	"CHANGE THE ITEM YOU ARE ADDING RUNES TO": "ALTERAR O ITEM QUE RECEBERÁ AS RUNAS",
	"ADD RUNES TO BASIC ITEMS": "ADICIONAR RUNAS A ITENS BÁSICOS",
	"SAVE AS NEW ITEM AND EXIT RUNEBUILDER": "SALVAR COMO NOVO ITEM E SAIR DO CONSTRUTOR DE RUNAS",
	"DISCARD CHANGES AND EXIT RUNEBUILDER": "DESCARTAR ALTERAÇÕES E SAIR DO CONSTRUTOR DE RUNAS",
	"VIEW THIS FEAT ON THE FEATS PAGE": "VER ESTE TALENTO NA PÁGINA DE TALENTOS",
	"TOGGLE ANCESTRY FEATURES": "ALTERNAR CARACTERÍSTICAS DE ANCESTRALIDADE",
	"TOGGLE FEAT VIEW": "ALTERNAR VISUALIZAÇÃO DE TALENTOS",
	"SHOW HERITAGE SOURCES": "MOSTRAR FONTES DAS HERANÇAS",
	"HIDE ARCHETYPES SEARCH BAR AND ENTRY LIST": "OCULTAR BARRA DE BUSCA E LISTA DE ARQUÉTIPOS",
	"TOGGLE CLASS FEATURES": "ALTERNAR CARACTERÍSTICAS DE CLASSE",
	"TOGGLE CLASS INFO": "ALTERNAR INFORMAÇÕES DE CLASSE",
	"SHOW SUBCLASS SOURCES": "MOSTRAR FONTES DAS SUBCLASSES",
	"TOGGLE A BUTTON TO VIEW CLASS INFORMATION": "ATIVE UM BOTÃO PARA VER INFORMAÇÕES DE CLASSE",
	"SELECT A SECTION TO BEGIN": "SELECIONE UMA SEÇÃO PARA COMEÇAR",
	"INCLUDE UNOFFICIAL SOURCE RESULTS": "INCLUIR RESULTADOS DE FONTES NÃO OFICIAIS",
	"INCLUDE BLACKLISTED CONTENT RESULTS": "INCLUIR RESULTADOS DE CONTEÚDO BLOQUEADO",
	"FILTER UNOFFICIAL SOURCE RESULTS": "FILTRAR RESULTADOS DE FONTES NÃO OFICIAIS",
	"FILTER BLACKLISTED CONTENT RESULTS": "FILTRAR RESULTADOS DE CONTEÚDO BLOQUEADO",
	"HIDE SEARCH BAR AND ENTRY LIST": "OCULTAR BARRA DE BUSCA E LISTA DE ENTRADAS",
	"RESET LEVEL SCALING": "REDEFINIR AJUSTE DE NÍVEL",
	"TOGGLE NARROW READING WIDTH": "ALTERNAR LARGURA DE LEITURA REDUZIDA",
	"GET LINK TO FILTERS": "OBTER LINK DOS FILTROS",
	"SELECT A ENTRY FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA ENTRADA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN ENTRY FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA ENTRADA NA LISTA PARA EXIBIR AQUI",
	"SELECT A BACKGROUND FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA BIOGRAFIA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN BACKGROUND FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA BIOGRAFIA NA LISTA PARA EXIBIR AQUI",
	"SELECT A DEITY FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA DIVINDADE NA LISTA PARA EXIBIR AQUI",
	"SELECT AN DEITY FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA DIVINDADE NA LISTA PARA EXIBIR AQUI",
	"SELECT A HAZARD FROM THE LIST TO VIEW IT HERE": "SELECIONE UM PERIGO NA LISTA PARA EXIBIR AQUI",
	"SELECT AN HAZARD FROM THE LIST TO VIEW IT HERE": "SELECIONE UM PERIGO NA LISTA PARA EXIBIR AQUI",
	"SELECT A LANGUAGE FROM THE LIST TO VIEW IT HERE": "SELECIONE UM IDIOMA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN LANGUAGE FROM THE LIST TO VIEW IT HERE": "SELECIONE UM IDIOMA NA LISTA PARA EXIBIR AQUI",
	"SELECT A ORGANIZATION FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA ORGANIZAÇÃO NA LISTA PARA EXIBIR AQUI",
	"SELECT AN ORGANIZATION FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA ORGANIZAÇÃO NA LISTA PARA EXIBIR AQUI",
	"SELECT A SPELL FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA MAGIA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN SPELL FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA MAGIA NA LISTA PARA EXIBIR AQUI",
	"SELECT A TABLE FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA TABELA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN TABLE FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA TABELA NA LISTA PARA EXIBIR AQUI",
	"SELECT A TRAIT FROM THE LIST TO VIEW IT HERE": "SELECIONE UM TRAÇO NA LISTA PARA EXIBIR AQUI",
	"SELECT AN TRAIT FROM THE LIST TO VIEW IT HERE": "SELECIONE UM TRAÇO NA LISTA PARA EXIBIR AQUI",
	"SELECT A RULE FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA REGRA NA LISTA PARA EXIBIR AQUI",
	"SELECT AN RULE FROM THE LIST TO VIEW IT HERE": "SELECIONE UMA REGRA NA LISTA PARA EXIBIR AQUI",
	"SELECT A FEAT FROM THE LIST TO VIEW IT HERE": "SELECIONE UM TALENTO NA LISTA PARA EXIBIR AQUI",
	"SELECT AN FEAT FROM THE LIST TO VIEW IT HERE": "SELECIONE UM TALENTO NA LISTA PARA EXIBIR AQUI",
	"SELECT A ARCHETYPE FROM THE LIST TO VIEW IT HERE": "SELECIONE UM ARQUÉTIPO NA LISTA PARA EXIBIR AQUI",
	"SELECT AN ARCHETYPE FROM THE LIST TO VIEW IT HERE": "SELECIONE UM ARQUÉTIPO NA LISTA PARA EXIBIR AQUI",
	"SELECT A GIFT FROM THE LIST ON THE LEFT TO VIEW IT HERE": "SELECIONE UM DOM NA LISTA À ESQUERDA PARA EXIBIR AQUI",
	"RANDOM TRIVIAL": "SORTEAR TRIVIAL",
	"ADJUST TO TRIVIAL": "AJUSTAR PARA TRIVIAL",
	"RANDOM LOW": "SORTEAR BAIXA",
	"ADJUST TO LOW": "AJUSTAR PARA BAIXA",
	"RANDOM MODERATE": "SORTEAR MODERADA",
	"ADJUST TO MODERATE": "AJUSTAR PARA MODERADA",
	"RANDOM SEVERE": "SORTEAR SEVERA",
	"ADJUST TO SEVERE": "AJUSTAR PARA SEVERA",
	"RANDOM EXTREME": "SORTEAR EXTREMA",
	"ADJUST TO EXTREME": "AJUSTAR PARA EXTREMA",
	"ACTIVATABLE": "ATIVÁVEL",
	"ALTERS RELIC": "ALTERA RELÍQUIA",
	"ANY": "QUALQUER",
	"ARMOR": "ARMADURA",
	"BASIC": "BÁSICO",
	"CAN BE DISMISSED": "PODE SER DISPENSADA",
	"CAN BE HEIGHTENED": "PODE SER ELEVADA",
	"CANTRIP": "TRUQUE MÁGICO",
	"CANTRIPS": "TRUQUES MÁGICOS",
	"CORE": "BÁSICO",
	"DISPLAY CLASS IF ANY SUBCLASS IS VISIBLE": "EXIBIR CLASSE SE ALGUMA SUBCLASSE ESTIVER VISÍVEL",
	"DISPLAY STANDARD HERITAGES": "EXIBIR HERANÇAS PADRÃO",
	"DISPLAY VERSATILE HERITAGES": "EXIBIR HERANÇAS VERSÁTEIS",
	"EQUIPMENT": "EQUIPAMENTO",
	"FOCUS": "FOCO",
	"FREE": "LIVRE",
	"GENERIC": "GENÉRICO",
	"GENERIC VARIANT": "VARIANTE GENÉRICA",
	"GRANTS ABILITY": "CONCEDE HABILIDADE",
	"GRANTS EQUIPMENT": "CONCEDE EQUIPAMENTO",
	"GRANTS PASSIVE ATTRIBUTE": "CONCEDE ATRIBUTO PASSIVO",
	"GRANTS SENSE": "CONCEDE SENTIDO",
	"GRANTS SITUATIONAL BENEFIT": "CONCEDE BENEFÍCIO SITUACIONAL",
	"GRANTS TEMPORARY HIT POINTS": "CONCEDE PONTOS DE VIDA TEMPORÁRIOS",
	"HAS BATTLE FORM": "POSSUI FORMA DE BATALHA",
	"HAS DIVINE INTERCESSION": "POSSUI INTERCESSÃO DIVINA",
	"HAS DRAWBACK": "POSSUI DESVANTAGEM",
	"HAS FONTS": "POSSUI FONTES TIPOGRÁFICAS",
	"HAS ROUTINE": "POSSUI ROTINA",
	"HAS TABLE NUMBER": "POSSUI NÚMERO DE TABELA",
	"HAS TARGETS": "POSSUI ALVOS",
	"HAS A COST": "POSSUI CUSTO",
	"HERITAGE": "HERANÇA",
	"INSTANT": "INSTANTÂNEA",
	"IS RESETTABLE": "PODE SER REARMADO",
	"IS ROLLABLE": "PERMITE ROLAGEM",
	"IS RUNE": "É RUNA",
	"MUST BE A CREATURE": "DEVE SER UMA CRIATURA",
	"PLANETARY": "PLANETÁRIO",
	"POSSIBLE ELEMENTALIST SPELLS": "MAGIAS POSSÍVEIS DE ELEMENTALISTA",
	"REGIONAL": "REGIONAL",
	"SOMATIC": "SOMÁTICO",
	"SOUL SEED GIFT": "DOM DE SEMENTE DA ALMA",
	"SPECIFIC VARIANT": "VARIANTE ESPECÍFICA",
	"SUMMONING": "INVOCAÇÃO",
	"SUSTAINED": "SUSTENTADA",
	"TOUCH": "TOQUE",
	"UNARMED ATTACK": "ATAQUE DESARMADO",
	"UNLIMITED": "ILIMITADO",
	"VARIES": "VARIA",
	"VERBAL": "VERBAL",
	"ENTER A NUMBER": "DIGITE UM NÚMERO",
	"CHOOSE": "ESCOLHA",
	"SELECT AN OPTION": "SELECIONE UMA OPÇÃO",
	"ENTER TEXT": "DIGITE UM TEXTO",
	"CHOOSE COLOR": "ESCOLHA UMA COR",
	"SELECT DIRECTION": "SELECIONE UMA DIREÇÃO",
	"ENTER DICE": "DIGITE UMA ROLAGEM",
	"VERSION": "VERSÃO",
	"YOUR": "SEU",
	"CHOOSE A LANGUAGE": "ESCOLHA UM IDIOMA",
	"TRAINED IN": "TREINADO EM",
	"ATTACKS": "ATAQUES",
	"CLASS DC": "CD DE CLASSE",
	"WEAPON": "ARMA",
	"GM INFLUENCE": "INFLUÊNCIA DO MESTRE",
	"HIDE FEATS": "OCULTAR TALENTOS",
	"SELECT CLASS": "SELECIONAR CLASSE",
	"SELECT ANCESTRY": "SELECIONAR ANCESTRALIDADE",
	"VERSATILE HERITAGES": "HERANÇAS VERSÁTEIS",
	"STANDARD HERITAGES": "HERANÇAS PADRÃO",
	"EDITION": "EDIÇÃO",
	"COLOR": "COR",
	"RANDOM": "ALEATÓRIO",
	"Search by name on the left, click a name to display on the right.": "Busque pelo nome à esquerda e selecione uma entrada para exibi-la à direita.",
	"Search by name on the left, click an entry name to display on the right.": "Busque pelo nome à esquerda e selecione uma entrada para exibi-la à direita.",
	"No campaigns yet. Add a campaign to data/adventures.json to get started.": "Nenhuma campanha cadastrada. Adicione uma campanha em data/adventures.json para começar.",
	"Search rules and subsystems by name, then select an entry to read it.": "Busque regras e subsistemas pelo nome e selecione uma entrada para ler.",
	"Campaigns, session notes, and Pathfinder 2e references for Avalon.": "Campanhas, anotações de sessão e referências de Pathfinder 2e para Avalon.",
	"to browse your games, jump to a session, or read the full campaign journal.": "para consultar seus jogos, acessar uma sessão ou ler o diário completo da campanha.",
	"Quickly browse the official classes, and their associated subclasses.": "Consulte as classes oficiais e suas subclasses.",
	"A searchable, filterable list of optional rules, variant rules, and rule subsystems.": "Consulte e filtre o glossário de regras e subsistemas.",
	"A searchable, filterable list of actions and activities you can take.": "Consulte e filtre as ações e atividades disponíveis.",
	"A searchable, filterable list of the conditions found in the Core Rulebook.": "Consulte e filtre as condições do Livro Básico.",
	"A searchable, filterable list of all traits used in the various statblocks of Pf2e.": "Consulte e filtre os traços usados nas fichas de Pathfinder 2e.",
	"A searchable, filterable list of the more than 1,000 stat blocks in Pf2e.": "Consulte e filtre as fichas de criaturas de Pathfinder 2e.",
	"Could not load Quick Reference. Run npm run gen-all to rebuild the reference data.": "Não foi possível carregar a Referência Rápida. Execute npm run gen-all para gerar os dados novamente.",
	"Could not load campaigns. Check the campaign index and try again.": "Não foi possível carregar as campanhas. Confira o índice de campanhas e tente novamente.",
	"Save any locally-stored data (filters, pinned entries, dice macros, etc.) to a file.": "Salve os dados locais (filtros, entradas fixadas, macros de dados etc.) em um arquivo.",
	"Load previously-saved data (filters, pinned entries, dice macros, etc.) from a file.": "Carregue dados salvos anteriormente (filtros, entradas fixadas, macros de dados etc.) de um arquivo.",
	"Hotkey: F. Disclaimer: unlikely to search everywhere. Use with caution.": "Atalho: F. A busca pode não abranger todo o conteúdo do site.",
	"Changing to a different item category will remove selected runes.": "Alterar a categoria do item removerá as runas selecionadas.",
	"Rune Items are deleted from the item list when the items page is reloaded.": "Os itens com runas são removidos da lista quando a página de itens é recarregada.",
	"Search by name on the left, click ancestry name to display on the right.": "Busque pelo nome à esquerda e selecione uma ancestralidade para exibir à direita.",
	"Search by name on the left, click archetype name to display on the right.": "Busque pelo nome à esquerda e selecione um arquétipo para exibir à direita.",
	"Search by name on the left, click background name to display on the right.": "Busque pelo nome à esquerda e selecione uma biografia para exibir à direita.",
	"Search by name on the left, click creature name to display on the right.": "Busque pelo nome à esquerda e selecione uma criatura para exibir à direita.",
	"Search by name on the left, click class name to display on the right.": "Busque pelo nome à esquerda e selecione uma classe para exibir à direita.",
	"Search by name on the left, click deity name to display on the right.": "Busque pelo nome à esquerda e selecione uma divindade para exibir à direita.",
	"Search by name on the left, click feat name to display on the right.": "Busque pelo nome à esquerda e selecione um talento para exibir à direita.",
	"Search by name on the left, click item name to display on the right.": "Busque pelo nome à esquerda e selecione um item para exibir à direita.",
	"Search by name on the left, click organization name to display on the right.": "Busque pelo nome à esquerda e selecione uma organização para exibir à direita.",
	"Search by name on the left, click spell name to display on the right.": "Busque pelo nome à esquerda e selecione uma magia para exibir à direita.",
	"Adjust the current encounter difficulty to a Trivial-threat encounter": "Ajustar o encontro atual para ameaça trivial",
	"Adjust the current encounter difficulty to a Low-threat encounter": "Ajustar o encontro atual para ameaça baixa",
	"Adjust the current encounter difficulty to a Moderate-threat encounter": "Ajustar o encontro atual para ameaça moderada",
	"Adjust the current encounter difficulty to a Severe-threat encounter": "Ajustar o encontro atual para ameaça severa",
	"Adjust the current encounter difficulty to a Extreme-threat encounter": "Ajustar o encontro atual para ameaça extrema",
	"djust the current encounter difficulty to a Moderate-threat encounter": "Ajustar o encontro atual para ameaça moderada",
	"can be &quot;spell&quot;, &quot;item&quot;, &quot;bestiary&quot;, etc.": "pode ser &quot;spell&quot; (magia), &quot;item&quot;, &quot;bestiary&quot; (bestiário) etc.",
	"is an abbreviated source/book name (&quot;CRB&quot;, &quot;Bst&quot;, etc.)": "é a abreviação de uma fonte/livro (&quot;CRB&quot;, &quot;Bst&quot; etc.)",
	"⇽ All Campaigns": "⇽ Todas as Campanhas",
	"Adjust the current encounter difficulty to an Extreme-threat encounter": "Ajustar o encontro atual para ameaça extrema",
	"No information available.": "Nenhuma informação disponível.",
	"No images available.": "Nenhuma imagem disponível.",
	"Enter a search to view results": "Digite uma busca para ver os resultados",
	"ENTER A SEARCH TO VIEW RESULTS": "DIGITE UMA BUSCA PARA VER OS RESULTADOS",
	"Drag to Reorder": "Arraste para Reordenar",
	"DRAG TO REORDER": "ARRASTE PARA REORDENAR",
	"Previous Session": "Sessão Anterior",
	"PREVIOUS SESSION": "SESSÃO ANTERIOR",
	"Previous Chapter": "Capítulo Anterior",
	"PREVIOUS CHAPTER": "CAPÍTULO ANTERIOR",
	"Next Session": "Próxima Sessão",
	"NEXT SESSION": "PRÓXIMA SESSÃO",
	"Next Chapter": "Próximo Capítulo",
	"NEXT CHAPTER": "PRÓXIMO CAPÍTULO",
	"Saved!": "Salvo!",
	"Copied!": "Copiado!",
	"Deselect Homebrew Sources by Default": "Desmarcar Fontes de Conteúdo Próprio por Padrão",
	"DESELECT HOMEBREW SOURCES BY DEFAULT": "DESMARCAR FONTES DE CONTEÚDO PRÓPRIO POR PADRÃO",
	"Hide summary for filter...": "Ocultar resumo do filtro...",
	"The summary is the small red and blue button panel which appear below the search bar.": "O resumo é o painel de botões vermelhos e azuis exibido abaixo da barra de busca.",
	"Combine filters as...": "Combinar filtros como...",
	"Download Pinned List (SHIFT to Copy Link)": "Baixar Lista Fixada (SHIFT para Copiar Link)",
	"Upload Pinned List (SHIFT for Add Only)": "Carregar Lista Fixada (SHIFT para Apenas Adicionar)",
	"Roll on List": "Sortear na Lista",
	"ROLL ON LIST": "SORTEAR NA LISTA",
	"Download JSON Data": "Baixar Dados JSON",
	"DOWNLOAD JSON DATA": "BAIXAR DADOS JSON",
	"Remove": "Remover",
	"REMOVE": "REMOVER",
	"Remove All": "Remover Tudo",
	"REMOVE ALL": "REMOVER TUDO",
	"Clear List": "Limpar Lista",
	"CLEAR LIST": "LIMPAR LISTA",
	"Popout": "Abrir em Janela Separada",
	"POPOUT": "ABRIR EM JANELA SEPARADA",
	"Pin": "Fixar",
	"PIN": "FIXAR",
	"Unpin": "Desafixar",
	"UNPIN": "DESAFIXAR",
	"AND": "E",
	"OR": "OU",
	"XOR": "OU EXCLUSIVO",
	"Custom": "Personalizado",
	"CUSTOM": "PERSONALIZADO",
	"Keep highest;": "Manter os maiores;",
	"Drop lowest;": "Descartar os menores;",
	"Drop highest;": "Descartar os maiores;",
	"Keep lowest;": "Manter os menores;",
	"Reroll equal;": "Rerrolar valores iguais;",
	"Reroll less;": "Rerrolar valores menores;",
	"Reroll less or equal;": "Rerrolar valores menores ou iguais;",
	"Reroll greater;": "Rerrolar valores maiores;",
	"Reroll greater equal;": "Rerrolar valores maiores ou iguais;",
	"Explode equal;": "Explodir valores iguais;",
	"Explode less;": "Explodir valores menores;",
	"Explode less or equal;": "Explodir valores menores ou iguais;",
	"Explode greater;": "Explodir valores maiores;",
	"Explode greater equal;": "Explodir valores maiores ou iguais;",
	"Count Successes equal;": "Contar sucessos iguais;",
	"Count Successes less;": "Contar sucessos menores;",
	"Count Successes less or equal;": "Contar sucessos menores ou iguais;",
	"Count Successes greater;": "Contar sucessos maiores;",
	"Count Successes greater equal;": "Contar sucessos maiores ou iguais;",
	"Margin of Success;": "Margem de Sucesso;",
	"Dice pools;": "Conjuntos de dados;",
	"Dice pools with modifiers;": "Conjuntos de dados com modificadores;",
	"Rounding;": "Arredondamento;",
	"Average;": "Média;",
	"Other functions;": "Outras funções;",
	"to list saved macros.": "para listar as macros salvas.",
	"to add (or update) a macro. Macro names should not contain spaces or hashes.": "para adicionar ou atualizar uma macro. Os nomes não devem conter espaços nem cerquilhas.",
	"to remove a macro.": "para remover uma macro.",
	"to roll a macro.": "para rolar uma macro.",
	"without opening": "sem abrir",
	"but found": "mas encontrou",
	"A link to the original homebrew, e.g. a GM Binder page": "Um link para o conteúdo próprio original.",
	"A comma-separated list of authors, e.g. 'John Doe, Joe Bloggs'": "Lista de autores separados por vírgulas.",
	"If you wish to view multiple spells, please first make a list": "Para ver várias magias, crie uma lista primeiro.",
	"Spells Book View": "Livro de Magias",
	"SPELLS BOOK VIEW": "LIVRO DE MAGIAS",
	"Companion": "Companheiro",
	"COMPANION": "COMPANHEIRO",
	"Plane": "Plano",
	"PLANE": "PLANO",
	"Nation": "Nação",
	"NATION": "NAÇÃO",
	"Settlement": "Assentamento",
	"SETTLEMENT": "ASSENTAMENTO",
	"Philosophy": "Filosofia",
	"PHILOSOPHY": "FILOSOFIA",
	"Covenant": "Pacto",
	"COVENANT": "PACTO",
	"Common language": "Idioma Comum",
	"COMMON LANGUAGE": "IDIOMA COMUM",
	"Uncommon language": "Idioma Incomum",
	"UNCOMMON LANGUAGE": "IDIOMA INCOMUM",
	"Rare language": "Idioma Raro",
	"RARE LANGUAGE": "IDIOMA RARO",
	"Basic Ability": "Habilidade Básica",
	"BASIC ABILITY": "HABILIDADE BÁSICA",
	"Advanced Ability": "Habilidade Avançada",
	"ADVANCED ABILITY": "HABILIDADE AVANÇADA",
	"Master Ability": "Habilidade Mestra",
	"MASTER ABILITY": "HABILIDADE MESTRA",
	"MINOR GIFT": "DOM MENOR",
	"MAJOR GIFT": "DOM MAIOR",
	"GRAND GIFT": "DOM GRANDIOSO",
	"Clear Pins": "Desafixar Tudo",
	"CLEAR PINS": "DESAFIXAR TUDO",
	"Popout Window": "Abrir em Janela Separada",
	"POPOUT WINDOW": "ABRIR EM JANELA SEPARADA",
	"Enter a Name": "Digite um Nome",
	"ENTER A NAME": "DIGITE UM NOME",
	"Show in Search": "Mostrar na Busca",
	"SHOW IN SEARCH": "MOSTRAR NA BUSCA",
	"Add to List": "Adicionar à Lista",
	"ADD TO LIST": "ADICIONAR À LISTA",
	"Remove from List": "Remover da Lista",
	"REMOVE FROM LIST": "REMOVER DA LISTA",
};
Parser.uiToFull = function (value) {
	if (typeof value !== "string") return value;
	if (Object.hasOwn(Parser.UI_LABELS, value)) return Parser.UI_LABELS[value];
	const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
	return Object.hasOwn(Parser.UI_LABELS, capitalized) ? Parser.UI_LABELS[capitalized] : value;
};

Parser.TRAIT_CATEGORIES = {
	affliction: "Aflição",
	ancestry: "Ancestralidade",
	armor: "Armadura",
	class: "Classe",
	"class-specific": "Específico de classe",
	"creature type": "Tipo de criatura",
	elemental: "Elemental",
	energy: "Energia",
	equipment: "Equipamento",
	feat: "Talento",
	hazard: "Perigo",
	mechanics: "Mecânicas",
	monster: "Monstro",
	planar: "Planar",
	poison: "Veneno",
	rarity: "Raridade",
	sense: "Sentido",
	tradition: "Tradição",
	weapon: "Arma",
};
Parser.traitCategoryToFull = function (category) {
	return Parser.TRAIT_CATEGORIES[category] || category;
};
Parser.traitCategoryToSchemaKey = function (category) {
	return `${category.replace(/[^a-zA-Z0-9]+/g, " ").trim().toCamelCase()}Trait`;
};

// Stable behavior keys, separate from the visible trait names.
Parser.TRAIT_NAMES_BY_KEY = {
	common: ["Comum", "Common"],
	uncommon: ["Incomum", "Uncommon"],
	rare: ["Raro", "Rare"],
	unique: ["Único", "Unique"],
	general: ["Geral", "General"],
	skill: ["Perícia", "Skill"],
	archetype: ["Arquétipo", "Archetype"],
};
Parser._TRAIT_KEY_BY_NAME = Object.fromEntries(Object.entries(Parser.TRAIT_NAMES_BY_KEY).flatMap(([key, names]) => names.map(name => [name.toLowerCase(), key])));
Parser.getTraitKey = function (trait) {
	const name = Parser.getTraitName(trait).toLowerCase();
	return Parser._TRAIT_KEY_BY_NAME[name] || name;
};

Parser.rarityToNumber = function (r) {
	if (isNaN(r)) {
		switch (Parser.getTraitKey(r)) {
			case "common":
				return 0;
			case "uncommon":
				return 1;
			case "rare":
				return 2;
			case "unique":
				return 3;
			default:
				return 69;
		}
	} else return r;
};

Parser.dmgTypeToFull = function (dmg) {
	return Parser._parse_aToB(Parser.DMGTYPE_JSON_TO_FULL, dmg);
};
Parser.DMGTYPE_JSON_TO_FULL = {
	A: "acid",
	B: "bludgeoning",
	C: "cold",
	D: "bleed",
	E: "electricity",
	F: "fire",
	H: "chaotic",
	I: "poison",
	L: "lawful",
	M: "mental",
	Mod: "modular",
	N: "sonic",
	O: "force",
	P: "piercing",
	R: "precision",
	S: "slashing",
	"+": "positive",
	"-": "negative",
};

Parser.levelToDC = function (level, isSpell, traits) {
	if (isNaN(level)) return "?";
	let DC = 0;
	if (
		isSpell.toLowerCase() === "focus"
		|| isSpell.toLowerCase() === "spell"
		|| isSpell === true
	) {
		level = level * 2 - 1;
	}
	if (level < 21) DC = 14 + Number(level) + Math.floor(level / 3);
	else DC = 40 + Number((level - 20) * 2);

	// The Difficulty is negative for easier adjustments and positive for harder adjustments. 0 is default.
	if (traits && traits.length) {
		const difficulties =
			typeof traits === "string"
				? traits.split(" ")
				: traits.filter((it) => typeof it === "string");
		difficulties.forEach((difficulty) => {
			switch (Parser.rarityToNumber(difficulty)) {
				// Incredibly Easy
				case -3:
					DC = DC - 10;
					break;
				// Very Easy
				case -2:
					DC = DC - 5;
					break;
				// Easy
				case -1:
					DC = DC - 2;
					break;
				// Hard (Uncommon)
				case 1:
					DC = DC + 2;
					break;
				// Very Hard (Rare)
				case 2:
					DC = DC + 5;
					break;
				// Incredibly Hard (Unique)
				case 3:
					DC = DC + 10;
					break;
				default:
					break;
			}
		});
	}

	return `${DC}${level < 0 || level > 25 ? `*` : ""}`;
};

Parser.typeToSkill = function (type) {
	if (typeof type === "string" || type instanceof String) {
		type = type.split();
	}

	let skill = new Set();

	for (let i = 0; i < type.length; i++) {
		let typeNum = type[i];
		switch (typeNum.toLowerCase()) {
			// Creature Types
			case "aberration":
				skill.add("{@skill Occultism}");
				break;
			case "animal":
				skill.add("{@skill Nature}");
				break;
			case "astral":
				skill.add("{@skill Occultism}");
				break;
			case "beast":
				skill.add("{@skill Arcana}");
				skill.add("{@skill Nature}");
				break;
			case "celestial":
				skill.add("{@skill Religion}");
				break;
			case "construct":
				skill.add("{@skill Arcana}");
				skill.add("{@skill Crafting}");
				break;
			case "dragon":
				skill.add("{@skill Arcana}");
				break;
			case "elemental":
				skill.add("{@skill Arcana}");
				skill.add("{@skill Nature}");
				break;
			case "ethereal":
				skill.add("{@skill Occultism}");
				break;
			case "fey":
				skill.add("{@skill Nature}");
				break;
			case "fiend":
				skill.add("{@skill Religion}");
				break;
			case "fungus":
				skill.add("{@skill Nature}");
				break;
			case "humanoid":
				skill.add("{@skill Society}");
				break;
			case "monitor":
				skill.add("{@skill Religion}");
				break;
			case "ooze":
				skill.add("{@skill Occultism}");
				break;
			case "spirit":
				skill.add("{@skill Occultism}");
				break;
			case "plant":
				skill.add("{@skill Nature}");
				break;
			case "undead":
				skill.add("{@skill Religion}");
				break;
			// Spellcasting Traditions
			case "arcane":
				skill.add("{@skill Arcana}");
				break;
			case "divine":
				skill.add("{@skill Religion}");
				break;
			case "occult":
				skill.add("{@skill Occultism}");
				break;
			case "primal":
				skill.add("{@skill Nature}");
				break;
			case "magical":
				skill.add("{@skill Arcana}");
				skill.add("{@skill Religion}");
				skill.add("{@skill Occultism}");
				skill.add("{@skill Nature}");
				break;
			// Items
			case "alchemical":
			case "item":
				skill.add("{@skill Crafting}");
				break;
			default:
				break;
		}
	}
	return [...skill].join(" or ");
};

Parser.getKeyByValue = function (object, value) {
	return Object.keys(object).filter(function (key) {
		return object[key] === value;
	});
};

// Data: <Plant> Lore
// Naked: Plant Lore
// None: Lore
// Tag: {@skill Lore||Plant Lore}
Parser.parseSkills = function (array, opts) {
	opts = opts || {};
	if (opts.toTags && (opts.toNaked || opts.toNone)) {
		throw new Error("Cannot convert to multiple types of strings!");
	}

	let newArray = opts.toTitleCase ? array.map((t) => t.toTitleCase()) : array;

	return newArray.map((it) => {
		if (opts.toTags) return `{@skill ${it.replace(/<.+>/g, "").trim()}||${it.replace(/<|>/g, "").trim()}}`;
		if (opts.toNaked) return it.replace(/<|>/g, "").trim();
		if (opts.toNone) return it.replace(/<.+>/g, "").trim();
		return it.toString();
	});
};

// Data: Scatter {10 ft.}
// Naked: Scatter 10 ft.
// Tag: {@trait Scatter||Scatter 10 ft.}
/**
	@param {Object[]} array Array of traits
	@param {Object} opts Options object.
	@param {string} opts.toTags Convert to tags.
	@param {string} opts.toNaked Remove brackets {}.
	@param {string} opts.toNone Remove both the brackets and everything inside them.
**/
Parser.parseTraits = function (array, opts) {
	opts = opts || {};
	if (opts.toTags && (opts.toNaked || opts.toNone)) {
		throw new Error("Cannot convert to multiple types of strings!");
	}
	if (!(opts.toTags || opts.toNaked || opts.toNone)) {
		throw new Error("Need arguments!");
	}
	let newArray = opts.toTitleCase ? array.map((t) => t.toTitleCase()) : array;

	return newArray.map((it) => {
		if (opts.toTags) return `{@trait ${it.replace(/<.+>/g, "").trim()}||${it.replace(/<|>/g, "").trim()}}`;
		if (opts.toNaked) return it.replace(/<|>/g, "").trim();
		if (opts.toNone) return it.replace(/<.+>/g, "").trim();
		return it.toString();
	});
};

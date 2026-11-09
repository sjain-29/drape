// DRAPE data: clothing categories, colours and the outfit-styling rules.
// Plain JavaScript, created from the same tested code as the full version.
// You can edit the category lists (SUBCATEGORIES) and colours (PALETTE) here.

var DRAPE_DATA = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	// ../drape/functions/src/shared/domain.ts
	/**
	* DRAPE shared domain model.
	*
	* This file is the single source of truth for categories, data shapes and job
	* contracts. It is compiled into the Cloud Functions bundle AND imported by the
	* React app through the `@shared` alias, so the frontend and backend can never
	* drift apart. Keep it free of Node- or browser-specific imports.
	*/
	const GARMENT_GROUPS = [
		"upperWear",
		"bottomWear",
		"onePieces",
		"shoes",
		"accessories",
		"others"
	];
	const GROUP_LABELS = {
		upperWear: "Upper wear",
		bottomWear: "Bottom wear",
		onePieces: "One-pieces",
		shoes: "Shoes",
		accessories: "Accessories",
		others: "Others"
	};
	const SUBCATEGORIES = {
		upperWear: [
			{
				id: "formal-shirt",
				label: "Formal shirt",
				formality: 4,
				warmth: 1
			},
			{
				id: "casual-shirt",
				label: "Casual shirt",
				formality: 2,
				warmth: 1
			},
			{
				id: "t-shirt",
				label: "T-shirt",
				formality: 0,
				warmth: 0
			},
			{
				id: "polo",
				label: "Polo T-shirt",
				formality: 2,
				warmth: 0
			},
			{
				id: "sweatshirt",
				label: "Sweatshirt",
				formality: 1,
				warmth: 2
			},
			{
				id: "hoodie",
				label: "Hoodie",
				formality: 0,
				warmth: 2
			},
			{
				id: "sweater",
				label: "Sweater",
				formality: 2,
				warmth: 3
			},
			{
				id: "jacket",
				label: "Jacket",
				formality: 2,
				warmth: 2
			},
			{
				id: "blazer",
				label: "Blazer",
				formality: 4,
				warmth: 2
			},
			{
				id: "coat",
				label: "Coat",
				formality: 3,
				warmth: 3
			},
			{
				id: "top",
				label: "Top / blouse",
				formality: 2,
				warmth: 0
			},
			{
				id: "kurta",
				label: "Kurta",
				formality: 3,
				warmth: 1
			}
		],
		bottomWear: [
			{
				id: "formal-trousers",
				label: "Formal trousers",
				formality: 4,
				warmth: 1
			},
			{
				id: "chinos",
				label: "Chinos",
				formality: 3,
				warmth: 1
			},
			{
				id: "jeans",
				label: "Jeans",
				formality: 1,
				warmth: 1
			},
			{
				id: "cargo-pants",
				label: "Cargo pants",
				formality: 0,
				warmth: 1
			},
			{
				id: "joggers",
				label: "Joggers",
				formality: 0,
				warmth: 1
			},
			{
				id: "shorts",
				label: "Shorts",
				formality: 0,
				warmth: 0
			},
			{
				id: "track-pants",
				label: "Track pants",
				formality: 0,
				warmth: 1
			},
			{
				id: "skirt",
				label: "Skirt",
				formality: 2,
				warmth: 0
			},
			{
				id: "leggings",
				label: "Leggings",
				formality: 0,
				warmth: 1
			}
		],
		onePieces: [
			{
				id: "dress",
				label: "Dress",
				formality: 3,
				warmth: 0
			},
			{
				id: "jumpsuit",
				label: "Jumpsuit",
				formality: 2,
				warmth: 1
			},
			{
				id: "overalls",
				label: "Overalls",
				formality: 0,
				warmth: 1
			}
		],
		shoes: [
			{
				id: "formal-shoes",
				label: "Formal shoes",
				formality: 4,
				warmth: 1
			},
			{
				id: "loafers",
				label: "Loafers",
				formality: 3,
				warmth: 1
			},
			{
				id: "sneakers",
				label: "Sneakers",
				formality: 1,
				warmth: 1
			},
			{
				id: "boots",
				label: "Boots",
				formality: 2,
				warmth: 2
			},
			{
				id: "sandals",
				label: "Sandals",
				formality: 0,
				warmth: 0
			},
			{
				id: "heels",
				label: "Heels",
				formality: 3,
				warmth: 0
			}
		],
		accessories: [
			{
				id: "watch",
				label: "Watch",
				formality: 3,
				warmth: 0
			},
			{
				id: "belt",
				label: "Belt",
				formality: 3,
				warmth: 0
			},
			{
				id: "bag",
				label: "Bag",
				formality: 2,
				warmth: 0
			},
			{
				id: "cap",
				label: "Cap / hat",
				formality: 0,
				warmth: 1
			},
			{
				id: "sunglasses",
				label: "Sunglasses",
				formality: 1,
				warmth: 0
			},
			{
				id: "tie",
				label: "Tie",
				formality: 4,
				warmth: 0
			},
			{
				id: "scarf",
				label: "Scarf",
				formality: 2,
				warmth: 2
			},
			{
				id: "jewellery",
				label: "Jewellery",
				formality: 3,
				warmth: 0
			}
		],
		others: [{
			id: "other",
			label: "Other",
			formality: 2,
			warmth: 1
		}]
	};
	const ALL_SUBCATEGORY_IDS = GARMENT_GROUPS.flatMap((g) => SUBCATEGORIES[g].map((s) => s.id));
	function findSubcategory(id) {
		if (!id) return void 0;
		for (const group of GARMENT_GROUPS) {
			const hit = SUBCATEGORIES[group].find((s) => s.id === id);
			if (hit) return {
				...hit,
				group
			};
		}
	}
	function subcategoryLabel(id) {
		return findSubcategory(id)?.label ?? "Uncategorised";
	}
	/** Groups that can be sent to the virtual try-on model. */
	const TRY_ON_GROUPS = [
		"upperWear",
		"bottomWear",
		"onePieces"
	];
	const PATTERNS = [
		"solid",
		"striped",
		"checked",
		"printed",
		"floral",
		"graphic",
		"polka-dot",
		"textured",
		"denim",
		"other"
	];
	const PATTERN_LABELS = {
		solid: "Solid",
		striped: "Striped",
		checked: "Checked",
		printed: "Printed",
		floral: "Floral",
		graphic: "Graphic",
		"polka-dot": "Polka dot",
		textured: "Textured",
		denim: "Denim wash",
		other: "Other"
	};
	const STYLES = [
		"formal",
		"smart-casual",
		"casual",
		"streetwear",
		"ethnic",
		"sporty",
		"party"
	];
	const STYLE_LABELS = {
		formal: "Formal",
		"smart-casual": "Smart casual",
		casual: "Casual",
		streetwear: "Streetwear",
		ethnic: "Ethnic",
		sporty: "Sporty",
		party: "Party"
	};
	const OCCASIONS = [
		"office",
		"casual",
		"party",
		"wedding",
		"travel",
		"date"
	];
	const OCCASION_LABELS = {
		office: "Office",
		casual: "Casual",
		party: "Party",
		wedding: "Wedding",
		travel: "Travel",
		date: "Date"
	};
	const STYLIST_STYLES = [
		"formal",
		"smart-casual",
		"casual",
		"streetwear"
	];
	const WEATHER = [
		"hot",
		"mild",
		"cold",
		"rainy"
	];
	const WEATHER_LABELS = {
		hot: "Hot",
		mild: "Mild",
		cold: "Cold",
		rainy: "Rainy"
	};
	const SEASONS = [
		"summer",
		"monsoon",
		"autumn",
		"winter",
		"spring"
	];
	const SEASON_LABELS = {
		summer: "Summer",
		monsoon: "Monsoon",
		autumn: "Autumn",
		winter: "Winter",
		spring: "Spring"
	};
	/** Bump when the third-party processing disclosure materially changes. */
	const AI_CONSENT_VERSION = 1;
	const JOB_TYPES = [
		"garment.process",
		"garment.extract",
		"tryon.generate",
		"photo.analyze"
	];
	const ERROR_CODES = [
		"invalid-input",
		"not-found",
		"unauthenticated",
		"email-not-verified",
		"consent-required",
		"ai-not-configured",
		"ai-timeout",
		"ai-unavailable",
		"ai-rejected",
		"garment-not-detected",
		"extraction-failed",
		"image-unsupported",
		"image-too-large",
		"image-low-quality",
		"quota-exceeded",
		"cancelled",
		"internal"
	];
	/** Human-readable stage names shown during try-on (in order). */
	const TRY_ON_STAGES = [
		"Preparing your photograph",
		"Analysing selected garments",
		"Processing virtual try-on",
		"Generating your outfit",
		"Finalising your result"
	];
	const GARMENT_STAGES = [
		"Uploading",
		"Detecting the garment",
		"Removing the background",
		"Centring on a clean backdrop",
		"Identifying category and colour"
	];
	const EXTRACT_STAGES = [
		"Uploading",
		"Analysing the photograph",
		"Segmenting garments",
		"Creating product images",
		"Identifying categories and colours"
	];
	function groupForRegion(region) {
		return region === "upper" ? "upperWear" : region === "lower" ? "bottomWear" : "onePieces";
	}
	/** Storage path helpers – mirrored by storage.rules. */
	const paths = {
		upload: (uid, name) => `users/${uid}/uploads/${name}`,
		photo: (uid, name) => `users/${uid}/photos/${name}`,
		garment: (uid, name) => `users/${uid}/garments/${name}`,
		extracted: (uid, name) => `users/${uid}/extracted/${name}`,
		tryon: (uid, name) => `users/${uid}/tryon/${name}`
	};
	const LIMITS = {
		maxUploadBytes: 15728640,
		maxImageSide: 2048,
		acceptedTypes: [
			"image/jpeg",
			"image/png",
			"image/webp"
		]
	};
	// ../drape/functions/src/shared/colors.ts
	const PALETTE = [
		{
			name: "White",
			hex: "#FFFFFF",
			family: "neutral"
		},
		{
			name: "Off-white",
			hex: "#F4F1E8",
			family: "neutral"
		},
		{
			name: "Cream",
			hex: "#EFE3C8",
			family: "neutral"
		},
		{
			name: "Beige",
			hex: "#D8C3A0",
			family: "earth"
		},
		{
			name: "Khaki",
			hex: "#BBA675",
			family: "earth"
		},
		{
			name: "Camel",
			hex: "#B5854F",
			family: "earth"
		},
		{
			name: "Tan",
			hex: "#C69C6D",
			family: "earth"
		},
		{
			name: "Brown",
			hex: "#6B4429",
			family: "earth"
		},
		{
			name: "Chocolate",
			hex: "#402719",
			family: "earth"
		},
		{
			name: "Black",
			hex: "#000000",
			family: "neutral"
		},
		{
			name: "Charcoal",
			hex: "#3A3D42",
			family: "neutral"
		},
		{
			name: "Grey",
			hex: "#8A8C8F",
			family: "neutral"
		},
		{
			name: "Light grey",
			hex: "#C8C9CB",
			family: "neutral"
		},
		{
			name: "Navy",
			hex: "#1E2A47",
			family: "neutral"
		},
		{
			name: "Denim blue",
			hex: "#4A6585",
			family: "cool"
		},
		{
			name: "Blue",
			hex: "#2D5BA8",
			family: "cool"
		},
		{
			name: "Royal blue",
			hex: "#2341C9",
			family: "cool"
		},
		{
			name: "Light blue",
			hex: "#A4C5E4",
			family: "cool"
		},
		{
			name: "Sky blue",
			hex: "#6BB3E6",
			family: "cool"
		},
		{
			name: "Teal",
			hex: "#1D7474",
			family: "cool"
		},
		{
			name: "Olive",
			hex: "#666A33",
			family: "earth"
		},
		{
			name: "Green",
			hex: "#2F7A4D",
			family: "cool"
		},
		{
			name: "Bottle green",
			hex: "#1F4D36",
			family: "cool"
		},
		{
			name: "Mint",
			hex: "#A9DCC2",
			family: "cool"
		},
		{
			name: "Maroon",
			hex: "#682030",
			family: "warm"
		},
		{
			name: "Burgundy",
			hex: "#76203C",
			family: "warm"
		},
		{
			name: "Red",
			hex: "#C42B2B",
			family: "warm"
		},
		{
			name: "Pink",
			hex: "#EEA2B7",
			family: "warm"
		},
		{
			name: "Blush",
			hex: "#E7C4BF",
			family: "warm"
		},
		{
			name: "Coral",
			hex: "#EF7F60",
			family: "warm"
		},
		{
			name: "Orange",
			hex: "#E5772F",
			family: "warm"
		},
		{
			name: "Rust",
			hex: "#A3481F",
			family: "warm"
		},
		{
			name: "Mustard",
			hex: "#CF9F1A",
			family: "warm"
		},
		{
			name: "Yellow",
			hex: "#F1D04A",
			family: "warm"
		},
		{
			name: "Lavender",
			hex: "#B8A8D8",
			family: "cool"
		},
		{
			name: "Purple",
			hex: "#66399A",
			family: "cool"
		}
	];
	const PALETTE_NAMES = PALETTE.map((c) => c.name);
	function hexToRgb(hex) {
		const clean = hex.replace("#", "").trim();
		const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "0");
		const num = parseInt(full.slice(0, 6), 16);
		if (Number.isNaN(num)) return [
			128,
			128,
			128
		];
		return [
			num >> 16 & 255,
			num >> 8 & 255,
			num & 255
		];
	}
	function rgbToHex(r, g, b) {
		const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
		return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
	}
	/** sRGB (0–255) → CIE L*a*b* (D65). */
	function rgbToLab(r, g, b) {
		const lin = (c) => {
			const v = c / 255;
			return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
		};
		const R = lin(r);
		const G = lin(g);
		const B = lin(b);
		const x = (R * .4124 + G * .3576 + B * .1805) / .95047;
		const y = R * .2126 + G * .7152 + B * .0722;
		const z = (R * .0193 + G * .1192 + B * .9505) / 1.08883;
		const f = (t) => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
		const fx = f(x);
		const fy = f(y);
		const fz = f(z);
		return [
			116 * fy - 16,
			500 * (fx - fy),
			200 * (fy - fz)
		];
	}
	const PALETTE_LAB = PALETTE.map((c) => ({
		...c,
		lab: rgbToLab(...hexToRgb(c.hex))
	}));
	function deltaE(a, b) {
		return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
	}
	/** Name an arbitrary colour using the closest fashion palette entry. */
	function nearestPaletteColor(hex) {
		const lab = rgbToLab(...hexToRgb(hex));
		let best = PALETTE_LAB[0];
		let bestD = Infinity;
		for (const c of PALETTE_LAB) {
			const d = deltaE(lab, c.lab);
			if (d < bestD) {
				bestD = d;
				best = c;
			}
		}
		return {
			name: best.name,
			hex: best.hex,
			family: best.family
		};
	}
	function paletteByName(name) {
		if (!name) return void 0;
		const n = name.trim().toLowerCase();
		return PALETTE.find((c) => c.name.toLowerCase() === n);
	}
	function colorFamily(name, hex) {
		const p = paletteByName(name);
		if (p) return p.family;
		if (hex) return nearestPaletteColor(hex).family;
		return "neutral";
	}
	/** Hue angle in degrees (0–360) or null for low-saturation colours. */
	function hueOf(hex) {
		const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
		const max = Math.max(r, g, b);
		const d = max - Math.min(r, g, b);
		if (d < .12) return null;
		let h;
		if (max === r) h = (g - b) / d % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
		return h < 0 ? h + 360 : h;
	}
	/** Relative luminance 0–1, for picking legible text on a colour chip. */
	function luminance(hex) {
		const [r, g, b] = hexToRgb(hex).map((v) => {
			const c = v / 255;
			return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
		});
		return .2126 * r + .7152 * g + .0722 * b;
	}
	/**
	* Colour-harmony score for a pair of garments, in −1 … 1.
	* Neutrals pair with everything; analogous and complementary hues score well;
	* clashing saturated hues and identical saturated colours score lower.
	*/
	function harmonyScore(a, b) {
		const fa = colorFamily(a.name, a.hex);
		const fb = colorFamily(b.name, b.hex);
		if (fa === "neutral" && fb === "neutral") return a.name === b.name ? .35 : .8;
		if (fa === "neutral" || fb === "neutral") return .9;
		if (fa === "earth" && fb === "earth") return a.name === b.name ? .2 : .6;
		if (fa === "earth" || fb === "earth") return .5;
		const ha = hueOf(a.hex);
		const hb = hueOf(b.hex);
		if (ha === null || hb === null) return .6;
		const diff = Math.min(Math.abs(ha - hb), 360 - Math.abs(ha - hb));
		if (diff < 12) return a.name === b.name ? -.2 : .3;
		if (diff < 45) return .5;
		if (diff > 150) return .45;
		return -.3;
	}
	// ../drape/functions/src/shared/stylistRules.ts
	/**
	* Deterministic rules-based stylist.
	*
	* Used (a) as the AI Stylist fallback when no LLM provider is configured,
	* (b) to top up / sanity-check LLM suggestions, and (c) on the Home dashboard
	* for instant picks without a network call. Every suggestion only references
	* garments that exist in the wardrobe passed in.
	*/
	const OCCASION_FORMALITY = {
		office: 3.4,
		wedding: 3.8,
		party: 2.4,
		date: 2.4,
		casual: 1,
		travel: .9
	};
	const STYLE_FORMALITY = {
		formal: 4,
		"smart-casual": 2.7,
		casual: 1,
		streetwear: .5
	};
	const LOOK_NAMES = {
		formal: "Formal",
		"smart-casual": "Smart casual",
		casual: "Casual",
		streetwear: "Streetwear"
	};
	const OCCASION_BONUS = {
		office: {
			"formal-shirt": .4,
			blazer: .3,
			"formal-trousers": .4,
			chinos: .25,
			polo: .05,
			hoodie: -.8,
			"t-shirt": -.5,
			shorts: -.9,
			joggers: -.8,
			"track-pants": -.9,
			"cargo-pants": -.5,
			"formal-shoes": .4,
			loafers: .3,
			sandals: -.6
		},
		wedding: {
			kurta: .6,
			blazer: .4,
			"formal-shirt": .3,
			"formal-trousers": .3,
			dress: .3,
			hoodie: -.9,
			"t-shirt": -.7,
			shorts: -1,
			joggers: -.9,
			"track-pants": -1,
			jeans: -.3
		},
		party: {
			"casual-shirt": .2,
			blazer: .2,
			jeans: .2,
			dress: .3,
			jacket: .15,
			"track-pants": -.7
		},
		date: {
			"casual-shirt": .25,
			polo: .15,
			chinos: .25,
			jeans: .15,
			dress: .3,
			"track-pants": -.7,
			hoodie: -.2
		},
		casual: {
			"t-shirt": .2,
			polo: .15,
			jeans: .25,
			shorts: .1,
			sneakers: .3,
			"formal-trousers": -.3,
			blazer: -.2
		},
		travel: {
			"t-shirt": .2,
			hoodie: .15,
			joggers: .3,
			jeans: .15,
			"cargo-pants": .2,
			sneakers: .35,
			"formal-trousers": -.4,
			blazer: -.3
		}
	};
	function formalityOf(item) {
		return findSubcategory(item.subcategory)?.formality ?? 2;
	}
	function warmthOf(item) {
		return findSubcategory(item.subcategory)?.warmth ?? 1;
	}
	function labelOf(item) {
		return (findSubcategory(item.subcategory)?.label ?? item.name).toLowerCase();
	}
	function scoreItem(item, req, target) {
		const reasons = [];
		let score = 1 - Math.abs(formalityOf(item) - target) / 4;
		const bonus = OCCASION_BONUS[req.occasion]?.[item.subcategory] ?? 0;
		score += bonus;
		if (item.style === req.style) score += .25;
		if (req.occasion === "wedding" && item.style === "ethnic") score += .35;
		if (req.occasion === "party" && item.style === "party") score += .3;
		const warmth = warmthOf(item);
		const weather = req.weather ?? (req.season === "summer" ? "hot" : req.season === "winter" ? "cold" : req.season === "monsoon" ? "rainy" : null);
		const strength = req.weather ? 1 : .6;
		if (weather === "hot") {
			if (warmth >= 2) score -= (warmth >= 3 ? 2.2 : 1.8) * strength;
			else if (warmth === 0 && item.group !== "shoes") {
				score += .2 * strength;
				reasons.push({
					weight: .2,
					text: "light enough for the heat"
				});
			}
		} else if (weather === "cold") {
			if (item.group === "upperWear" && warmth >= 2) {
				score += .35 * strength;
				reasons.push({
					weight: .35,
					text: `the ${labelOf(item)} keeps you warm`
				});
			}
			if (item.subcategory === "shorts" || item.subcategory === "sandals") score -= .9 * strength;
			if (item.group === "upperWear" && warmth === 0) score -= .3 * strength;
		} else if (weather === "rainy") {
			const fam = colorFamily(item.color?.name, item.color?.hex);
			if (item.group === "bottomWear" && (item.color?.name === "White" || item.color?.name === "Off-white" || item.color?.name === "Cream")) score -= .35 * strength;
			if (item.subcategory === "shorts" || item.subcategory === "cargo-pants") score += .1 * strength;
			if (fam === "neutral" && item.group === "bottomWear") score += .05;
		}
		if (req.colors?.length && item.color && req.colors.some((c) => c.toLowerCase() === item.color.name.toLowerCase())) {
			score += .3;
			reasons.push({
				weight: .3,
				text: `uses your preferred ${item.color.name.toLowerCase()}`
			});
		}
		return {
			score,
			reasons
		};
	}
	function pairReasons(top, bottom, req, target) {
		const reasons = [];
		let score = 0;
		const h = harmonyScore(top.color, bottom.color);
		score += h * .8;
		const famTop = colorFamily(top.color.name, top.color.hex);
		const famBottom = colorFamily(bottom.color.name, bottom.color.hex);
		if (h >= .8 && (famTop === "neutral" || famBottom === "neutral")) {
			const neutral = famBottom === "neutral" ? bottom : top;
			const other = neutral === bottom ? top : bottom;
			reasons.push({
				weight: .5,
				text: `${neutral.color.name.toLowerCase()} grounds the ${other.color.name.toLowerCase()} ${labelOf(other)}`
			});
		} else if (h >= .45) reasons.push({
			weight: .4,
			text: `${top.color.name.toLowerCase()} and ${bottom.color.name.toLowerCase()} complement each other`
		});
		const patterned = (i) => i.pattern && i.pattern !== "solid" && i.pattern !== "denim" && i.pattern !== "textured";
		if (patterned(top) && patterned(bottom)) score -= .45;
		else if (patterned(top) || patterned(bottom)) {
			score += .1;
			const p = patterned(top) ? top : bottom;
			reasons.push({
				weight: .2,
				text: `the ${p.pattern} ${labelOf(p)} adds interest against a plain partner`
			});
		}
		const gap = Math.abs(formalityOf(top) - formalityOf(bottom));
		score -= gap * .18;
		if (gap <= 1 && Math.abs((formalityOf(top) + formalityOf(bottom)) / 2 - target) <= 1) reasons.push({
			weight: .3,
			text: `both pieces suit ${OCCASION_LABELS[req.occasion].toLowerCase()} dress codes`
		});
		return {
			score,
			reasons
		};
	}
	function pickShoes(shoes, bottom, req, target) {
		let best;
		let bestScore = -Infinity;
		for (const s of shoes) {
			let sc = scoreItem(s, req, target).score;
			if (bottom) sc += harmonyScore(s.color, bottom.color) * .3;
			if (sc > bestScore) {
				bestScore = sc;
				best = s;
			}
		}
		return bestScore > .2 ? best : void 0;
	}
	function capitalise(s) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
	function suggestOutfitsByRules(items, req) {
		const count = Math.max(1, Math.min(req.count ?? 3, 8));
		const target = (OCCASION_FORMALITY[req.occasion] + STYLE_FORMALITY[req.style]) / 2;
		const by = (g) => items.filter((i) => i.group === g && i.color && i.subcategory);
		const tops = by("upperWear");
		const bottoms = by("bottomWear");
		const onePieces = by("onePieces");
		const shoes = by("shoes");
		const candidates = [];
		const topScores = new Map(tops.map((t) => [t.id, scoreItem(t, req, target)]));
		const bottomScores = new Map(bottoms.map((b) => [b.id, scoreItem(b, req, target)]));
		for (const top of tops) for (const bottom of bottoms) {
			const ts = topScores.get(top.id);
			const bs = bottomScores.get(bottom.id);
			const pair = pairReasons(top, bottom, req, target);
			candidates.push({
				top,
				bottom,
				score: ts.score + bs.score + pair.score,
				reasons: [
					...pair.reasons,
					...ts.reasons,
					...bs.reasons
				]
			});
		}
		for (const one of onePieces) {
			const s = scoreItem(one, req, target);
			candidates.push({
				one,
				score: s.score * 2 + .3,
				reasons: [{
					weight: .3,
					text: `a one-piece keeps it effortless`
				}, ...s.reasons]
			});
		}
		candidates.sort((a, b) => b.score - a.score);
		const usedTop = /* @__PURE__ */ new Map();
		const usedBottom = /* @__PURE__ */ new Map();
		const picked = [];
		for (const c of candidates) {
			if (picked.length >= count) break;
			if (c.top && (usedTop.get(c.top.id) ?? 0) >= 1) continue;
			if (c.bottom && (usedBottom.get(c.bottom.id) ?? 0) >= 2) continue;
			picked.push(c);
			if (c.top) usedTop.set(c.top.id, (usedTop.get(c.top.id) ?? 0) + 1);
			if (c.bottom) usedBottom.set(c.bottom.id, (usedBottom.get(c.bottom.id) ?? 0) + 1);
		}
		if (picked.length < count) for (const c of candidates) {
			if (picked.length >= count) break;
			if (!picked.includes(c)) picked.push(c);
		}
		const maxScore = picked[0]?.score ?? 1;
		return picked.map((c) => {
			const shoe = pickShoes(shoes, c.bottom ?? c.one, req, target);
			const unique = /* @__PURE__ */ new Map();
			for (const r of c.reasons) if (!unique.has(r.text)) unique.set(r.text, r);
			const top2 = [...unique.values()].sort((a, b) => b.weight - a.weight).slice(0, 2).map((r) => r.text);
			const reason = top2.length ? capitalise(top2.join(", and ")) + "." : `A balanced ${LOOK_NAMES[req.style].toLowerCase()} combination from your wardrobe.`;
			const title = c.one ? `${c.one.color.name} ${labelOf(c.one)}` : `${c.top.color.name} ${labelOf(c.top)} with ${c.bottom.color.name.toLowerCase()} ${labelOf(c.bottom)}`;
			return {
				upperId: c.top?.id,
				bottomId: c.bottom?.id,
				onePieceId: c.one?.id,
				shoesId: shoe?.id,
				title,
				look: `${LOOK_NAMES[req.style]} ${OCCASION_LABELS[req.occasion].toLowerCase()} look`,
				reason,
				score: Math.max(0, Math.min(1, maxScore > 0 ? c.score / (maxScore * 1.05) : .5))
			};
		});
	}
	/** Validate that a suggestion only uses garments present in the wardrobe. */
	function isValidSuggestion(s, items) {
		const byId = new Map(items.map((i) => [i.id, i]));
		const check = (id, group) => !id || byId.get(id)?.group === group;
		return (Boolean(s.onePieceId) || Boolean(s.upperId) && Boolean(s.bottomId)) && check(s.upperId, "upperWear") && check(s.bottomId, "bottomWear") && check(s.onePieceId, "onePieces") && check(s.shoesId, "shoes");
	}
	exports.AI_CONSENT_VERSION = AI_CONSENT_VERSION;
	exports.ALL_SUBCATEGORY_IDS = ALL_SUBCATEGORY_IDS;
	exports.ERROR_CODES = ERROR_CODES;
	exports.EXTRACT_STAGES = EXTRACT_STAGES;
	exports.GARMENT_GROUPS = GARMENT_GROUPS;
	exports.GARMENT_STAGES = GARMENT_STAGES;
	exports.GROUP_LABELS = GROUP_LABELS;
	exports.JOB_TYPES = JOB_TYPES;
	exports.LIMITS = LIMITS;
	exports.OCCASIONS = OCCASIONS;
	exports.OCCASION_LABELS = OCCASION_LABELS;
	exports.PALETTE = PALETTE;
	exports.PALETTE_NAMES = PALETTE_NAMES;
	exports.PATTERNS = PATTERNS;
	exports.PATTERN_LABELS = PATTERN_LABELS;
	exports.SEASONS = SEASONS;
	exports.SEASON_LABELS = SEASON_LABELS;
	exports.STYLES = STYLES;
	exports.STYLE_LABELS = STYLE_LABELS;
	exports.STYLIST_STYLES = STYLIST_STYLES;
	exports.SUBCATEGORIES = SUBCATEGORIES;
	exports.TRY_ON_GROUPS = TRY_ON_GROUPS;
	exports.TRY_ON_STAGES = TRY_ON_STAGES;
	exports.WEATHER = WEATHER;
	exports.WEATHER_LABELS = WEATHER_LABELS;
	exports.colorFamily = colorFamily;
	exports.deltaE = deltaE;
	exports.findSubcategory = findSubcategory;
	exports.groupForRegion = groupForRegion;
	exports.harmonyScore = harmonyScore;
	exports.hexToRgb = hexToRgb;
	exports.hueOf = hueOf;
	exports.isValidSuggestion = isValidSuggestion;
	exports.luminance = luminance;
	exports.nearestPaletteColor = nearestPaletteColor;
	exports.paletteByName = paletteByName;
	exports.paths = paths;
	exports.rgbToHex = rgbToHex;
	exports.rgbToLab = rgbToLab;
	exports.subcategoryLabel = subcategoryLabel;
	exports.suggestOutfitsByRules = suggestOutfitsByRules;
	return exports;
})({});

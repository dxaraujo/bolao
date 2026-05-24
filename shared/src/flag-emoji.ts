/**
 * Converte código TLA (ISO 3166-1 alpha-3, ex.: "BRA") em emoji de bandeira nacional.
 *
 * Estratégia: tabela alpha-3 → alpha-2 das nações com seleções de futebol mais relevantes,
 * e composição via regional indicator symbols.
 *
 * Retorna `null` se desconhecido — backend/frontend caem para `team.crest`.
 */

const ALPHA3_TO_ALPHA2: Record<string, string> = {
	// América do Sul
	ARG: 'AR', BOL: 'BO', BRA: 'BR', CHI: 'CL', COL: 'CO', ECU: 'EC', PAR: 'PY', PER: 'PE', URU: 'UY', VEN: 'VE',
	// CONCACAF
	CAN: 'CA', CRC: 'CR', CUB: 'CU', DOM: 'DO', GUA: 'GT', HAI: 'HT', HON: 'HN', JAM: 'JM',
	MEX: 'MX', PAN: 'PA', SLV: 'SV', TRI: 'TT', USA: 'US',
	// Europa
	ALB: 'AL', AUT: 'AT', BEL: 'BE', BIH: 'BA', BUL: 'BG', CRO: 'HR', CYP: 'CY', CZE: 'CZ',
	DEN: 'DK', ENG: 'GB', ESP: 'ES', EST: 'EE', FIN: 'FI', FRA: 'FR', GEO: 'GE', GER: 'DE',
	GRE: 'GR', HUN: 'HU', IRL: 'IE', ISL: 'IS', ITA: 'IT', KOS: 'XK', LAT: 'LV', LTU: 'LT',
	LUX: 'LU', MDA: 'MD', MKD: 'MK', MLT: 'MT', MNE: 'ME', NED: 'NL', NIR: 'GB', NOR: 'NO',
	POL: 'PL', POR: 'PT', ROU: 'RO', RUS: 'RU', SCO: 'GB', SMR: 'SM', SRB: 'RS', SUI: 'CH',
	SVK: 'SK', SVN: 'SI', SWE: 'SE', TUR: 'TR', UKR: 'UA', WAL: 'GB',
	// África
	ALG: 'DZ', ANG: 'AO', BFA: 'BF', BUR: 'BI', CGO: 'CG', CIV: 'CI', CMR: 'CM',
	COD: 'CD', CPV: 'CV', EGY: 'EG', GAB: 'GA', GAM: 'GM', GHA: 'GH', GNB: 'GW',
	GUI: 'GN', KEN: 'KE', LBR: 'LR', LBY: 'LY', LES: 'LS', MAD: 'MG', MAR: 'MA',
	MLI: 'ML', MOZ: 'MZ', MRI: 'MU', MTN: 'MR', MWI: 'MW', NAM: 'NA', NGA: 'NG',
	NIG: 'NE', RWA: 'RW', SEN: 'SN', SLE: 'SL', SOM: 'SO', SSD: 'SS', SUD: 'SD',
	TAN: 'TZ', TOG: 'TG', TUN: 'TN', UGA: 'UG', ZAM: 'ZM', ZIM: 'ZW', RSA: 'ZA',
	// Ásia
	AFG: 'AF', BAN: 'BD', BRN: 'BN', BHR: 'BH', BHU: 'BT', CHN: 'CN', HKG: 'HK', IDN: 'ID',
	IND: 'IN', IRN: 'IR', IRQ: 'IQ', ISR: 'IL', JOR: 'JO', JPN: 'JP', KAZ: 'KZ', KGZ: 'KG',
	KOR: 'KR', KSA: 'SA', KUW: 'KW', LBN: 'LB', MAS: 'MY', MNG: 'MN', MYA: 'MM', NEP: 'NP',
	OMA: 'OM', PAK: 'PK', PHI: 'PH', PLE: 'PS', PRK: 'KP', QAT: 'QA', SIN: 'SG', SRI: 'LK',
	SYR: 'SY', THA: 'TH', TJK: 'TJ', TKM: 'TM', TLS: 'TL', UAE: 'AE', UZB: 'UZ', VIE: 'VN', YEM: 'YE',
	// Oceania
	AUS: 'AU', FIJ: 'FJ', NCL: 'NC', NZL: 'NZ', PNG: 'PG', SOL: 'SB', TAH: 'PF', VAN: 'VU',
}

/** Converte alpha-2 ("BR") em par de regional indicators (🇧🇷). */
const alpha2ToEmoji = (alpha2: string): string => {
	const A = 0x1f1e6 - 0x41
	return String.fromCodePoint(...alpha2.toUpperCase().split('').map((c) => c.charCodeAt(0) + A))
}

/** Retorna o emoji da bandeira para o TLA dado, ou null se desconhecido. */
export const tlaToFlagEmoji = (tla?: string | null): string | null => {
	if (!tla) return null
	const a2 = ALPHA3_TO_ALPHA2[tla.toUpperCase()]
	return a2 ? alpha2ToEmoji(a2) : null
}

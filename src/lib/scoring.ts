/**
 * Rule-based message checker (spec §7). Educational only — it never sees a real
 * scam database, so the UI must always show the "not a guaranteed detector" note.
 *
 * 0 indicators -> LIKELY_SAFE · 1-2 -> BE_CAREFUL · 3+ -> POTENTIAL_SCAM
 */
export type Verdict = "LIKELY_SAFE" | "BE_CAREFUL" | "POTENTIAL_SCAM";

export type Indicator = { key: string; label: string; labelHi: string; test: RegExp };

export const INDICATORS: Indicator[] = [
  { key: "urgency", label: "Creates urgency or fear", labelHi: "जल्दबाज़ी या डर पैदा करता है", test: /\b(urgent|immediately|today|tonight|now|blocked|suspend(ed)?|expire(s|d)?|last chance|within \d+ hours?|24 hours)\b|अभी|तुरंत|आज ही/i },
  { key: "link", label: "Contains a link or short URL", labelHi: "लिंक या छोटा URL शामिल है", test: /https?:\/\/|www\.|\bbit\.ly\b|\.xyz\b|\.top\b|\.click\b|\.link\b|उसके\s*(लिंक|नंबर)/i },
  { key: "otp", label: "Asks for OTP, PIN, password or CVV", labelHi: "OTP, पिन, पासवर्ड या CVV माँगता है", test: /\b(otp|one time password|\bpin\b|password|passcode|cvv|atm card number|card ke (front|back))\b|पिन|ओटीपी/i },
  { key: "money", label: "Asks for money, a fee or a deposit", labelHi: "पैसे, फ़ीस या जमा राशि माँगता है", test: /\b(pay|send money|transfer|advance|fee|charges?|deposit|registration (fee|amount)|processing charge|refund)\b|पैसे भेज|फ़ीस|जमा कर/i },
  { key: "authority", label: "Claims to be an official or authority", labelHi: "सरकारी या अधिकारी होने का दावा करता है", test: /\b(bank|police|rbi|kyc|kyc|customs|trai|epfo|uidai|income tax|cyber cell|manager|customer care|customer support|government|govt|sarkar)\b|बैंक|पुलिस|सरकार/i },
  { key: "bait", label: "Prize, lottery or too-good-to-be-true offer", labelHi: "इनाम, लॉटरी या बहुत बड़ा ऑफर", test: /\b(won|winner|lottery|prize|reward|free|cashback|offer|discount|voucher|gift|congratulations)\b|लोटरी|इनाम|मुफ़्त|रुपये/i },
  { key: "qr", label: "Asks you to scan a QR code", labelHi: "क्यूआर कोड स्कैन करने को कहता है", test: /\b(scan (this|the) qr|qr code|आप एक बार स्कैन करें|स्कैन करें और)\b|क्यूआर/i },
  { key: "remote", label: "Asks you to install an app or share your screen", labelHi: "ऐप इंस्टॉल करने या स्क्रीन साझा करने को कहता है", test: /\b(download this app|install (the )?app|anydesk|quick support|remote access|share your screen|screen share|terms & conditions)\b|ऐप डाउनलोड/i },
  { key: "personal", label: "Asks for personal details or documents", labelHi: "व्यक्तिगत जानकारी या कागज़ात माँगता है", test: /\b(aadhaar|pan card|account number|ifsc|passbook|photo of (your )?card|selfie|address proof|date of birth)\b|आधार|पैन कार्ड/i },
];

export type ScoreResult = { indicators: Indicator[]; count: number; verdict: Verdict };

export function score(text: string): ScoreResult {
  const trimmed = (text ?? "").trim();
  const hits = INDICATORS.filter((i) => i.test.test(trimmed));
  const count = hits.length;
  return { indicators: hits, count, verdict: count >= 3 ? "POTENTIAL_SCAM" : count === 0 ? "LIKELY_SAFE" : "BE_CAREFUL" };
}

/** Scenario scoring for the simulator: identical 0/1 -> safe, 2+ -> scam rule. */
export function scoreScenario(text: string): { count: number; isScam: boolean } {
  const count = INDICATORS.filter((i) => i.test.test(text ?? "")).length;
  return { count, isScam: count >= 2 };
}
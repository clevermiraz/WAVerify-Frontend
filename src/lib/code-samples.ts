/** Request examples shown in the API documentation. */

import type { CodeSample } from "@/components/docs/code-tabs";

/** Public address of the API. Every documented path hangs off this. */
export const API_BASE_URL = "https://api.waverify.app";

const ENDPOINT = `${API_BASE_URL}/api/v1/check`;

export const CHECK_SAMPLES: CodeSample[] = [
  {
    label: "cURL",
    value: "curl",
    code: `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: wav_live_your_api_key" \\
  -d '{"phone": "+8801712345678"}'`,
  },
  {
    label: "JavaScript",
    value: "javascript",
    code: `const response = await fetch("${ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.WAVERIFY_API_KEY,
  },
  body: JSON.stringify({ phone: "+8801712345678" }),
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(\`\${error.code}: \${error.message}\`);
}

const result = await response.json();
console.log(result.exists, result.display_name);`,
  },
  {
    label: "Python",
    value: "python",
    code: `import os
import requests

response = requests.post(
    "${ENDPOINT}",
    headers={"X-API-Key": os.environ["WAVERIFY_API_KEY"]},
    json={"phone": "+8801712345678"},
    timeout=10,
)

if not response.ok:
    error = response.json()["error"]
    raise RuntimeError(f"{error['code']}: {error['message']}")

result = response.json()
print(result["exists"], result["display_name"])`,
  },
  {
    label: "PHP",
    value: "php",
    code: `<?php

$ch = curl_init("${ENDPOINT}");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-API-Key: " . getenv("WAVERIFY_API_KEY"),
    ],
    CURLOPT_POSTFIELDS => json_encode(["phone" => "+8801712345678"]),
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($status !== 200) {
    throw new RuntimeException($result["error"]["message"]);
}

echo $result["exists"] ? "On WhatsApp" : "Not found";`,
  },
];

export const CHECK_WITH_EMAIL_SAMPLE = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: wav_live_your_api_key" \\
  -d '{"phone": "+8801712345678", "email": "someone@example.com"}'`;

export const SUCCESS_RESPONSE = `{
  "success": true,
  "phone": "+8801712345678",
  "exists": true,
  "display_name": "Acme Store",
  "name_source": "business_verified",
  "about": "Open 9-6, Sat closed",
  "business": true,
  "profile_photo": "https://cdn.waverify.app/p/9f2c.jpg",
  "profile_photo_id": "1721728451",
  "device_count": 2,
  "number_info": {
    "country_code": "+880",
    "region": "BD",
    "location": "Bangladesh",
    "carrier": "Grameenphone",
    "line_type": "mobile",
    "timezones": ["Asia/Dhaka"],
    "international_format": "+880 1712-345678",
    "national_format": "01712-345678"
  },
  "email_info": null,
  "gravatar": null,
  "response_time_ms": 214,
  "cached": false,
  "checked_at": "2026-07-23T10:04:11Z"
}`;

export const NOT_FOUND_RESPONSE = `{
  "success": true,
  "phone": "+14155552671",
  "exists": false,
  "display_name": null,
  "name_source": null,
  "about": null,
  "business": false,
  "profile_photo": null,
  "profile_photo_id": null,
  "device_count": null,
  "number_info": {
    "country_code": "+1",
    "region": "US",
    "location": "San Francisco, CA",
    "carrier": null,
    "line_type": "fixed_line_or_mobile",
    "timezones": ["America/Los_Angeles"],
    "international_format": "+1 415-555-2671",
    "national_format": "(415) 555-2671"
  },
  "email_info": null,
  "gravatar": null,
  "response_time_ms": 187,
  "cached": false,
  "checked_at": "2026-07-23T10:04:12Z"
}`;

export const CHECK_EMAIL_SAMPLE = `curl -X POST ${ENDPOINT}/email \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: wav_live_your_api_key" \\
  -d '{"email": "someone@example.com"}'`;

export const CHECK_EMAIL_RESPONSE = `{
  "success": true,
  "email": "jane@acme.com",
  "email_info": {
    "email": "jane@acme.com",
    "syntax_valid": true,
    "domain": "acme.com",
    "deliverable": true,
    "mx_hosts": ["mx.acme.com"],
    "disposable": false,
    "role_account": false,
    "free_provider": false,
    "status": "valid",
    "reason": null
  },
  "gravatar": null,
  "response_time_ms": 96,
  "cached": false,
  "checked_at": "2026-07-29T10:04:11Z"
}`;

export const EMAIL_INFO_RESPONSE = `{
  "email": "jane@acme.com",
  "syntax_valid": true,
  "domain": "acme.com",
  "deliverable": true,
  "mx_hosts": ["mx.acme.com"],
  "disposable": false,
  "role_account": false,
  "free_provider": false,
  "status": "valid",
  "reason": null
}`;

/** A bad address is answered, not rejected — this is still a 200. */
export const EMAIL_INFO_INVALID_RESPONSE = `{
  "email": "jane@@acme",
  "syntax_valid": false,
  "domain": "acme",
  "deliverable": null,
  "mx_hosts": [],
  "disposable": false,
  "role_account": false,
  "free_provider": false,
  "status": "invalid_syntax",
  "reason": "The part after the @-sign contains invalid characters: '@'."
}`;

export const GRAVATAR_RESPONSE = `{
  "display_name": "Jane Roe",
  "about": "Product designer.",
  "location": "Dhaka, Bangladesh",
  "job_title": "Designer",
  "company": "Acme",
  "pronouns": null,
  "avatar_url": "https://gravatar.com/avatar/…",
  "profile_url": "https://gravatar.com/janeroe",
  "verified_accounts": [
    { "service": "Twitter", "url": "https://twitter.com/janeroe" },
    { "service": "LinkedIn", "url": "https://linkedin.com/in/janeroe" }
  ]
}`;

export const ERROR_RESPONSE = `{
  "success": false,
  "error": {
    "code": "quota_exceeded",
    "message": "You have used all 100 requests included in the Free plan this period.",
    "details": {}
  }
}`;

export const RESPONSE_FIELDS = [
  {
    name: "success",
    type: "boolean",
    description: "Always true when the request worked.",
  },
  {
    name: "phone",
    type: "string",
    description:
      "The number you sent, rewritten in the standard international format.",
  },
  {
    name: "exists",
    type: "boolean",
    description: "true if this number has a WhatsApp account.",
  },
  {
    name: "display_name",
    type: "string | null",
    description:
      "The name on the account. Business accounts have one. Personal accounts are usually null — WhatsApp does not give a stranger the name. This is normal, not an error.",
  },
  {
    name: "name_source",
    type: "string | null",
    description:
      "Where the name came from: business_verified, business_name or contact_name. null when there is no name.",
  },
  {
    name: "about",
    type: "string | null",
    description:
      "The short “about” text on the account. null if the account hides it.",
  },
  {
    name: "business",
    type: "boolean",
    description: "true if this is a WhatsApp Business account.",
  },
  {
    name: "profile_photo",
    type: "string | null",
    description:
      "Link to the profile picture. null if the account hides it. The link stops working after a few hours, so download the picture if you need to keep it.",
  },
  {
    name: "profile_photo_id",
    type: "string | null",
    description:
      "An id for the current picture. It changes when the account changes its picture, so you can save it and see when the picture is new.",
  },
  {
    name: "device_count",
    type: "integer | null",
    description:
      "How many devices the account uses. 1 means the phone only. More means WhatsApp Web or Desktop is also linked. null if we could not tell.",
  },
  {
    name: "number_info",
    type: "object",
    description:
      "Facts about the number itself. Always there, even when the number has no WhatsApp account. See “Number details”.",
  },
  {
    name: "email_info",
    type: "object | null",
    description:
      "Our verdict on the email you sent: whether it is a real address, and whether its domain can receive mail. null if you sent no email. See “Email lookup”.",
  },
  {
    name: "gravatar",
    type: "object | null",
    description:
      "The public Gravatar profile for the email you sent. null if you sent no email, the address was malformed, or it has no profile. See “Email lookup”.",
  },
  {
    name: "response_time_ms",
    type: "integer",
    description: "How long the check took on our server, in milliseconds.",
  },
  {
    name: "cached",
    type: "boolean",
    description:
      "true if we answered from a saved recent result instead of checking again.",
  },
  {
    name: "checked_at",
    type: "string",
    description: "Date and time of the check, in UTC.",
  },
];

export const NUMBER_INFO_FIELDS = [
  {
    name: "country_code",
    type: "string | null",
    description: "The country calling code, for example +880.",
  },
  {
    name: "region",
    type: "string | null",
    description: "Two-letter country code, for example BD.",
  },
  {
    name: "location",
    type: "string | null",
    description: "The country, or the city when we know it.",
  },
  {
    name: "carrier",
    type: "string | null",
    description:
      "The mobile network. null for landlines and for numbers that moved to another network.",
  },
  {
    name: "line_type",
    type: "string",
    description:
      "The kind of line. Always has a value — unknown when we cannot tell.",
  },
  {
    name: "timezones",
    type: "string[]",
    description:
      "Time zones for this number, for example [\"Asia/Dhaka\"]. Can be empty.",
  },
  {
    name: "international_format",
    type: "string | null",
    description: "The number written for use from any country.",
  },
  {
    name: "national_format",
    type: "string | null",
    description: "The number written the way people write it at home.",
  },
];

/** Every value `number_info.line_type` can take. */
export const LINE_TYPES = [
  "mobile",
  "fixed_line",
  "fixed_line_or_mobile",
  "toll_free",
  "premium_rate",
  "shared_cost",
  "personal_number",
  "pager",
  "uan",
  "voicemail",
  "unknown",
];

export const EMAIL_INFO_FIELDS = [
  {
    name: "email",
    type: "string",
    description: "The address you sent, lowercased and tidied up.",
  },
  {
    name: "syntax_valid",
    type: "boolean",
    description: "true if the address is written correctly and could exist.",
  },
  {
    name: "domain",
    type: "string | null",
    description:
      "The part after the @. Treat it as a guess when syntax_valid is false.",
  },
  {
    name: "deliverable",
    type: "boolean | null",
    description:
      "true if the domain has a mail server, false if it does not. null means we could not find out — that is not the same as false, so do not treat it as a bad address.",
  },
  {
    name: "mx_hosts",
    type: "string[]",
    description:
      "The domain's mail servers, best first. Empty when there are none.",
  },
  {
    name: "disposable",
    type: "boolean",
    description:
      "true for a known throwaway-inbox service. These do receive mail, which is exactly why it is worth knowing.",
  },
  {
    name: "role_account",
    type: "boolean",
    description:
      "true for a shared mailbox like info@ or support@. Real, but no one person behind it.",
  },
  {
    name: "free_provider",
    type: "boolean",
    description:
      "true for a consumer provider such as Gmail. Normal for a personal address.",
  },
  {
    name: "status",
    type: "string",
    description:
      "One word for the whole verdict: valid, invalid_syntax, domain_not_found, no_mail_server, disposable, or unknown.",
  },
  {
    name: "reason",
    type: "string | null",
    description: "A sentence explaining status. null when the address is fine.",
  },
];

/** Every value `email_info.status` can take. */
export const EMAIL_STATUSES = [
  "valid",
  "invalid_syntax",
  "domain_not_found",
  "no_mail_server",
  "disposable",
  "unknown",
];

export const GRAVATAR_FIELDS = [
  {
    name: "display_name",
    type: "string | null",
    description: "The name on the Gravatar profile.",
  },
  {
    name: "about",
    type: "string | null",
    description: "The short text the person wrote about themselves.",
  },
  {
    name: "location",
    type: "string | null",
    description: "Where the person says they are.",
  },
  {
    name: "job_title",
    type: "string | null",
    description: "Their job title.",
  },
  {
    name: "company",
    type: "string | null",
    description: "Where they work.",
  },
  {
    name: "pronouns",
    type: "string | null",
    description: "The pronouns they list.",
  },
  {
    name: "avatar_url",
    type: "string | null",
    description: "Link to their picture.",
  },
  {
    name: "profile_url",
    type: "string | null",
    description: "Link to the full Gravatar profile.",
  },
  {
    name: "verified_accounts",
    type: "array",
    description:
      "Other accounts they have proven are theirs. Each item has service and url. Can be empty.",
  },
];

export const ERROR_CODES = [
  {
    status: "401",
    code: "authentication_failed",
    description: "Your API key is missing, wrong, or was deleted.",
  },
  {
    status: "402",
    code: "quota_exceeded",
    description: "You have used all the requests in your plan this month.",
  },
  {
    status: "403",
    code: "email_not_verified",
    description: "You have not confirmed your email address yet.",
  },
  {
    status: "422",
    code: "validation_error",
    description: "The phone number is missing, or it is not a real number.",
  },
  {
    status: "429",
    code: "rate_limit_exceeded",
    description: "You sent too many requests in one minute. Wait, then retry.",
  },
  {
    status: "502",
    code: "provider_error",
    description:
      "Our WhatsApp connection is down right now. Please try again soon.",
  },
];

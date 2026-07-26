/** Request examples shown in the API documentation. */

import type { CodeSample } from "@/components/docs/code-tabs";

const ENDPOINT = "https://api.waverify.dev/api/v1/check";

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

export const SUCCESS_RESPONSE = `{
  "success": true,
  "phone": "+8801712345678",
  "exists": true,
  "display_name": "John Doe",
  "about": "Software Engineer",
  "business": false,
  "profile_photo": "https://cdn.waverify.dev/p/9f2c.jpg",
  "response_time_ms": 214,
  "cached": false,
  "checked_at": "2026-07-23T10:04:11Z"
}`;

export const NOT_FOUND_RESPONSE = `{
  "success": true,
  "phone": "+14155552671",
  "exists": false,
  "display_name": null,
  "about": null,
  "business": false,
  "profile_photo": null,
  "response_time_ms": 187,
  "cached": false,
  "checked_at": "2026-07-23T10:04:12Z"
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
    description: "Always true for a 2xx response.",
  },
  {
    name: "phone",
    type: "string",
    description: "The number, normalised to E.164.",
  },
  {
    name: "exists",
    type: "boolean",
    description: "Whether the number has a WhatsApp account.",
  },
  {
    name: "display_name",
    type: "string | null",
    description: "Public display name, when the account publishes one.",
  },
  {
    name: "about",
    type: "string | null",
    description: "The account's about/status text, when public.",
  },
  {
    name: "business",
    type: "boolean",
    description: "True for WhatsApp Business accounts.",
  },
  {
    name: "profile_photo",
    type: "string | null",
    description: "URL of the profile photo, when publicly available.",
  },
  {
    name: "response_time_ms",
    type: "integer",
    description: "Server-side processing time for this lookup.",
  },
  {
    name: "cached",
    type: "boolean",
    description: "True when served from the recent-result cache.",
  },
  {
    name: "checked_at",
    type: "string",
    description: "ISO 8601 timestamp of the lookup.",
  },
];

export const ERROR_CODES = [
  {
    status: "401",
    code: "authentication_failed",
    description: "The API key is missing, malformed or revoked.",
  },
  {
    status: "402",
    code: "quota_exceeded",
    description: "The plan's monthly request allowance is used up.",
  },
  {
    status: "403",
    code: "email_not_verified",
    description: "The account's email address has not been confirmed.",
  },
  {
    status: "422",
    code: "validation_error",
    description:
      "The phone number is missing, malformed or not a valid number.",
  },
  {
    status: "429",
    code: "rate_limit_exceeded",
    description: "Too many requests in the current minute for this plan.",
  },
  {
    status: "502",
    code: "provider_error",
    description:
      "The upstream verification provider is temporarily unavailable.",
  },
];

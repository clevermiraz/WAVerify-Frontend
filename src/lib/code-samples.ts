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

export const SUCCESS_RESPONSE = `{
  "success": true,
  "phone": "+8801712345678",
  "exists": true,
  "display_name": "John Doe",
  "about": "Software Engineer",
  "business": false,
  "profile_photo": "https://cdn.waverify.app/p/9f2c.jpg",
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
    description: "The name on the account. null if the account hides it.",
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
    description: "Link to the profile picture. null if the account hides it.",
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

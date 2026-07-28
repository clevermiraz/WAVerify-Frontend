"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What exactly does a lookup tell me?",
    answer:
      "Whether the number is registered on WhatsApp, and when it is: the public display name, the about text, whether it is a Business account, and a profile photo URL when one is publicly available.",
  },
  {
    question: "What format should phone numbers be in?",
    answer:
      "International format with a country code, for example +8801712345678. Spaces, dashes and brackets are accepted and stripped. A number without a country code is rejected rather than guessed at.",
  },
  {
    question: "How fast is it?",
    answer:
      "Typical lookups complete in a few hundred milliseconds. Repeat checks of the same number within the cache window return in single-digit milliseconds and are marked with a cached flag.",
  },
  {
    question: "What happens when I run out of credits?",
    answer:
      "The API returns HTTP 402 with a quota_exceeded error code, and the dashboard shows your credit balance. Buying any top-up pack restores service immediately. Credits never expire, so anything left over stays in your wallet.",
  },
  {
    question: "Do you store the numbers I look up?",
    answer:
      "Yes — your own search history is kept so you can review it in the dashboard, and it is only ever visible to your account. Deleting your account removes it along with everything else.",
  },
  {
    question: "What if I buy credits and the service isn't for me?",
    answer:
      "Email support@waverify.app within 30 days and we will refund it — no questions asked. If you have not spent any credits you get 100% of what you paid. If you have spent some, we deduct only those and refund the value of the credits you have left, at the rate you paid for them: use 1,500 of a 7,500-credit Starter pack and the remaining 6,000 come back as $7.20. Whatever is left is removed from your wallet when the refund is issued.",
  },
  {
    question: "Is this an official WhatsApp product?",
    answer:
      "No. WAVerify is an independent service and is not affiliated with, endorsed by, or connected to WhatsApp or Meta Platforms, Inc.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything else is in the{" "}
            <a
              href="/docs"
              className="text-foreground underline underline-offset-4"
            >
              API documentation
            </a>
            .
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

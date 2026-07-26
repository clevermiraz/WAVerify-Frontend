"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CodeSample {
  label: string;
  value: string;
  code: string;
}

export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  return (
    <Tabs defaultValue={samples[0].value}>
      <TabsList>
        {samples.map((sample) => (
          <TabsTrigger key={sample.value} value={sample.value}>
            {sample.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {samples.map((sample) => (
        <TabsContent key={sample.value} value={sample.value} className="mt-3">
          <CodeBlock code={sample.code} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

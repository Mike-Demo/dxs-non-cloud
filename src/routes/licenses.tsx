import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/States";

export const Route = createFileRoute("/licenses")({
  head: () => ({
    meta: [
      { title: "License \u2014 DXS" },
      { name: "description", content: "Licensing for the migrateme.tech toolkit, this test bed's content and fixtures, and credits." },
    ],
  }),
  component: Licenses,
});

function Licenses() {
  return (
    <>
      <PageHeader eyebrow="License" title="License and credits" intro="The code is open. The fixtures are shareable. The words are Demo's." />
      <section className="container-page mt-12 max-w-3xl">
        <h2 className="text-2xl">Code \u2014 MIT</h2>
        <p className="mt-3 text-muted-foreground">
          The migrateme.tech toolkit is released under the MIT License. Source and license text:{" "}
          <a className="underline" href="https://github.com/Mike-Demo/migrateme.tech">github.com/Mike-Demo/migrateme.tech</a>.
        </p>
      </section>
      <section className="container-page rule-top mt-12 max-w-3xl pt-5">
        <h2 className="text-2xl">Content and fixtures</h2>
        <p className="mt-3 text-muted-foreground">
          The posts, pages, products, events, and other content in this test bed are fixtures. You may reuse them for
          migration testing, demos, and education, with attribution to migrateme.tech. Site text is \u00a9 2026 Mike
          "Demo" Demopoulos.
        </p>
      </section>
      <section className="container-page rule-top mt-12 max-w-3xl pt-5">
        <h2 className="text-2xl">Credits</h2>
        <p className="mt-3 text-muted-foreground">
          DXS is based on a brief and content contracts originating from a prompt by Microsoft Copilot Cowork. This is
          the mock-data edition of DXS, built with Lovable. The WordPress edition lives at{" "}
          <a className="underline" href="https://wp.sandbox.migrateme.tech">wp.sandbox.migrateme.tech</a>; the parent
          project is <a className="underline" href="https://migrateme.tech">migrateme.tech</a>.
        </p>
      </section>
    </>
  );
}

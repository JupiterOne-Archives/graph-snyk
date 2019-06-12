import fs from "fs-extra";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const baseDocsPath = `docs/jupiterone-io/index`;

let docsExtension;
if (fs.pathExistsSync(`${baseDocsPath}.md`)) {
  docsExtension = "md";
} else if (fs.pathExistsSync(`${baseDocsPath}.rst`)) {
  docsExtension = "rst";
}

if (docsExtension !== undefined) {
  fs.copySync(
    `${baseDocsPath}.${docsExtension}`,
    `dist/docs/index.${docsExtension}`,
  );
  fs.writeFileSync(
    "dist/docs/metadata.json",
    JSON.stringify(
      {
        version: pkg.version,
      },
      null,
      2,
    ),
  );
} else {
  throw new Error("No documentation found!");
}

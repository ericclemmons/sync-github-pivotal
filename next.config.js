const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/
});

module.exports = withMDX({
  pageExtensions: ["mdx", "jsx", "js", "ts", "tsx"],
  target: "serverless"
});

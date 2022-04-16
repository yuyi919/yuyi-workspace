/** @type {import('@cmfcmf/docusaurus-search-local').MyOptions} */
const options = {
  // ... Your options.
  indexDocs: true,
  indexBlog: true,
  indexPages: true,
  language: "zh"
};
module.exports = [require.resolve("@cmfcmf/docusaurus-search-local"), options];

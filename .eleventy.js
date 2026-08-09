const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const CleanCSS = require("clean-css");
const { minify } = require("html-minifier");
const { minify: terserMinify } = require("terser");

module.exports = function (eleventyConfig) {
  // --- Plugins ---
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // --- Passthrough Copy ---
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy("src/js/lib");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/index.php": "index.php" });

  // --- CSS Filter ---
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({ level: 2 }).minify(code).styles;
  });

  // --- HTML Minify Transform ---
  // Disabled: html-minifier 4.x parse error on inline gradient spans
  /*eleventyConfig.addTransform("htmlmin", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: false,
        removeEmptyAttributes: true,
      });
    }
    return content;
  });*/

  // --- JS Minify Filter ---
  eleventyConfig.addFilter("jsmin", async function (code) {
    const result = await terserMinify(code, { compress: true, mangle: true });
    return result.code;
  });

  // --- Nunjucks Filters ---
  eleventyConfig.addFilter("slugify", (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  );

  // --- Watch targets ---
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");

  // --- Collections ---
  eleventyConfig.addCollection("services", (col) =>
    col.getFilteredByGlob("content/services/*.md").sort((a, b) =>
      a.data.order - b.data.order
    )
  );

  eleventyConfig.addCollection("blog", (col) =>
    col.getFilteredByGlob("content/blog/*.md").sort((a, b) =>
      b.date - a.date
    )
  );

  eleventyConfig.addCollection("caseStudies", (col) =>
    col.getFilteredByGlob("content/case-studies/*.md").sort((a, b) =>
      b.date - a.date
    )
  );

  eleventyConfig.addCollection("industries", (col) =>
    col.getFilteredByGlob("content/industries/*.md").sort((a, b) =>
      a.data.order - b.data.order
    )
  );

  return {
    dir: {
      input: "content",
      output: "_site",
      includes: "../src/_includes",
      layouts: "../src/_layouts",
      data: "../src/_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};

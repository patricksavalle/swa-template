export default function configureEleventy(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css/site.css": "css/site.css" });
  eleventyConfig.addPassthroughCopy({
    "img/**/*.{png,jpg,jpeg,gif,svg,webp,avif,ico}": "img"
  });
  eleventyConfig.addPassthroughCopy({
    "staticwebapp.config.json": "staticwebapp.config.json"
  });

  return {
    dir: {
      input: "html",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}

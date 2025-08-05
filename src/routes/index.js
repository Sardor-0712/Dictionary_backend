const  {categoryRouter }= require("./category/category.route");
const { dictionaryRouter } = require("./dictionary/dictionary.route");
const sectionRouter = require("./section/section.route");
const { uploadRouter } = require("./upload/upload.route");
const wordsRouter = require("./words/words.route");

const main_router = [
  { path: '/upload', router: uploadRouter },
  { path: '/dictionary', router: dictionaryRouter },
  { path: '/section', router: sectionRouter },
  { path: '/category', router: categoryRouter },
  { path: '/words', router: wordsRouter },
]

module.exports = { main_router };

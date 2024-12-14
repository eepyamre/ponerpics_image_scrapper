# Image Scrapper

## Quick Start

Set in the index.js file a link to the booru of your choice in the root const

```js
const root = 'https://ponerpics.org';
```

And set the `const url` to the page you want to start scraping from

```js
const url = `${root}/galleries/81`;
```

```sh
$ npm i # Install dependencies
$ npm run start # Run the script
```

## Attention

The script will continue loading images from all pages as long as a 'Next' button is present.

To disable this behavior, set `const autoNextPage = true;` to false.

### Dependencies

- node-html-parser

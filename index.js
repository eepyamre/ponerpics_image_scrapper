import fs from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import path from 'path';
import { parse } from 'node-html-parser';

const root = 'https://ponerpics.org';
const url = `${root}/galleries/81`;
const urls = [];
const autoNextPage = true;
let hadErrors = false;

(async () => {
  const getImages = async (url) => {
    const page = parse(await (await fetch(url)).text());
    const images = page.querySelectorAll('.image-container');
    const nextBtn = page.querySelector('.js-next');

    images.forEach((image) => {
      const uris = JSON.parse(image.getAttribute('data-uris') || '{}');
      const name = image.getAttribute('data-image-tag-aliases');
      const id = image.getAttribute('data-image-id');
      if (uris.full && name) {
        const parts = uris.full.split('/');
        const lastPart = parts[parts.length - 1];
        urls.push({
          name: `${`${id}_${name
            .replaceAll('/', '')
            .replaceAll(' ', '_')}`.slice(
            0,
            250 - lastPart.length - 1
          )}${lastPart}`,
          url: `${root}${uris.full}`,
        });
      }
    });
    if (autoNextPage && nextBtn) {
      await getImages(`${root}${nextBtn.getAttribute('href')}`);
    }
  };
  await getImages(url);
  const downloadImages = async () => {
    if (!fs.existsSync('images')) await mkdir('images');
    for (const obj of urls) {
      try {
        const res = await fetch(obj.url);
        const destination = path.resolve('./images', `${obj.name}`);
        if (fs.existsSync(destination)) continue;
        console.log(`Saving: ${destination}...\n`);
        const fileStream = fs.createWriteStream(destination);
        await finished(Readable.fromWeb(res.body).pipe(fileStream));
      } catch (e) {
        hadErrors = true;
        console.error(e);
      }
    }
  };
  await downloadImages();
  if (hadErrors) {
    console.log('\nFinished with errors!');
  }
})();

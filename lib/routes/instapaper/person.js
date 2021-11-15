import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        name
    } = ctx.params;
    const link = `https://www.instapaper.com/p/${name}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const out = $('article.article_item.article_browse')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.js_title_row.title_row a').attr('title'),
                link: $(this).find('div.js_title_row.title_row a').attr('href'),
                description: $(this).find('div.article_preview').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: `${name}-Instapaper分享`,
        link,
        item: out,
    };
};
import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

export default async (ctx) => {
    const { order = 'best' } = ctx.params;
    const link = `https://allpoetry.com/poems/about/spotlight-oldpoem?order=${order}}`;
    const host = 'https://allpoetry.com/';

    const {
        data
    } = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(data);

    const items = $('.sub')
        .get()
        .map((e) => {
            let itemUrl = $(e).find('h1.title > a').attr('href');

            itemUrl = url.resolve(host, itemUrl);

            const single = {
                title: $(e).find('h1.title > a').text(),
                description: $(e).find('div.poem_body').html(),
                link: itemUrl,
                author: $(e).find('div.bio >a ').attr('data-name'),
                guid: itemUrl,
            };

            return single;
        });

    ctx.state.data = {
        title: `All Poetry - ${order.toUpperCase() + order.slice(1)}`,
        link,
        item: items,
    };
};
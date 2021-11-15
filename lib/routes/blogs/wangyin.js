import {parseDate} from '~/utils/parse-date.js';
import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.yinwang.org';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $(`li[class='list-group-item title']`)
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text();
            const link = url + element.find('a').attr('href');
            const [dateraw] = /\d{4}\/\d{2}\/\d{2}/.exec(link);

            return {
                title,
                description: '',
                link,
                author: '王垠',
                pubDate: parseDate(dateraw, 'YYYY/MM/DD'),
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const {
                link
            } = item;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            item.description = itemElement('.inner').html();

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '王垠的博客 - 当然我在扯淡',
        link: url,
        item: result,
    };
};
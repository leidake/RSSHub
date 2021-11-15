import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date.js';

export default async (ctx) => {
    const url = 'https://www.psnine.com/psngame';

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(data);

    const out = $('table tr')
        .map(function () {
            const info = {
                title: $(this).find('.title a').text(),
                link: $(this).find('.title a').attr('href'),
                pubDate: date($(this).find('.meta').text()),
                description: $(this).find('.title span').text() + ' ' + $(this).find('.twoge').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: 'psnine-' + $('title').text(),
        link: 'https://www.psnine.com/',
        item: out,
    };
};
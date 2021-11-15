import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        period
    } = ctx.params;
    const link = `https://dev.to/top/${period}`;

    const getHTML = async () => {
        const response = await got({
            method: 'get',
            url: link,
        });

        return response.data;
    };

    const html = await ctx.cache.tryGet(link, getHTML);
    const posts = [];

    const $ = cheerio.load(html);
    $('div.crayons-story__body').each(function () {
        const post = {
            author: $('.crayons-story__secondary', this).text().trim().replace(/\s\s+/g, ', '),
            title: $('.crayons-story__title a', this).text().trim(),
            link: `https://dev.to${$('.crayons-story__title a', this).attr('href')}`,
            description: $('.crayons-story__tags', this).text().trim().replace(/\s\s+/g, ' '),
            pubDate: new Date($('.time-ago-indicator-initial-placeholder', this).attr('data-seconds') * 1000).toUTCString(),
        };

        posts.push(post);
    });

    ctx.state.data = {
        title: `dev.to top (${period})`,
        link,
        description: 'Top dev.to posts',
        language: 'en-us',
        item: posts,
    };
};
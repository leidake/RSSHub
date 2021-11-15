import got from '~/utils/got.js';
import {parseDate} from '~/utils/parse-date.js';
import cheerio from 'cheerio';
import CryptoJS from 'crypto-js';

const getRequestToken = () => {
    const t = 'jzhotdata';
    const e = 'sgn51n6r6q97o6g3';
    const n = CryptoJS.DES.encrypt(Date.now().toString() + '-' + e, t).toString();
    return encodeURIComponent(n);
};

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://vp.fact.qq.com/loadmore?artnum=0&page=0&token=${getRequestToken()}`,
        headers: {
            Referer: 'https://vp.fact.qq.com/home',
        },
    });

    const data = response.data.content;

    const items = await Promise.all(
        (data || []).map(async (item) => {
            const link = `https://vp.fact.qq.com/article?id=${item.id}`;
            const simple = {
                title: `【${item.explain}】${item.title}`,
                description: `<img src="${item.cover}">${item.abstract}`,
                pubDate: parseDate(item.date, 'YYYY-MM-DD'),
                author: item.author,
                link,
            };

            const details = await ctx.cache.tryGet(link, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);
                return {
                    description: `<img src="${item.cover}"><br>查证要点：${$('.check_content_points').html()}<br>${$('.check_content_writer').html()}`,
                };
            });
            return {
                ...simple,
                ...details
            };
        })
    );

    ctx.state.data = {
        title: '较真查证平台-腾讯新闻',
        link: 'https://vp.fact.qq.com/home',
        item: items,
    };
};
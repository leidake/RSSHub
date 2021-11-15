import utils from './utils.js';

export default async (ctx) => {
    const {
        team
    } = ctx.params;
    const link = `https://www.dongqiudi.com/team/${team}.html`;

    await utils.ProcessFeed(ctx, link, 'team');
};
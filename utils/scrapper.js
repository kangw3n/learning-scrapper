const cheerio = require('cheerio');
const getUrls = require('get-urls');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const moment = require('moment');
const {Service, Course } = require('../models');

const SERVICES_ACCOUNT = {
    async ['hexschool'](urls) {

        const requests = urls.map(async url => {

            const res = await fetch(url);
            const html = await res.text();

            const $ = cheerio.load(html);
            const allAvailableCourse = $(`.combinedSolution`);
            let data = [];
            allAvailableCourse.each((i, el) => {
                let element = $(el).find('.mp-click');
                let title = element.attr('data-title');
                let source = 'hexschool';
                let price = element.attr('data-price');
                let style = $(el).find('.combined-works div').attr('style')
                let img = style.substring(
                    style.lastIndexOf("(") + 1,
                    style.lastIndexOf(")")
                );
                let url = 'https://www.hexschool.com' + $(el).find('a[title="課程介紹"]').attr('href');
                if (!title) return {}
                data.push({
                    title,
                    price,
                    img,
                    url,
                    source
                })
            });

            return data;
        });
        return Promise.all(requests);
    },
    async ['hahow'](urls) {
        const requests = urls.map(async url => {

            const res = await fetch(url);
            const json = await res.json();

            let data = json.data.map(({ price, title, coverImage, _id }) => {
                return {
                    title,
                    price,
                    img: coverImage.url,
                    url: `https://hahow.in/courses/${_id}`,
                    source: 'hahow'

                }
            });
            return data;
        });

        return Promise.all(requests);
    },
    async ['udemy']() {
        const urlReturner = (page) => {
            return `https://www.udemy.com/api-2.0/discovery-units/all_courses/?p=${page}&page_size=60&subcategory=&instructional_level=&lang=&price=&duration=&closed_captions=&subcategory_id=8&source_page=subcategory_page&locale=en_US&currency=twd&navigation_locale=en_US&sos=ps&fl=scat`
        };

        const firstRes = await fetch(urlReturner(1));
        const firstJson = await firstRes.json();
        const pages = firstJson.unit.pagination.total_page;
        const data = [];

        const forLoop = async _ => {
            for (let index = 1; index <= 2; index++) {
                let res = await fetch(urlReturner(index));
                let json = await res.json();
                let items = json.unit.items;
                items.forEach(({ title, url, price, image_750x422 }) => {
                    let obj = {
                        title,
                        price,
                        url: 'https://udemy.com' + url,
                        img: image_750x422,
                        source: 'udemy'
                    };

                    data.push(obj);
                });
            }
        }

        await forLoop();

        return data;
    },
}

async function scrapStart() {
    console.log('Scrap Start');

    const serviceAvailable = [
        {
            type: 'hexschool',
            urls: ['https://www.hexschool.com/courses/']
        },
        {
            type: 'hahow',
            urls: ['https://api.hahow.in/api/group/programming/courses?page=1', 'https://api.hahow.in/api/group/programming/courses?page=2', 'https://api.hahow.in/api/group/programming/courses?page=3']
        }, 
        // {
        //     type: 'udemy',
        //     urls: ['https://www.udemy.com/courses/development/web-development/']
        // }
    ]

    let allData = await serviceAvailable.map(async (service) => {
        let scrap = await SERVICES_ACCOUNT[service.type](service.urls);
        return {
            source: service.type,
            data: scrap.flat()
        }
    });

    let fullfillData = await Promise.all(allData);
    // console.log(fullfillData);
    setCoursesToDatabase(fullfillData);

}

async function setCoursesToDatabase(courses) {
    const forLoop = async (courses) => {
        for (let index = 0; index < courses.length; index++) {

            let checkService = await Service.findOne({name: courses[index].source});
            let serviceId;
            if (checkService) {
                serviceId = checkService._id;
            } else {
                let newService = new Service({
                    name: courses[index].source,
                    updated_date: Date.now()
                });

                let myService = await newService.save();
                serviceId = myService._id;
            }

            let insertMapData = courses[index].data.map(course => {
                return {
                    ...course,
                    serviceId
                }
            });
            
            try {
                await Course.insertMany(insertMapData, { ordered: false });
            } catch (error) {
                console.error(error);
            } 

        }
    }

    await forLoop(courses);
}





module.exports = {
    scrapStart
}
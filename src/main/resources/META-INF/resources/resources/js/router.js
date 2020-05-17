/*
 * MIT License
 *
 * Copyright (c) 2020 Alexandros Gelbessis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

$(function () {
    $(window).on('load', async function (event) {
        let uidCookie = $.cms.utils.getCookie('UID');
        // when logging out we set it to null
        // init log for messages
        $.cms.log.init();
        if (!uidCookie || uidCookie === 'null' || uidCookie === 'undefined') {
            showLoginDialog();
        } else {
            await init();
        }
    })

    const init = async function () {

        const classes = [
            $.cms.utils,
            $.cms.dialog,
            $.cms.form,
            $.cms.auth,
            $.cms.table,
            $.cms.api,
            $.cms.context,
            $.cms.index,
            $.cms.upload,
            $.cms.header,
            // after the header
            $.cms.collection,
        ];

        // only some classes need to init, e.g. get data from the server
        for (let clazz of classes) {
            clazz.init ? await clazz.init() : null;
        }
        $(window).trigger('hashchange');
    }

    const showLoginDialog = function () {
        let loginModel = {
            fields: [
                {
                    name: 'name',
                    label: 'username'
                },
                {
                    name: 'password',
                    label: 'password',
                    type: 'secret'
                }
            ]
        };
        let form = $.cms.form.create(loginModel);
        let actions = [];
        let loginAction = {
            label: 'login',
            action: async function () {
                let user = form.getValues();
                if (user.name && user.password) {
                    $.cms.utils.loading();
                    await $.cms.api.login(user);
                    await init();
                    $.cms.utils.loading(true);
                    $.cms.log.info(`user '${user.name}' logged in`);
                    dialog.close();
                } else {
                    $.cms.log.info(`fill both 'name' and 'password'`);
                }
            }
        }
        actions.push(loginAction);
        let dialog = $.cms.dialog.create(`login to CMS`, form.contentE, actions);
        dialog.show();
    }


    let lastPage;
    $(window).on('hashchange', function (event) {
        // On every hash change the render function is called with the new
        // hash.
        let hash = window.location.hash.split('#')[1];
        if (hash) {
            let page = hash.split('&')[0];
            if (page !== lastPage) {
                $.cms.router.render(decodeURIComponent(window.location.hash));
            }
            lastPage = page;
        }
    });

    const queryParamsToMap = function (array) {
        let map = {};
        for (let item of array) {
            let tokens = item.split('=');
            map[tokens[0]] = tokens[1];
        }
        return map;
    }

    const Constructor = function () {

        const render = function (url) {
            $('.cms-container').hide();

            const hash = url.split('#')[1];
            let pageE;
            let page;
            let title;
            let valuesMap;
            if (hash) {
                const values = hash.split('&');
                valuesMap = queryParamsToMap(values);
                switch (values[0]) {
                    case 'INDEX':
                        pageE = $('#cms-index');
                        page = $.cms.index;
                        title = 'home';
                        break;
                    case 'UPLOAD':
                        pageE = $('#cms-upload');
                        page = $.cms.upload;
                        title = 'upload';
                        break;
                    case 'COLLECTION':
                        pageE = $('#cms-collection');
                        page = $.cms.collection;
                        title = 'collection';
                        break;
                    default:
                        throw 'Undefined action';
                }
            } else {
                pageE = $('#cms-index');
                page = $.cms.index;
                title = 'home';
            }
            pageE.fadeIn();
            $('#cms-header-header-title').text(title)
            page.start(valuesMap);
        }

        return {
            render: render
        }
    }

    !$.cms ? $.cms = {} : null;

    jQuery.extend($.cms, {
        router: Constructor()
    });
});

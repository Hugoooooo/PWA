importScripts('/PWA/src/js/idb.js');
importScripts('/PWA/src/js/indexedDB.js');

var CACHE_STATIC = 'static-v2.0';
var CACHE_DYNAMIC = 'dynamic-v2.0';

self.addEventListener('install', function (event) {
    // console.log('[SW] 安裝(Install) Service Worker!', event);
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then(function (cache) { 
                cache.addAll([
                    '/PWA/index',
                    '/PWA/src/js/app.js',
                    '/PWA/src/js/post.js',
                    '/PWA/src/offlinePage'
                ]);
            })
    );
});

self.addEventListener('activate', function (event) {
    // console.log('[SW] 觸發(Activate) Service Worker!', event);
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.map(function (key) {
                    if (key !== CACHE_STATIC &&
                        key !== CACHE_DYNAMIC) {
                        console.log('[SW] 刪除舊的快取');
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    // 強制更新
    console.log('[FETCH]');
    var url = 'https://pwa-pratice-164f2.firebaseio.com/article.json';
    if (-1 < event.request.url.indexOf(url)) {
        event.respondWith(
            fetch(event.request)
                .then(function (response) {
                    var copyRes = response.clone();

                    clearAllData('article')
                        .then(function () {
                            return copyRes.json();
                        })
                        .then(function (data) {
                            for (var key in data) {
                                writeData('article', data[key]);
                            }
                        });
                    return response;
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC)
                                    .then(function (cache) {
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                                    .catch(function (err) {
                                        return caches.open(CACHE_STATIC)
                                            .then(function (cahce) {
                                                return cache.match('/PWA/src/offlinePage');
                                            })
                                    })
                            });
                    }
                })
                .catch(function (err) {
                    return caches.open(CACHE_STATIC)
                        .then(function (cache) {
                            return cache.match('/PWA/src/offlinePage');
                        });
                })
        );
    }

});

//Background syncing
self.addEventListener('sync', function (event) {
    console.log('[SW] Background syncing', event);
    if (event.tag === 'sync-new-post') {
        console.log('抓到TAG-POST 表單');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function (data) {
                    for (var post of data) {
                        fetch('https://pwa-pratice-164f2.firebaseio.com/article.json', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                id: post.id,
                                title: post.title,
                                location: post.location,
                                content: post.content,
                                image: post.image
                            })
                        })
                            .then(function (res) {
                                console.log('送出表單', res);
                                if (res.ok) {
                                    deleteArticleData('sync-posts', post.id);
                                }
                            })
                            .catch(function (err) {
                                console.log('POST表單失敗!', err);
                            });
                    }

                })
        );
    }
});

// Push Notification
self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;
    
    console.log(notification);
    if(action === 'confirm') {
        console.log('使用者點選確認');
        notification.close();
    } else {
        console.log('使用者點選取消');
        console.log(action);
    }
});

self.addEventListener('notificationclose', function(event){
    console.log('使用者沒興趣',event);
});


self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    let title = 'Server Push1';
    let options = {
        body: 'push TEST',
        icon: '/PWA/src/images/icons/demo-icon96.png',
    };
    if (event.data) {
        options = event.data.json();
    }
    event.waitUntil(self.registration.showNotification(title, options));
});


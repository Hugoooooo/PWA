if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker
            .register('/PWA/sw.js')
            .then(function (reg) {
                console.log('Service Worker 註冊成功');
                subscribeUser(reg);
            }).catch(function (error) {
                console.log('Service worker 註冊失敗:', error);
            });
    });
} else {
    console.log('瀏覽器不支援');
}


// FireBase
var dataFromNetwork = false;
var articleUrl = 'https://pwa-pratice-164f2.firebaseio.com/article.json';

fetch(articleUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataFromNetwork = true;
        // console.log('fetch in window', dataFromNetwork);
        updateArticles(getArticleArray(data));
    })
    .catch(function () {
        getArticleFromDB();
    });

function getArticleFromDB() {
    if ('indexedDB' in window) {
        readAllData('article')
            .then(function (data) {
                // console.log('indexedDB in window', dataFromNetwork);
                if (!dataFromNetwork) {
                    // console.log('IndexedDB Data', data);
                    updateArticles(data);
                }
            });
    }
}

function getArticleArray(data) {
    var articles = [];
    for (var key in data) {
        //抓到： key : first-post
        articles.push(data[key]);
    }
    return articles;
}

function updateArticles(articles) {
    for (var i = 0; i < articles.length; i++) {
        createData(articles[i]);
    }
}

function createData(article) {
    var cardFrame = document.createElement('div');
    cardFrame.className = 'shared-moment-card mdl-card mdl-shadow--2dp card-frame';

    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url(' + article.image + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '200px';
    cardFrame.appendChild(cardTitle);
    var cardTitleText = document.createElement('h2');
    cardTitleText.style.color = '#fff';
    cardTitleText.className = 'mdl-card__title-text';
    cardTitleText.textContent = article.location;
    cardTitle.appendChild(cardTitleText);
    var cardContentText = document.createElement('div');
    cardContentText.className = 'mdl-card__supporting-text';
    cardContentText.textContent = article.content;
    cardContentText.style.textAlign = 'center';
    cardFrame.appendChild(cardContentText);
    document.querySelector('#shared-moments').appendChild(cardFrame);
}
// 推播相關
var enableNotifications = document.querySelectorAll('.enable-notifications');
if ('Notification' in window) {
    for (var i = 0; i < enableNotifications.length; i++) {
        enableNotifications[i].style.display = 'inline-block';
        enableNotifications[i].addEventListener('click', askForNotificationPermission);
    }
}

function askForNotificationPermission() {
    Notification.requestPermission(function (status) {
        console.log('User Choice', status);
        if (status !== 'granted') {
            console.log('推播允許被拒絕了!');
        } else {
            displayNotification();
        }
    });
}

function displayNotification() {
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'Click Notify !',
            icon: '/src/images/icons/demo-icon96.png',
            image: '/src/images/demo.JPG',
            dir: 'ltr',
            lang: 'zh-Hant', //BCP 47
            vibrate: [100, 50, 2000],
            badge: '/src/images/icons/demo-icon96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: '確認', icon: '/src/images/icons/demo-icon96.png' },
                { action: 'cancel', title: '取消', icon: '/src/images/icons/demo-icon96.png' }
            ]
        };
        navigator.serviceWorker.ready
            .then(function (sw) {
                sw.showNotification('訂閱成功！！！', options);
            })
    }

}

const applicationServerPublicKey = `BJ9iQa6H8hJB2t-LT62zO67BEnY-UjVyYSJ68S07oebSdkrpgZRZrVnKvzRxUcQyLioiq-q-gkRz5V-ivwwFSFY`;

function urlB64ToUint8Array(base64String){
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g,'/');
    var rawData = window.atob(base64);
    var outputArr = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i ){
        outputArr[i] = rawData.charCodeAt(i);
    }    
    return outputArr;
}

function subscribeUser(swRegistration) {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
      .then(subscription => {
        console.log('User is subscribed');
        console.log(JSON.stringify(subscription));
      })
      .catch(err => {
        console.log('Failed to subscribe the user: ', err);
      });
  }
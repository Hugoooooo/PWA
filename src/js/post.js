
// Background Sync
var articleUrl = 'https://pwa-pratice-164f2.firebaseio.com/article.json';

function postEvent(pid) {
  pid = pid || 'post-3';
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    console.log('Sync');
    navigator.serviceWorker.ready
      .then(function (sw) {
        var form = {
          id: pid,
          title: 'Test',
          location: 'China',
          content: 'Korea Fish',
          image: '"https://firebasestorage.googleapis.com/v0/b/days-pwas-practice.appspot.com/o/taipei_street.PNG?alt=media&token=8736b68e-216c-4c63-a7d4-a129875ba71e"'
        };
        writeData('sync-posts', form)
          .then(function () {
            sw.sync.register('sync-new-post');
          })
          .then(function () {
            // var snackbarContainer = document.querySelector('#confirmation-toast');
            // var data = { message: '文章以使用Background Sync方式儲存' };
            console.log('文章以使用Background Sync方式儲存');
            //snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function (err) {
            console.log('Error', err);
          });
      });
  } else {
    console.log('Normal');
    sendForm();
  }
}

function sendForm() {
  fetch(articleUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: 'post-3',
      title: 'Test',
      location: 'China',
      content: 'Korea Fish',
      image: '"https://firebasestorage.googleapis.com/v0/b/days-pwas-practice.appspot.com/o/taipei_street.PNG?alt=media&token=8736b68e-216c-4c63-a7d4-a129875ba71e"'
    })
  })
    .then(function (res) {
      console.log('送出表單', res);
      getArticleFromDB();
    });
}

function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
}

function downloader(data, type, name) {
    let blob = new Blob([data], {type});
    let url = window.URL.createObjectURL(blob);
    downloadURI(url, name);
    window.URL.revokeObjectURL(url);
}

function generatePlaylist(filename, context) {
    var fileId = context.fileInfoModel.attributes.id;

    var tr = context.fileList.findFileEl(filename);
    context.fileList.showFileBusyState(tr, true);

    var url = OC.generateUrl('/ocs/v2.php/apps/dav/api/v1/direct?format=json&fileId=' + fileId);
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {'OCS-APIRequest': 'true'},
        redirect: 'error',
        referrerPolicy: 'no-referrer-when-downgrade',
    })
        .then(data => data.json())
        .then(data => data && data.ocs && data.ocs.data && data.ocs.data.url)
        .then(url => {
            if (url) {
                downloader(
                    "#EXTM3U\n" +
                    "#EXTENC: UTF-8\n" +
                    "#EXTINF:0," + filename + "\n" +
                    url,
                    "audio/mpegurl",
                    filename + ".m3u");
            } else {
                OC.dialogs.alert(
                    t('stream', 'Unable to generate link for \"' + filename + '\"'),
                    t('stream', 'Error stream')
                );
            }
            context.fileList.showFileBusyState(tr, false);
        })
        .catch(error => {
            OC.dialogs.alert(
                t('stream', 'Unable to generate link for \"' + filename + '\" ' + error),
                t('stream', 'Playlist stream')
            );
            context.fileList.showFileBusyState(tr, false);
        });
}

window.addEventListener('DOMContentLoaded', (event) => {
    ['video', 'audio'].forEach(type => {
        OCA.Files.fileActions.registerAction({
            name: 'stream',
            displayName: t('stream', 'Stream'),
            mime: type,
            permissions: OC.PERMISSION_READ,
            //type: OCA.Files.FileActions.TYPE_DROPDOWN,
            iconClass: 'icon-stream',
            actionHandler: generatePlaylist,
        });
    });
});

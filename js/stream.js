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

function generatePlaylist(filename, url){
	var data = "EXTM3U\n#EXTINF:0,"+filename+"\n"+url;
	downloader(data, "audio/mpegurl", filename);
}

$(document).ready(function () {

	var actionsStream = {
		init: function () {
            var self = this;
			['video', 'audio'].forEach(type => {
				OCA.Files.fileActions.registerAction({
					name: 'stream',
					displayName: t('stream', 'Stream'),
					mime: type,
					permissions: OC.PERMISSION_READ,
					//type: OCA.Files.FileActions.TYPE_DROPDOWN,
					iconClass: 'icon-stream',
					actionHandler: self.generatePlaylist,
				});
			});
		},
		
		generatePlaylist: function(filename, context){
			var fileId = context.fileInfoModel.attributes.id;
			
			var tr = context.fileList.findFileEl(filename);
			context.fileList.showFileBusyState(tr, true);
			
			$.ajax({
				type: "POST",
				url: OC.generateUrl('/ocs/v2.php/apps/dav/api/v1/direct?format=json&fileId=' + fileId),
			}).done(function(res) {
				var url = (res && res.ocs && res.ocs.data && res.ocs.data.url) ? res.ocs.data.url : null;
				if(url){
					generatePlaylist(filename, url);
				}else{
					OC.dialogs.alert(
							t('stream', 'Unable to generate link for \"' + filename + '\"'),
							t('stream', 'Error stream')
				 );
				}
				context.fileList.showFileBusyState(tr, false);
			}).fail(function(res) {
				 OC.dialogs.alert(
							t('stream', 'Unable to generate link for \"' + filename + '\"'),
							t('stream', 'Playlis stream')
				 );
				context.fileList.showFileBusyState(tr, false);
			});
		}
	}
	actionsStream.init();
});


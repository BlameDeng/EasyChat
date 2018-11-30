<template>
</template>
<script>
    import plupload from 'plupload'
    import Crypto from './crypto-min.js'
    import sha1 from './sha1-min.js'
    import hmac from './hmac-min.js'
    import Base64 from './base64.js'
    import key from '../../../oss.json'
    export default {
        name: 'Upload',
        props: {
            containerId: { type: String, required: true },
            browseId: { type: String, required: true },
            postId: { type: String, default: '' },
            bucketName: { type: String, required: true },
            unique:{type:String,default:''}
        },
        data() {
            return { url: '' }
        },
        computed: {
            host() {
                return `https://${this.bucketName}.oss-cn-hangzhou.aliyuncs.com`;
            }
        },
        mounted() {
            let _self = this;
            let accessid = key.accessid;
            let accesskey = key.accesskey;
            let host = _self.host;
            let policyText = {
                "expiration": "2020-01-01T12:00:00.000Z",
                "conditions": [
                    ["content-length-range", 0, 1048576000]
                ]
            };
            let policyBase64 = Base64.encode(JSON.stringify(policyText));
            let message = policyBase64;
            let bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, { asBytes: true });
            let signature = Crypto.util.bytesToBase64(bytes);

            function set_upload_param(up, filename, ret) {
                let new_multipart_params = {
                    'key': filename,
                    'OSSAccessKeyId': accessid,
                    'success_action_status': '200',
                    'policy': policyBase64,
                    'signature': signature,
                };
                up.setOption({
                    'url': host,
                    'multipart_params': new_multipart_params
                });
                up.start();
            }
            let uploader = new plupload.Uploader({
                runtimes: 'html5,flash,silverlight,html4',
                browse_button: _self.browseId,
                multi_selection: false,
                container: document.getElementById(_self.containerId),
                flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
                silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
                url: host,
                filters: { max_file_size: '100kb' },

                init: {
                    PostInit: function() {
                        if (_self.postId) {
                            document.getElementById(_self.postId).onclick = function() {
                                set_upload_param(uploader, '', false);
                                return false;
                            };
                        }
                    },

                    FilesAdded: function(up, files) {
                        if (!_self.postId) {
                            set_upload_param(uploader, '', false);
                        } //自动上传
                        _self.$emit('files-added', files[0]);
                    },

                    BeforeUpload: function(up, file) {
                        set_upload_param(up, file.name+_self.unique, true);
                        _self.$emit('before-upload', file);
                    },

                    UploadProgress: function(up, file) {
                        _self.$emit('uploading', file);
                    },

                    FileUploaded: function(up, file, info) {
                        if (info.status == 200) {
                            _self.url = host + '/' + encodeURIComponent(file.name);
                            _self.$emit('uploaded', { url: _self.url+_self.unique, file });
                        }
                    },

                    Error: function(up, err) {}
                }
            });
            uploader.init();
        }
    }
</script>
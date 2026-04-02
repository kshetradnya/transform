export class DriveManager {
    constructor() {
        // Placeholder Client ID
        this.CLIENT_ID = '653457771095-kv42f6iln2bijs9mj2mb0rqu0q0sc75s.apps.googleusercontent.com';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file profile email';
        this.tokenClient = null;
        this.accessToken = null;
        this.userInfo = null;
        this.onAuthStateChanged = null;
    }

    init(callback) {
        this.onAuthStateChanged = callback;
        // The script async loads, we check occasionally or just trust it's there
        if(typeof google !== 'undefined') {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        throw (tokenResponse);
                    }
                    this.accessToken = tokenResponse.access_token;
                    this.fetchUserInfo();
                },
            });
        }
    }

    login() {
        if (!this.tokenClient) {
            alert("Google API not loaded yet. If it fails, add your Client ID in drive.js.");
            return;
        }
        this.tokenClient.requestAccessToken({prompt: 'consent'});
    }

    logout() {
        this.accessToken = null;
        this.userInfo = null;
        if(this.onAuthStateChanged) this.onAuthStateChanged(this.userInfo);
    }

    async fetchUserInfo() {
         try {
             let res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                 headers: { 'Authorization': 'Bearer ' + this.accessToken }
             });
             let data = await res.json();
             this.userInfo = {
                 name: data.name || 'Drive User',
                 picture: data.picture || 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
             };
             if(this.onAuthStateChanged) this.onAuthStateChanged(this.userInfo);
         } catch(e) {
             console.log(e);
             this.userInfo = { name: 'Drive User', picture: '' };
             if(this.onAuthStateChanged) this.onAuthStateChanged(this.userInfo);
         }
    }

    async saveToDrive(blob, type = 'edited', originalName = 'photo.jpg') {
        if(!this.accessToken) {
             throw new Error("Not authenticated");
        }
        
        let folderName = type === 'edited' ? 'Transform Edited Photos' : 'Transform Original Photos';
        let folderId = await this.getOrCreateFolder(folderName);

        // Upload file
        let metadata = {
            name: `${type === 'edited' ? 'Final' : 'Orig'}_${Date.now()}_${originalName}`,
            mimeType: blob.type,
            parents: [folderId]
        };

        let form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        let res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + this.accessToken }),
            body: form
        });
        
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
    }

    async getOrCreateFolder(folderName) {
        // Query for folder
        let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
        let res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive`, {
            headers: { 'Authorization': 'Bearer ' + this.accessToken }
        });
        let data = await res.json();

        if (data.files && data.files.length > 0) {
            return data.files[0].id; // Returns first match
        }

        // Create folder
        let metadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };
        let createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        let createData = await createRes.json();
        return createData.id;
    }
}

export const driveManager = new DriveManager();


const {findSteam} = require('find-steam-app');
const steamConst = require('./steam.constants');


class SteamResourceLocator {
    async getProfileVdfPath(){
        let basePath = await this.getSteamPath();
        let vdfPath = basePath+steamConst.CONFIG_PATH+steamConst.USER_VDF
        return vdfPath;
    }

    async getAvatarPath(){
        let basePath = await this.getSteamPath();
        let avatarPath = basePath+steamConst.AVATAR_CACHE_PATH;
    }
    
    async getSteamPath() {
        let url = await findSteam();
        return url;
    }
}

module.exports = SteamResourceLocator
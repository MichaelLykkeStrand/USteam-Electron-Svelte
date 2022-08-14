
const {findSteam} = require('find-steam-app');
const steamConst = require('./steam.constants');


class SteamResourceLocator {
    static async getProfileVdfPath(){
        let basePath = await this.getSteamPath();
        let vdfPath = basePath+steamConst.CONFIG_PATH+steamConst.USER_VDF
        return vdfPath;
    }

    static async getAvatarPath(){
        let basePath = await this.getSteamPath();
        let avatarPath = basePath+steamConst.AVATAR_CACHE_PATH;
        return avatarPath;
    }
    
    static async getSteamPath() {
        let url = await findSteam();
        return url;
    }
}

module.exports = SteamResourceLocator

const {
    findSteam,
  } = require('find-steam-app');

const steamConst = require('./steamConstants');


class SteamResourceLocator {
    async getProfileVdfPath(){
        let basePath = await this.getSteamPath();
        let vdfPath = basePath+steamConst.CONFIG_PATH+steamConst.USER_VDF
        return vdfPath;
    }

    async getProfilePicturePath(id){

    }
    
    async getSteamPath() {
        let url = await findSteam();
        return url;
    }
}

module.exports = SteamResourceLocator
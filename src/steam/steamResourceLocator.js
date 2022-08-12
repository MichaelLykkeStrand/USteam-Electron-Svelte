
const {
    findSteam,
  } = require('find-steam-app');

class SteamResourceLocator {
    getProfileVdf(){

    }
    async getSteamPath() {
        let url = await findSteam();
        return url;
    }
}

module.exports = SteamResourceLocator
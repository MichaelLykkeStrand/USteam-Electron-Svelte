const SteamResourceLocator = require('./steam.resource.locator');
const vdf = require('vdf');
const fs = require("fs");

class SteamRepository {
    constructor() {
    }

    async getAccounts() {
        let vdfPath = await SteamResourceLocator.getProfileVdfPath();
        console.log("Loading vdfPath: "+vdfPath);
        const buffer = fs.readFileSync(vdfPath);
        console.log("Loading buffer");
        let accounts = vdf.parse(buffer.toString());
        console.log(accounts);
    }
}
module.exports = SteamRepository;
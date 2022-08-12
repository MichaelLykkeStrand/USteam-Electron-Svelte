
const path = require('path');
const { homedir } = require('os');

class SteamResourceLocator {
    static getProfileVdf(){

    }
    static getSteamPath() {
        if (process.platform === "linux") {
            const steamPath = path.join(homedir(), ".steam", "root");
            if (fs.existsSync(steamPath)) {
                return steamPath;
            }
            return null;
        }
        if (process.platform !== "win32") {
            throw new Error("Unsupported operating system");
        }
    
        try {
            const entry = enumerateValues(HKEY.HKEY_LOCAL_MACHINE, 'SOFTWARE\\WOW6432Node\\Valve\\Steam').filter(value => value.name === "InstallPath")[0];
            const value = entry && String(entry.data) || null;
            return value;
        } catch (e) {
            return null;
        }
    }
}
const find = require('find-process');
const { exec } = require('child_process');
const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const settings = require('electron-settings');
let settingsConstants = require('../settings/settingsConstants');
let timer = require('../utils/timer');

export class Steam {
    constructor() {
    }

    static async getSteamProfile(event, account) {
        let url = account._steamURL;
        console.log(url);
        let controller = new AbortController();
        let timeout = setTimeout(() => {
          controller.abort();
        }, 50000);
        let steamProfile;
        await fetch(url, { signal: controller.signal })
          .then(res => res.text())
          .then(
            body => {
              let $ = cheerio.load(body);
              let profileName = $("span[class=actual_persona_name]").text();
              let profilePictureSrc = $("div[class=playerAvatarAutoSizeInner]").children('img').eq(0).attr('src');
              console.log(profileName, profilePictureSrc);
              steamProfile = new SteamProfile(profileName, profilePictureSrc);
            },
            err => {
              if (err.name === 'AbortError') {
                // request was aborted
                console.log("aborted!")
              }
            },
          )
          .finally(() => {
            clearTimeout(timeout);
            try {
              event.reply("get-steam-profile-async" + account.counter, steamProfile);
            } catch {
              return steamProfile;
            }
          });
      }

    static async login(account) {
        await this.logout();
        let steamDir = settings.getSync(settingsConstants.STEAM_DIR);
        console.log("Logging into account: " + account._name + " Pass: " + account._password.length);
        exec(steamDir+" -login " + account._name + " " + account._password, (error, stdout, stderr) => {
        });
    }


    static async logout(){
      let hasExited = false;
        while(hasExited == false){
          hasExited = await Steam.TryExit();
          await timer.sleep(100);
          console.log("Waiting for Steam to exit. Exit: " + hasExited);
        }
        console.log("Steam has logged out!")
    }

    //TODO refactor
    static async TryExit(){
      var count = 0;
       await find('name', 'steam').then(async function (list) {
          list.forEach(async steamRunner => {
              try {
                  if (steamRunner.name == "steamwebhelper.exe" || steamRunner.name == "steam" || steamRunner.name == "steamwebhelper") {
                    console.log("Closing: "+steamRunner.name);
                    count = count+1;
                    process.kill(steamRunner.ppid, 'SIGKILL');
                  }
              } catch (error) {
              }
          });

      });
      if(count > 0){
        return false;
      }
      return true;
    }
}


export class SteamProfile {
  constructor(profileName, profilePictureSrc) {
    this._profileName = profileName;
    this._profilePictureSrc = profilePictureSrc;
  }
}

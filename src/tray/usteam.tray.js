// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron');
const Steam = require('../steam/steam');
const path = require('path');
const PImage = require('pureimage');
const fs = require('fs');
const Capitalize = require('../utils/capitalize/capitalize');
const USteamWindowManger = require('../window/usteam.window.manager');

const trayMenuImageWidth = 16;
const trayMenuImageHeight = 16;

let window = require('../window/windowConstants');
let iconPath = path.join(__dirname, '../assets/icon/icon2.png');
let image = nativeImage.createFromPath(iconPath);
let tray;
let accountRepository;

const load = (repository)=>{
    accountRepository = repository;
}

// Create the tray icon
const createTray = ()=> {
    tray = new Tray(image)
    tray.setToolTip('U-Steam.')
    tray.on('click', function () {
      USteamWindowManger.open(window.MAIN_HTML)
    })
    updateTrayContext();
}

const updateTrayContext = ()=>{
    let template = [];
    let userTemplate = [];
    template.push({
      label: 'U-Steam',
      enabled: false
      }
    );
    template.push({
      type: 'separator',
      }
    );
  
    let promiseList = [];
    accountRepository.getAccounts().forEach(account => {
      let img = PImage.make(trayMenuImageWidth, trayMenuImageHeight)
      let context = img.getContext('2d');
      let colorimgpath;
      let colorimg;
      let tempPath = "temp/" + account._name + 'temp.png';
      context.fillStyle = account._color;
      context.fillRect(0, 0, trayMenuImageWidth, trayMenuImageHeight);
      promiseList.push(PImage.encodePNGToStream(img, fs.createWriteStream(path.join(__dirname, tempPath))).then(() => {
        console.log("Wrote out the png file to temp.png");
        colorimgpath = path.join(__dirname, tempPath);
        colorimg = nativeImage.createFromPath(colorimgpath);
      }).catch((e) => {
        //Error loading image
        console.log("Unable to generate Tray picture: \n"+ e);
      }).then(() => {
        console.log("Account added to Tray")
        userTemplate.push({
          label: Capitalize.capitalizeFirstLetter(account._name), click: () => {
            Steam.login(account);
          },
          icon: colorimg
        })
      }))
    })
  
    Promise.all(promiseList).then(() => {
      userTemplate.sort(compareTemplate);
      template = template.concat(userTemplate);
      template.push({
        type: 'separator',
      }
      );
      template.push({
        label: 'Settings', click: () => {
          USteamWindowManger.open(window.SETTINGS_HTML)
        }
      });
      template.push({
        type: 'separator',
      }
      );
      template.push({
        label: 'Quit', click: () => {
          app.quit();
        }
      });
      const contextMenu = Menu.buildFromTemplate(template);
      tray.setContextMenu(contextMenu)
    });
}

function compareTemplate(a, b) {
    var nameA = a.label.toUpperCase(); // ignore upper and lowercase
    var nameB = b.label.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  }

module.exports.load = load;
module.exports.createTray = createTray;
module.exports.updateTrayContext = updateTrayContext;

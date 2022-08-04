const {getRandomColor} = require('../utils/color/color')

class Account {
    constructor(newName, newPassword, steamURL, color) {
      this._name = newName;
      this._password = newPassword;
      this._steamURL = steamURL;

      if(color == null){
        this._color = getRandomColor();
        console.log("New color: "+this._color);
      } else{
        this._color = color;
        console.log("Old color: "+this._color);
      }
    }
  
    toString() {
      return "\n Username: " + this._name + "\n Url: " + this._steamURL;
    }
  }

  module.exports = Account
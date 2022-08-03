import {ColorGenerator} from "../utils/color/color";

export class Account {
    constructor(newName, newPassword, bundle, color) {
      this.name = newName;
      this.password = newPassword;
      this.bundle = bundle;

      if(color === undefined){
        this._color = ColorGenerator.getRandomColor();
      } else{
        this._color = color;
      }
    }
  
    toString() {
      return "\n Username: " + this.name;
    }
  }
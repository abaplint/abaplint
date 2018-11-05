import {IRule} from "./rules/_irule";
import {IObject} from "./objects/_iobject";
import * as Rules from "./rules/";
import * as Objects from "./objects";

export class Artifacts {
  private static objectMap: any;

  public static getRules(): IRule[] {
    let ret: IRule[] = [];
    for (let key in Rules) {
      const list: any = Rules;
      if (typeof list[key] === "function") {
        let rule: IRule = new list[key]();
// note that configuration is also exported from rules
        if (rule.getKey) {
          ret.push(rule);
        }
      }
    }
    return ret;
  }

  public static newObject(name: string, type: string): IObject {
    if (this.objectMap === undefined) {
      this.buildObjectMap();
    }

    if (type === "ABAP") {
      throw new Error("Add type in filename, eg zclass.clas.abap or zprogram.prog.abap");
    } else if (this.objectMap[type] === undefined) {
      throw new Error("Unknown object type: " + type);
    }

    return new this.objectMap[type](name);
  }

/*
  public static getFormatters(): undefined {
// todo
    return undefined;
  }
*/

  private static buildObjectMap() {
    this.objectMap = [];
    for (let key in Objects) {
      const list: any = Objects;
      if (typeof list[key] === "function") {
        let obj = new list[key]("ASDF");
        this.objectMap[obj.getType()] = list[key];
      }
    }
  }
}
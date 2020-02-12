import {IObject} from "./objects/_iobject";
import * as Objects from "./objects";

export class ArtifactsObjects {
  private static objectMap: any;

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

  private static buildObjectMap() {
    this.objectMap = [];
    for (const key in Objects) {
      const list: any = Objects;
      if (typeof list[key] === "function") {
        const obj = new list[key]("ASDF");
        this.objectMap[obj.getType()] = list[key];
      }
    }
  }
}
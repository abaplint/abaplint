import {IObject} from "./objects/_iobject";
import * as Objects from "./objects";
import {UnknownObject} from "./objects/_unknown_object";

export class ArtifactsObjects {
  private static objectMap: any;

  public static newObject(name: string, type: string): IObject {
    if (this.objectMap === undefined) {
      this.buildObjectMap();
    }

    if (this.objectMap[type] === undefined) {
      return new UnknownObject(name, type);
    } else {
      return new this.objectMap[type](name);
    }
  }

  private static buildObjectMap() {
    this.objectMap = [];
    for (const key in Objects) {
      const list: any = Objects;
      if (typeof list[key] === "function") {
        const obj = new list[key]("DUMMY_NAME");
        this.objectMap[obj.getType()] = list[key];
      }
    }
  }
}
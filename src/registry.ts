import {Object, Class} from "./objects";

export default class Registry {

  private macros: Array<string> = [];
  private objects: Array<Object> = [];

  public add(obj: Object) {
    this.objects.push(obj);
  }

  public findOrCreate(name: string, type: string): Object {
    for (let obj of this.objects) {
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }

    let add = undefined;
    switch (type) {
      case "CLAS":
        add = new Class(name, "todo");
        break;
      default:
        console.trace();
        throw "Unknown object type: " + type;
    }

    this.objects.push(add);

    return add;
  }

// todo, handle scoping for macros
  public addMacro(name: string) {
    if (this.isMacro(name)) {
      return;
    }
    this.macros.push(name.toUpperCase());
  }

  public isMacro(name: string): boolean {
    for (let mac of this.macros) {
      if (mac === name.toUpperCase()) {
        return true;
      }
    }
    return false;
  }

}
import {Object} from "./objects";

export default class Registry {

  private macros: Array<string> = [];
  private objects: Array<Object> = [];

  public addObject(obj: Object) {
    this.objects.push(obj);
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
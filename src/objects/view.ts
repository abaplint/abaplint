import {AbstractObject} from "./_abstract_object";

export class View extends AbstractObject {

  public getType(): string {
    return "VIEW";
  }

  public getFields(): string[] {
// todo
    return [];
  }

}
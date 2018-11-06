import {AbstractObject} from "./_abstract_object";

export class LockObject extends AbstractObject {

  public getType(): string {
    return "ENQU";
  }

}
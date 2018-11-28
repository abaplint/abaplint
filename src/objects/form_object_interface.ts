import {AbstractObject} from "./_abstract_object";

export class FormObjectInterface extends AbstractObject {

  public getType(): string {
    return "SFPI";
  }

}
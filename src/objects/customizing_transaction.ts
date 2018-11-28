import {AbstractObject} from "./_abstract_object";

export class CustomizingTransaction extends AbstractObject {

  public getType(): string {
    return "CUS1";
  }

}
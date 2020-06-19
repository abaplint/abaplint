import {AbstractObject} from "./_abstract_object";

export class ObjectCharacteristic extends AbstractObject {

  public getType(): string {
    return "CHAR";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}

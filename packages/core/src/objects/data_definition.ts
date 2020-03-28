import {AbstractObject} from "./_abstract_object";

export class DataDefinition extends AbstractObject {

  public getType(): string {
    return "DDLS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
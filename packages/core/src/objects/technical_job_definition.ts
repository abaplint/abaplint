import {AbstractObject} from "./_abstract_object";

export class TechnicalJobDefinition extends AbstractObject {

  public getType(): string {
    return "JOBD";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
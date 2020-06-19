import {AbstractObject} from "./_abstract_object";

export class TechnicalJobDefinition extends AbstractObject {

  public getType(): string {
    return "JOBD";
  }

  public getAllowedNaming() {
    return {
      maxLength: 32,
      allowNamespace: true,
    };
  }
}

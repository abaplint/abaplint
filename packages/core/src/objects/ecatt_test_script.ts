import {AbstractObject} from "./_abstract_object";

export class EcattTestScript extends AbstractObject {

  public getType(): string {
    return "ECAT";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
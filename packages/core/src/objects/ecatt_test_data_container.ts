import {AbstractObject} from "./_abstract_object";

export class EcattTestDataContainer extends AbstractObject {

  public getType(): string {
    return "ECTD";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
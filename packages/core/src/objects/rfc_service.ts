import {AbstractObject} from "./_abstract_object";

export class RFCService extends AbstractObject {

  public getType(): string {
    return "SRFC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
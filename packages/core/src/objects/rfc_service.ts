import {AbstractObject} from "./_abstract_object";

export class RFCService extends AbstractObject {

  public getType(): string {
    return "SRFC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}

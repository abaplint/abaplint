import {AbstractObject} from "./_abstract_object";

export class ServiceBinding extends AbstractObject {

  public getType(): string {
    return "SRVB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
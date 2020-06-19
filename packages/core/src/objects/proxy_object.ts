import {AbstractObject} from "./_abstract_object";

export class ProxyObject extends AbstractObject {

  public getType(): string {
    return "SPRX";
  }

  public getAllowedNaming() {
    return {
      maxLength: 34,
      allowNamespace: true,
    };
  }
}

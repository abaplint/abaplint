import {AbstractObject} from "./_abstract_object";

export class ProxyObject extends AbstractObject {

  public getType(): string {
    return "SPRX";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
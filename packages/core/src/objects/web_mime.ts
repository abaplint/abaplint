import {AbstractObject} from "./_abstract_object";

export class WebMIME extends AbstractObject {

  public getType(): string {
    return "W3MI";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
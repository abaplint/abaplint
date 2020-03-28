import {AbstractObject} from "./_abstract_object";

export class WebDynproComponent extends AbstractObject {

  public getType(): string {
    return "WDYN";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
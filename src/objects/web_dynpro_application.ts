import {AbstractObject} from "./_abstract_object";

export class WebDynproApplication extends AbstractObject {

  public getType(): string {
    return "WDYA";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
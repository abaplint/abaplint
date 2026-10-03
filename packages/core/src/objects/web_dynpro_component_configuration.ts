import {AbstractObject} from "./_abstract_object";

export class WebDynproComponentConfiguration extends AbstractObject {

  public getType(): string {
    return "WDCC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
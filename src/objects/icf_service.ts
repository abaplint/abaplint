import {AbstractObject} from "./_abstract_object";

export class ICFService extends AbstractObject {

  public getType(): string {
    return "SICF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
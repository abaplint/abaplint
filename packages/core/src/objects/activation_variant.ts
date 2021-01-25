import {AbstractObject} from "./_abstract_object";

export class ActivationVariant extends AbstractObject {

  public getType(): string {
    return "AVAR";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
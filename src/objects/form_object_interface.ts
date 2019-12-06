import {AbstractObject} from "./_abstract_object";

export class FormObjectInterface extends AbstractObject {

  public getType(): string {
    return "SFPI";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
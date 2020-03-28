import {AbstractObject} from "./_abstract_object";

export class FormObjectForm extends AbstractObject {

  public getType(): string {
    return "SFPF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
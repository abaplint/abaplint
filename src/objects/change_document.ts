import {AbstractObject} from "./_abstract_object";

export class ChangeDocument extends AbstractObject {

  public getType(): string {
    return "CHDO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
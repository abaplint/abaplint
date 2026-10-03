import {AbstractObject} from "./_abstract_object";

export class ChangeDocument extends AbstractObject {

  public getType(): string {
    return "CHDO";
  }

  public getAllowedNaming() {
    return {
      maxLength: 15,
      allowNamespace: true,
    };
  }
}

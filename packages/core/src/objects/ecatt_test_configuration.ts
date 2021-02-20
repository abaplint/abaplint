import {AbstractObject} from "./_abstract_object";

export class EcattTestConfiguration extends AbstractObject {

  public getType(): string {
    return "ECTC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
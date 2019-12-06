import {AbstractObject} from "./_abstract_object";

export class EnhancementImplementation extends AbstractObject {

  public getType(): string {
    return "ENHO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
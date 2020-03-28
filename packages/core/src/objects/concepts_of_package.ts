import {AbstractObject} from "./_abstract_object";

export class ConceptsOfPackage extends AbstractObject {

  public getType(): string {
    return "SOTS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
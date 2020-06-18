import {AbstractObject} from "./_abstract_object";

export class ConceptsOfPackage extends AbstractObject {

  public getType(): string {
    return "SOTS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

}

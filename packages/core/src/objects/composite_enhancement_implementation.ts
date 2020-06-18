import {AbstractObject} from "./_abstract_object";

export class CompositeEnhancementImplementation extends AbstractObject {

  public getType(): string {
    return "ENHC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}

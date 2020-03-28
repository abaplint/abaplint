import {AbstractObject} from "./_abstract_object";

export class CompositeEnhancementSpot extends AbstractObject {

  public getType(): string {
    return "ENSC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
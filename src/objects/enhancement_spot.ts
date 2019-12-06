import {AbstractObject} from "./_abstract_object";

export class EnhancementSpot extends AbstractObject {

  public getType(): string {
    return "ENHS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}
import {AbstractObject} from "./_abstract_object";

export class EnhancementSpot extends AbstractObject {

  public getType(): string {
    return "ENHS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

}

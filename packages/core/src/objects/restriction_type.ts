import {AbstractObject} from "./_abstract_object";

export class RestrictionType extends AbstractObject {

  public getType(): string {
    return "SIA2";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
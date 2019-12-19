import {AbstractObject} from "./_abstract_object";

export class SwitchAssignments extends AbstractObject {

  public getType(): string {
    return "SFSW";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
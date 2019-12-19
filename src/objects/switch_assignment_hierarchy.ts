import {AbstractObject} from "./_abstract_object";

export class SwitchAssignmentHierarchy extends AbstractObject {

  public getType(): string {
    return "SHI8";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
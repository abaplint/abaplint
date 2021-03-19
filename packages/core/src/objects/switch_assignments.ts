import {AbstractObject} from "./_abstract_object";

export class SwitchAssignments extends AbstractObject {

  public getType(): string {
    return "SFSW";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}

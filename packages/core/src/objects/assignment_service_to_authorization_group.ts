import {AbstractObject} from "./_abstract_object";

export class AssignmentServiceToAuthorizationGroup extends AbstractObject {

  public getType(): string {
    return "SUSH";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
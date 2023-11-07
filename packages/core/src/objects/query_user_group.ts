import {AbstractObject} from "./_abstract_object";

export class QueryUserGroup extends AbstractObject {

  public getType(): string {
    return "AQBG";
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
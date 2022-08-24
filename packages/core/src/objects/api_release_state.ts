import {AbstractObject} from "./_abstract_object";

export class APIReleaseState extends AbstractObject {

  public getType(): string {
    return "APIS";
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
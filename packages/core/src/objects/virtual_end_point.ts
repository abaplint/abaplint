import {AbstractObject} from "./_abstract_object";

export class VirtualEndPoint extends AbstractObject {

  public getType(): string {
    return "WEBI";
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
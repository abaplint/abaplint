import {AbstractObject} from "./_abstract_object";

export class PageFormat extends AbstractObject {

  public getType(): string {
    return "SPPF";
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

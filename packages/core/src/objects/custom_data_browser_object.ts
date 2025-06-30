import {AbstractObject} from "./_abstract_object";

export class CustomDataBrowserObject extends AbstractObject {

  public getType(): string {
    return "CDBO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 32,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
import {AbstractObject} from "./_abstract_object";

export class HttpService extends AbstractObject {

  public getType(): string {
    return "HTTP";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }
}
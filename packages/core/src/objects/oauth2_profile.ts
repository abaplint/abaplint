import {AbstractObject} from "./_abstract_object";

export class Oauth2Profile extends AbstractObject {

  public getType(): string {
    return "OA2P";
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
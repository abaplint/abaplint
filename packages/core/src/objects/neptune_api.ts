import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class NeptuneAPI extends AbstractObject {

  public getType(): string {
    return "ZN02";
  }

  public getAllowedNaming(): IAllowedNaming {
    return { // todo, verify
      maxLength: 100,
      allowNamespace: true,
      customRegex: /.*/i,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
import {MorphSettings} from "./statements";

export function mapName(name: string | undefined, settings: MorphSettings) {
  if (name === undefined) {
    return undefined;
  }
  return settings.nameMap[name] || name;
}
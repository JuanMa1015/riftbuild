export { CHAMPIONS } from './game'

export const TYPE_LABEL = { fighter:"Luchador", mage:"Mago", assassin:"Asesino", marksman:"Tirador", tank:"Tanque", support:"Soporte" }
export const TYPE_COLOR = { fighter:"#e8a020", mage:"#6680ff", assassin:"#cc2244", marksman:"#2db85a", tank:"#4a8fbf", support:"#9b55d4" }

export const LANES = [
  {id:"top", ico:"🛡️", lbl:"Top"},
  {id:"jg",  ico:"🌲", lbl:"Jungla"},
  {id:"mid", ico:"⚡", lbl:"Mid"},
  {id:"adc", ico:"🏹", lbl:"ADC"},
  {id:"sup", ico:"💛", lbl:"Supp"},
]
export const ROLE_OPTIONS = [
  {value:"Solo / Baron", label:"Solo / Baron (Top)"},
  {value:"Jungla",       label:"Jungla"},
  {value:"Mid",          label:"Mid"},
  {value:"ADC / Duo",    label:"ADC / Duo"},
  {value:"Support",      label:"Support"},
]
export const ROLE_MAP = { Solo:"Solo / Baron", Jungla:"Jungla", Mid:"Mid", ADC:"ADC / Duo", Support:"Support" }


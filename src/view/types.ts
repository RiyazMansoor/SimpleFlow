

export enum EWidget {
  EMAIL,
  TEXT,
  TEXTAREA,
  DROPDOWN,
  LISTBOX,
  RADIOBUTTONS,
  CHECKBOXES
}

export enum EWidth {
  FULL,
  HALF,
  THIRD,
  TWOTHIRD,
  FOURTH,
  THREEFOURTH,
  REST,
}

export type TControl = {
  label: string,
  widget: EWidget,
  placeholder: string
  width: EWidth,
  hint: string,

}



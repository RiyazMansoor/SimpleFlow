import { EWidget, EWidth, TControl } from "./types";


const html = `
<label>First Name</label>
<input class="w3-input w3-border w3-round" name="first" type="text"></p>

<input class="w3-radio" type="radio" name="gender" value="male" checked>
<label>Male</label>

<div class="w3-half">
<label>Last Name</label>
<input class="w3-input w3-border" type="text" placeholder="Three">
</div>

`

function toType(widgetType: EWidget): string {
    switch (widgetType) {
        case EWidget.TEXT: return "text";
        case EWidget.EMAIL: return "email";
        default: throw `Unknown WidgetType '${widgetType}'`;
    }
}

function toWidth(widgetWidth: EWidth): string {
    switch (widgetWidth) {
        case EWidth.HALF: return "w3-half";
        case EWidth.THIRD: return "w3-third";
        case EWidth.TWOTHIRD: return "w3-twothird";
        case EWidth.FOURTH: return "w3-quarter";
        case EWidth.THREEFOURTH: return "w3-threequarter";
        default: throw `Unknown WidgetWidth '${widgetWidth}'`;
    }
}

function renderControl(htmlControl: TControl, key: string): HTML {
    const width = toWidth(htmlControl.width);
    let input = "";
    switch (htmlControl.widget) {
        case EWidget.EMAIL:
        case EWidget.TEXT:
            input = renderTextbox(htmlControl, key);
            break;
        default:
    }
    return `<div class="${width}"><label>${htmlControl.label}</label>${input}</div>`;
}

function renderTextbox(widget: TControl, key: string): HTML {
    const type = toType(widget.widget);
    return `<input class="w3-input w3-border w3-round" name="${key}" id="${key}" type="${type}"></p>`;
}

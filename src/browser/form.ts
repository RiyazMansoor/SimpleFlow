
type HTML = string;

enum UiFieldWidth {
    THIRD = "w3-third",
    QUARTER = "w3-quarter",
    HALF = "w3-half",
}

enum UiTextType {
    TEXT = "text",
}

type UiTextField = {
    width: UiFieldWidth,
    label: string,
    value: string,
    name: string,
    type: UiTextType,
}

function uiLabel(lbl: string): string {
    return lbl.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

function uiRenderTextField(txtField: UiTextField): HTML {
    return `
    <div class="w3-container w3-${txtField.width} w3-border">
        <label>${uiLabel(txtField.label)}</label>
        <input class="w3-input w3-border w3-round" name="${txtField.name}" type="${txtField.type}" value="${txtField.type}">
    </div>
    `
}


const FIELD_TEXT = `
<div class="w3-container w3-third w3-border">
<label>First Name</label>
<input class="w3-input w3-border w3-round" name="first" type="text">
</div>
`;


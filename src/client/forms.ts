
enum FieldType { 
    TEXT = "text", 
    NUMBER = "number", 
    EMAIL = "email" 
}

enum FieldWidth { 
    QUARTER = "w3-quarter", 
    THIRD = "w3-third", 
    HALF = "w3-half", 
    REST = "w3-rest" 
}

type FormField = {
    name: string,
    label: string,
    type: FieldType,
    width: FieldWidth,
    required: boolean,
}

type FormSection = {
    title: string,
    fields: FormField[],
}

type FormEntity = {
    title: string,
    description: string,
    sections: FormSection[],
}

function htmlForm(frm: FormEntity): string {
    const header: string = `<header class="w3-container w3-theme"><h1>${frm.title}</h1><p>${frm.description}</header>`;
    const sections: string = frm.sections.reduce( (pv, cv) => pv + htmlFormSection(cv), "");
    const footer: string = `<footer class="w3-container w3-theme"><h1>${frm.title}</h1></footer>`;
    return `<div class="w3-container">${header}${sections}${footer}</div>`;
}

function htmlFormSection(fs: FormSection): string {
    const header: string = `<header class="w3-container w3-theme"><h2>${fs.title}</h2></header>`;
    const fields: string = fs.fields.reduce( (pv, cv) => pv + htmlFormField(cv), "");
    return `<div class="w3-container">${header}${fields}</div>`;
}

function htmlFormField(ff: FormField): string {
    const required: string = ff.required ? "required" : "";
    let field: string = "";
    switch (ff.type) {
        case FieldType.TEXT: 
            field = `<input class="w3-input w3-border w3-round" id="${ff.name}" name="${ff.name}" ${required} type="${ff.type}">`;
            break;
        default:
            field = `FieldType [${ff.type}] not handled in method htmlField(FormField)`;
    }
    const label: string = `<label class="w3-label" for="${ff.name}">${ff.label}</label>`;
    return `<div class="w3-container ${ff.width}">${label}${field}</div>`;
}



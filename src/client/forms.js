var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["NUMBER"] = "number";
    FieldType["EMAIL"] = "email";
})(FieldType || (FieldType = {}));
var FieldWidth;
(function (FieldWidth) {
    FieldWidth["QUARTER"] = "w3-quarter";
    FieldWidth["THIRD"] = "w3-third";
    FieldWidth["HALF"] = "w3-half";
    FieldWidth["REST"] = "w3-rest";
})(FieldWidth || (FieldWidth = {}));
function htmlForm(frm) {
    var header = "<header class=\"w3-container w3-theme\"><h1>".concat(frm.title, "</h1><p>").concat(frm.description, "</header>");
    var sections = frm.sections.reduce(function (pv, cv) { return pv + htmlFormSection(cv); }, "");
    var footer = "<footer class=\"w3-container w3-theme\"><h1>".concat(frm.title, "</h1></footer>");
    return "<div class=\"w3-container\">".concat(header).concat(sections).concat(footer, "</div>");
}
function htmlFormSection(fs) {
    var header = "<header class=\"w3-container w3-theme\"><h2>".concat(fs.title, "</h2></header>");
    var fields = fs.fields.reduce(function (pv, cv) { return pv + htmlFormField(cv); }, "");
    return "<div class=\"w3-container\">".concat(header).concat(fields, "</div>");
}
function htmlFormField(ff) {
    var required = ff.required ? "required" : "";
    var field = "";
    switch (ff.type) {
        case FieldType.TEXT:
            field = "<input class=\"w3-input w3-border w3-round\" id=\"".concat(ff.name, "\" name=\"").concat(ff.name, "\" ").concat(required, " type=\"").concat(ff.type, "\">");
            break;
        default:
            field = "FieldType [".concat(ff.type, "] not handled in method htmlField(FormField)");
    }
    var label = "<label class=\"w3-label\" for=\"".concat(ff.name, "\">").concat(ff.label, "</label>");
    return "<div class=\"w3-container ".concat(ff.width, "\">").concat(label).concat(field, "</div>");
}

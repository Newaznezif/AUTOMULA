import type { DetectedFormField, FormFieldType, FillResult } from "@automula/shared";

const FIELD_SELECTOR = "input:not([type=hidden]):not([type=password]):not([type=file]),textarea,select";

function getLabel(element: Element): string {
  const input = element as HTMLInputElement;
  const aria = element.getAttribute("aria-label");
  if (aria) return aria.trim();
  if (input.labels && input.labels.length) return Array.from(input.labels).map(label => label.innerText.trim()).join(" ").trim();
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) return labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.textContent?.trim() || "").filter(Boolean).join(" ");
  const legend = element.closest("fieldset")?.querySelector("legend")?.textContent?.trim();
  if (legend) return legend;
  return element.getAttribute("placeholder")?.trim() || element.getAttribute("name")?.replace(/[_-]+/g," ").trim() || "";
}

function getType(element: Element): FormFieldType {
  if (element instanceof HTMLTextAreaElement) return "textarea";
  if (element instanceof HTMLSelectElement) return "select";
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (["text","email","tel","number","date","checkbox","radio"].includes(type)) return type as FormFieldType;
  }
  return "unknown";
}

function hasValue(element: Element): boolean {
  if (element instanceof HTMLInputElement && ["checkbox","radio"].includes(element.type)) return element.checked;
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element.value.trim().length > 0;
  if (element instanceof HTMLSelectElement) return element.value.length > 0;
  return false;
}

export function detectNativeFields(): DetectedFormField[] {
  return Array.from(document.querySelectorAll(FIELD_SELECTOR)).filter(element => {
    const html = element as HTMLElement;
    const style = getComputedStyle(html);
    return style.display !== "none" && style.visibility !== "hidden" && html.getClientRects().length > 0 && !html.hasAttribute("disabled") && !html.hasAttribute("readonly");
  }).map((element,index) => {
    const input = element as HTMLInputElement;
    const fieldId = "automula-field-" + (index + 1);
    element.setAttribute("data-automula-field-id",fieldId);
    const options = element instanceof HTMLSelectElement ? Array.from(element.options).filter(option => option.value !== "").map(option => ({label:option.textContent?.trim() || "",value:option.value})) : [];
    return {
      fieldId,
      question:getLabel(element),
      fieldType:getType(element),
      required:input.required || element.getAttribute("aria-required") === "true",
      options,
      hasExistingValue:hasValue(element),
      maxLength:input.maxLength > 0 ? input.maxLength : undefined
    };
  }).filter(field => field.question.length > 0 && field.fieldType !== "unknown");
}

export function fillApprovedFields(values: {fieldId:string;value:string;approved:boolean}[]): FillResult[] {
  return values.map(item => {
    if (!item.approved || !item.fieldId.startsWith("automula-field-")) return {fieldId:item.fieldId,status:"skipped",message:"Explicit approval is required."};
    const element = Array.from(document.querySelectorAll("[data-automula-field-id]")).find(node => node.getAttribute("data-automula-field-id") === item.fieldId);
    if (!element) return {fieldId:item.fieldId,status:"failed",message:"Field is no longer present."};
    if (element.hasAttribute("disabled") || element.hasAttribute("readonly")) return {fieldId:item.fieldId,status:"skipped",message:"Field is disabled or read-only."};
    if (hasValue(element)) return {fieldId:item.fieldId,status:"skipped",message:"Existing values are preserved."};
    if (element instanceof HTMLInputElement && ["password","file","hidden","checkbox","radio"].includes(element.type)) return {fieldId:item.fieldId,status:"skipped",message:"Sensitive and choice fields require manual interaction."};
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype,"value")?.set?.call(element,item.value);
    } else if (element instanceof HTMLSelectElement) {
      if (!Array.from(element.options).some(option => option.value === item.value)) return {fieldId:item.fieldId,status:"skipped",message:"Answer is not an available option."};
      element.value = item.value;
    } else return {fieldId:item.fieldId,status:"skipped",message:"Unsupported field widget."};
    element.dispatchEvent(new Event("input",{bubbles:true,composed:true}));
    element.dispatchEvent(new Event("change",{bubbles:true}));
    const actual = (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    return actual === item.value ? {fieldId:item.fieldId,status:"filled"} : {fieldId:item.fieldId,status:"failed",message:"Verification failed."};
  });
}

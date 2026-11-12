import type { DetectedFormField, FormFieldType } from "@automula/shared";

const FIELD_SELECTOR = [
  "input:not([type=hidden])",
  "textarea",
  "select",
  "[role=textbox]",
  "[role=combobox]",
  "[role=radio]",
  "[role=checkbox]"
].join(",");

function getLabel(element: Element): string {
  const input = element as HTMLInputElement;
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();

  if (input.labels?.length) {
    return Array.from(input.labels).map((label) => label.innerText.trim()).join(" ").trim();
  }

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }

  const placeholder = element.getAttribute("placeholder");
  if (placeholder) return placeholder.trim();

  const name = element.getAttribute("name");
  return name ? name.replace(/[_-]+/g, " ").trim() : "";
}

function getType(element: Element): FormFieldType {
  const role = element.getAttribute("role");
  if (role === "textbox") return "textarea";
  if (role === "combobox") return "select";
  if (role === "radio") return "radio";
  if (role === "checkbox") return "checkbox";

  if (element instanceof HTMLTextAreaElement) return "textarea";
  if (element instanceof HTMLSelectElement) return "select";

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (["text", "email", "tel", "number", "date", "file", "checkbox", "radio"].includes(type)) {
      return type as FormFieldType;
    }
  }

  return "unknown";
}

export function detectNativeFields(): DetectedFormField[] {
  return Array.from(document.querySelectorAll(FIELD_SELECTOR))
    .filter((element) => {
      const html = element as HTMLElement;
      const style = window.getComputedStyle(html);
      return style.display !== "none" && style.visibility !== "hidden" && html.getClientRects().length > 0;
    })
    .map((element, index) => {
      const input = element as HTMLInputElement;
      const fieldType = getType(element);
      const options =
        element instanceof HTMLSelectElement
          ? Array.from(element.options)
              .filter((option) => option.value !== "")
              .map((option) => ({ label: option.textContent?.trim() ?? "", value: option.value }))
          : [];

      return {
        fieldId: `automula-field-${index + 1}`,
        question: getLabel(element),
        fieldType,
        required: input.required || element.getAttribute("aria-required") === "true",
        options,
        hasExistingValue:
          element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
            ? Boolean(element.value)
            : element.getAttribute("aria-checked") === "true",
        maxLength: input.maxLength > 0 ? input.maxLength : undefined
      };
    })
    .filter((field) => field.question.length > 0);
}

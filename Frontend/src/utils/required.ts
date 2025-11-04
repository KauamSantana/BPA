// src/utils/required.ts

export type RequiredField = {
  name: string;          // name do input no <form>
  label: string;         // rótulo exibido no toast
  trim?: boolean;        // default: true
  when?: () => boolean;  // obrigatoriedade condicional
  type?: "text" | "select" | "radio" | "checkbox" | "number" | "file";
  // Agora aceita string[], além de string/File/File[]
  validate?: (value: string | string[] | File | File[] | null) => string | null;
};

export function validateRequiredFields(
  form: HTMLFormElement,
  fields: RequiredField[],
  onError: (msg: string) => void
): boolean {
  const fd = new FormData(form);
  let firstInvalid: HTMLElement | null = null;

  for (const f of fields) {
    if (f.when && !f.when()) continue;

    // 👇 inclui string[] no tipo
    let value: string | string[] | File | File[] | null = null;

    switch (f.type) {
      case "radio": {
        const radios = Array.from(
          form.querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${CSS.escape(f.name)}"]`
          )
        );
        const checked = radios.find(r => r.checked);
        value = checked ? checked.value : "";
        if (!checked && !firstInvalid) firstInvalid = radios[0] || null;
        break;
      }

      case "checkbox": {
        const checks = Array.from(
          form.querySelectorAll<HTMLInputElement>(
            `input[type="checkbox"][name="${CSS.escape(f.name)}"]`
          )
        );
        const checked = checks.filter(c => c.checked);
        // ✅ retorna string[] (valores marcados)
        value = checked.length ? checked.map(c => c.value) : [];
        if (checked.length === 0 && !firstInvalid) firstInvalid = checks[0] || null;
        break;
      }

      case "file": {
        const input = form.querySelector<HTMLInputElement>(
          `input[type="file"][name="${CSS.escape(f.name)}"]`
        );
        const files = input?.files;
        value = files && files.length ? Array.from(files) : [];
        if ((!value || (Array.isArray(value) && (value as File[]).length === 0)) && !firstInvalid)
          firstInvalid = input || null;
        break;
      }

      case "number": {
        const raw = fd.get(f.name);
        const v = typeof raw === "string" ? raw : "";
        value = v;
        if (!v || isNaN(Number(v)) || Number(v) === 0) {
          if (!firstInvalid) firstInvalid = form.elements.namedItem(f.name) as HTMLElement;
        }
        break;
      }

      case "select": {
        const raw = fd.get(f.name);
        const v = typeof raw === "string" ? raw : "";
        value = v;
        if (!v) if (!firstInvalid) firstInvalid = form.elements.namedItem(f.name) as HTMLElement;
        break;
      }

      default: { // text
        const raw = fd.get(f.name);
        const v = (typeof raw === "string" ? raw : "").toString();
        value = (f.trim ?? true) ? v.trim() : v;
        if (!value) if (!firstInvalid) firstInvalid = form.elements.namedItem(f.name) as HTMLElement;
      }
    }

    // vazio?
    const isEmpty =
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      onError(`O campo ${f.label} está vazio!`);
      if (firstInvalid && "focus" in firstInvalid) firstInvalid.focus();
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    // validação extra (formato, etc.)
    if (f.validate) {
      const msg = f.validate(value);
      if (msg) {
        onError(msg);
        if (firstInvalid && "focus" in firstInvalid) firstInvalid.focus();
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
    }
  }

  return true;
}

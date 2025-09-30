import React, { useState, useEffect } from "react";
import { Field, InputOutlined } from "./Form.jsx";
import { Button } from "./Button.jsx";
import { isValidCPF, formatCPF } from "../utils/cpf.js";
import { maskPhone, maskCEP } from "../utils/masks.js";
import { useAddressSuggestions } from "../hooks/useAddressSuggestions.js";
import { addressService } from "../services/addressService.js";

export function ContactForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    () =>
      initial || {
        name: "",
        cpf: "",
        phone: "",
        email: "",
        zipCode: "",
        state: "",
        city: "",
        address: "",
        number: "",
        neighborhood: "",
        complement: "",
        lat: null,
        lng: null,
      }
  );
  const [errors, setErrors] = useState({});
  const [addressQuery, setAddressQuery] = useState("");
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(null);
  const { suggestions, loading: loadingSug } = useAddressSuggestions({
    state: form.state,
    city: form.city,
    query: addressQuery,
  });

  // Efeito para buscar dados do CEP quando 8 dígitos preenchidos
  useEffect(() => {
    const raw = form.zipCode || "";
    const clean = raw.replace(/\D/g, "");
    let active = true;
    if (clean.length !== 8) {
      setZipCodeLoading(false);
      setZipCodeError(null);
      return () => {
        active = false;
      };
    }
    setZipCodeLoading(true);
    setZipCodeError(null);
    addressService
      .fetchCep(clean)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setZipCodeError("CEP não encontrado");
          return;
        }
        const addressData = data.data.completeAddress || {};
        setForm((f) => ({
          ...f,
          zipCode: addressData.zipCode || f.zipCode,
          state: addressData.state || f.state,
          city: addressData.city || f.city,
          address: addressData.address || f.address,
          neighborhood: addressData.neighborhood || f.neighborhood,
          lat: addressData.lat ?? f.lat,
          lng: addressData.lng ?? f.lng,
        }));
      })
      .catch((e) => {
        if (active) setZipCodeError(e.message || "Erro ao buscar CEP");
      })
      .finally(() => {
        if (active) setZipCodeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form.zipCode]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obrigatório";
    if (!isValidCPF(form.cpf)) e.cpf = "CPF inválido";
    if (form.phone.replace(/\D/g, "").length < 10)
      e.phone = "Telefone inválido";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "E-mail inválido";
    ["zipCode", "state", "city", "address", "number"].forEach((k) => {
      if (!(form[k] || "").trim()) e[k] = "Obrigatório";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name.startsWith("completeAddress.") ? name.split(".")[1] : name;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleMasked = (name, formatter) => (e) => {
    const v = formatter(e.target.value);
    e.target.value = v;
    handleChange(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const pickSuggestion = (s) => {
    setForm((f) => ({
      ...f,
      zipCode: s.zipCode || f.zipCode,
      state: s.state || f.state,
      city: s.city || f.city,
      neighborhood: s.neighborhood || f.neighborhood,
      address: s.address || f.address,
      lat: s.lat ?? f.lat,
      lng: s.lng ?? f.lng,
    }));
    setAddressQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 pt-1 overflow-y-auto thin-scroll"
    >
      <div className="grid gap-4 sm:grid-cols-2 auto-rows-min">
        <Field label="Nome" error={errors.name}>
          <InputOutlined
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="CPF" error={errors.cpf}>
          <InputOutlined
            label="CPF"
            name="cpf"
            value={formatCPF(form.cpf)}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "cpf",
                  value: e.target.value.replace(/\D/g, ""),
                },
              })
            }
            required
            suppressLabel
          />
        </Field>
        <Field label="Telefone" error={errors.phone}>
          <InputOutlined
            label="Telefone"
            name="phone"
            value={form.phone}
            onChange={handleMasked("phone", maskPhone)}
            required
            suppressLabel
          />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <InputOutlined
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="CEP" error={errors.zipCode || zipCodeError}>
          <InputOutlined
            label="CEP"
            name="zipCode"
            value={maskCEP(form.zipCode)}
            onChange={handleMasked("zipCode", maskCEP)}
            required
            suppressLabel
          />
        </Field>
        {/* Status CEP ocupa espaço reservado para não deslocar layout */}
        <div className="sm:col-span-2 min-h-[18px] -mt-2 flex items-center text-xs">
          {zipCodeLoading && (
            <span className="text-foreground/60 animate-pulse">
              Buscando CEP...
            </span>
          )}
          {!zipCodeLoading && zipCodeError && (
            <span className="text-[var(--md-sys-color-error)]">
              {zipCodeError}
            </span>
          )}
        </div>
        <Field label="Logradouro" error={errors.address}>
          <InputOutlined
            label="Logradouro"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="Número" error={errors.number}>
          <InputOutlined
            label="Número"
            name="number"
            value={form.number}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="Complemento">
          <InputOutlined
            label="Complemento"
            name="complement"
            value={form.complement}
            onChange={handleChange}
            suppressLabel
          />
        </Field>
        <Field label="Bairro" error={errors.neighborhood}>
          <InputOutlined
            label="Bairro"
            name="neighborhood"
            value={form.neighborhood}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="Cidade" error={errors.city}>
          <InputOutlined
            label="Cidade"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            suppressLabel
          />
        </Field>
        <Field label="UF" error={errors.state}>
          <InputOutlined
            label="UF"
            name="state"
            value={form.state}
            onChange={handleChange}
            maxLength={2}
            required
            suppressLabel
          />
        </Field>
      </div>

      <div className="space-y-2">
        <Field label="Pesquisar endereço (logradouro)" error={errors.geo}>
          <InputOutlined
            label="Pesquisar endereço (logradouro)"
            placeholder="Digite parte do logradouro"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            autoComplete="off"
            name="no-autofill-address"
            inputMode="search"
            suppressLabel
          />
        </Field>
        {addressQuery && suggestions.length > 0 && (
          <div className="max-h-40 overflow-y-auto border border-muted rounded-md bg-background text-sm divide-y divide-muted/40">
            {suggestions.map((s, i) => {
              const addr = s.address || s.logradouro || "";
              const loc = s.locality || s.cidade || "";
              const st = s.state || s.uf || "";
              const zip = s.zipCode || s.cep;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="w-full text-left px-3 py-2 hover:bg-muted"
                >
                  {addr}, {loc}/{st}{" "}
                  {zip && <span className="opacity-60">CEP {zip}</span>}
                </button>
              );
            })}
          </div>
        )}
        {loadingSug && (
          <div className="text-xs opacity-70">Buscando sugestões...</div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

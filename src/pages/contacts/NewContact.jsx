import React from "react";
import { ContactForm } from "../../components/ContactForm.jsx";
import { useContacts } from "../../context/ContactsContext.jsx";
import { useNavigate } from "react-router-dom";

export default function NewContactPage() {
  const { addContact } = useContacts();
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Novo Contato</h1>
      <ContactForm
        onSubmit={(data) => {
          addContact(data);
          navigate("/");
        }}
        onCancel={() => navigate("/")}
      />
    </div>
  );
}

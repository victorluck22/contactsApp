import React from "react";
import { ContactForm } from "../../components/ContactForm.jsx";
import { useContacts } from "../../context/ContactsContext.jsx";
import { useNavigate, useParams } from "react-router-dom";

export default function EditContactPage() {
  const { contacts, updateContact } = useContacts();
  const navigate = useNavigate();
  const { id } = useParams();
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return <div className="p-4">Contato não encontrado.</div>;
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Editar Contato</h1>
      <ContactForm
        initial={contact}
        onSubmit={(data) => {
          updateContact(contact.id, data);
          navigate("/");
        }}
        onCancel={() => navigate("/")}
      />
    </div>
  );
}

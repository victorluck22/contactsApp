import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useContacts } from "../context/ContactsContext.jsx";

// Corrigir ícones default Leaflet no bundler
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 13, { duration: 1.1 });
    }
  }, [lat, lng, map]);
  return null;
}

export function MapView() {
  const { contacts, selectedId } = useContacts();
  const validContacts = useMemo(
    () =>
      contacts.filter(
        (c) => typeof c.lat === "number" && typeof c.lng === "number"
      ),
    [contacts]
  );

  const selected = useMemo(
    () => validContacts.find((c) => c.id === selectedId),
    [validContacts, selectedId]
  );
  // Se não houver selecionado, tenta o primeiro válido, senão fallback SP
  const center = selected
    ? [selected.lat, selected.lng]
    : validContacts.length > 0
    ? [validContacts[0].lat, validContacts[0].lng]
    : [-25.441699, -49.276601];

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={center}
        zoom={5}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validContacts.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]}>
            <Popup>
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs opacity-70">
                {c.address}, {c.number}
                {c.neighborhood && ` - ${c.neighborhood}`}
                {" - "}
                {c.city && `${c.city}/${c.state}`}
              </div>
            </Popup>
          </Marker>
        ))}
        {selected && <FlyTo lat={selected.lat} lng={selected.lng} />}
      </MapContainer>
    </div>
  );
}

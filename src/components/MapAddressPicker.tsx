"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export interface MapAddressPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: string;
  onSelect: (address: string) => void;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export default function MapAddressPicker({
  open,
  onOpenChange,
  initialAddress,
  onSelect,
}: MapAddressPickerProps) {
  const [ymapsApi, setYmapsApi] = useState<any>(null);
  const geocodeRef = useRef<any>(null);
  const [query, setQuery] = useState<string>(initialAddress || "");
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialAddress || ""
  );
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const mapRef = useRef<any>(null);

  const apiKey: string | undefined = (process.env
    .NEXT_PUBLIC_YANDEX_MAPS_API_KEY as any) || undefined;

  useEffect(() => {
    if (!open) return;
    setQuery(initialAddress || "");
    setSelectedAddress(initialAddress || "");
  }, [open, initialAddress]);

  const handleMapClick = useCallback(
    async (e: any) => {
      if (!ymapsApi) return;
      // Yandex Maps uses [latitude, longitude]
      const [lat, lon] = e.get("coords") as [number, number];
      setCoords({ lat, lon });
      try {
        const res = await ymapsApi.geocode([lat, lon]);
        const first = res.geoObjects.get(0);
        const addr = first?.getAddressLine?.() || first?.getName?.() || "";
        setSelectedAddress(addr);
        setQuery(addr);
      } catch (err) {
        // noop
      }
    },
    [ymapsApi]
  );

  const handleSearch = useCallback(
    async (event?: React.FormEvent) => {
      if (event) event.preventDefault();
      if (!ymapsApi || !query?.trim()) return;
      try {
        const geocode = geocodeRef.current || ymapsApi.geocode;
        geocodeRef.current = geocode;
        const res = await geocode(query.trim());
        const first = res.geoObjects.get(0);
        if (!first) return;
        const geometry = first.geometry?.getCoordinates?.();
        if (Array.isArray(geometry)) {
          // geometry returns [latitude, longitude]
          const [lat, lon] = geometry as [number, number];
          setCoords({ lat, lon });
          const addrLine = first.getAddressLine?.() || query.trim();
          setSelectedAddress(addrLine);
          if (mapRef.current) {
            mapRef.current.setCenter([lat, lon], 15, { duration: 300 });
          }
        }
      } catch (err) {
        // noop
      }
    },
    [ymapsApi, query]
  );

  const handleSelect = useCallback(() => {
    const value = (selectedAddress || query || "").trim();
    onSelect(value);
    onOpenChange(false);
  }, [onSelect, onOpenChange, selectedAddress, query]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Выбрать адрес</DrawerTitle>
          </DrawerHeader>
          <div className="p-2">
            <div className="rounded-lg overflow-hidden tg-border border mb-3">
              <YMaps
                query={{
                  apikey: apiKey,
                  lang: "ru_RU",
                  load: "package.full",
                }}
              >
                <Map
                  defaultState={{ center: [55.751244, 37.618423], zoom: 9 }}
                  width="100%"
                  height="320px"
                  instanceRef={(ref: any) => (mapRef.current = ref)}
                  onLoad={(ymaps: any) => {
                    setYmapsApi(ymaps);
                  }}
                  onClick={handleMapClick}
                >
                  {coords && (
                    <Placemark geometry={[coords.lat, coords.lon]} />
                  )}
                </Map>
              </YMaps>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                placeholder="Поиск или выбранный адрес"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                Найти
              </Button>
            </form>
          </div>
          <DrawerFooter>
            <Button onClick={handleSelect} disabled={!query?.trim()}>
              Выбрать
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}



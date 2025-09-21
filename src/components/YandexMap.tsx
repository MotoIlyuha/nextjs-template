'use client';

import React, { useEffect, useRef, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

interface YandexMapProps {
  address: string;
  className?: string;
}

export default function YandexMap({ address, className = '' }: YandexMapProps) {
  const mapRef = useRef<ymaps.Map | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([55.751574, 37.573856]);

  useEffect(() => {
    if (!address || !isLoaded) return;

    // Геокодирование адреса
    const geocodeAddress = async () => {
      try {
        const ymaps = (window as any).ymaps;
        if (!ymaps) return;

        const geocoder = ymaps.geocode(address);
        geocoder.then((result: any) => {
          const firstGeoObject = result.geoObjects.get(0);
          if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates();
            setCoordinates(coords);
            
            if (mapRef.current) {
              mapRef.current.setCenter(coords, 15);
            }
          }
        }).catch((error: any) => {
          console.error('Ошибка геокодирования:', error);
          setHasError(true);
        });
      } catch (error) {
        console.error('Ошибка геокодирования:', error);
        setHasError(true);
      }
    };

    geocodeAddress();
  }, [address, isLoaded]);

  // Обработчик загрузки карты
  useEffect(() => {
    const checkYmapsLoaded = () => {
      if ((window as any).ymaps) {
        setIsLoaded(true);
      } else {
        setTimeout(checkYmapsLoaded, 100);
      }
    };
    
    checkYmapsLoaded();
  }, []);

  if (!address) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center text-sm opacity-60 ${className}`}>
        Адрес не указан
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center text-sm opacity-60 ${className}`}>
        <div className="text-center">
          <div className="mb-1">Не удалось загрузить карту</div>
          <div className="text-xs opacity-70">{address}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <YMaps
        query={{
          apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'demo',
          lang: 'ru_RU',
          load: 'package.full'
        }}
      >
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: coordinates,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
          }}
          width="100%"
          height="100%"
          modules={['geocode', 'coordSystem.geo']}
          options={{
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true
          }}
        >
          <Placemark
            geometry={coordinates}
            options={{
              preset: 'islands#redDotIcon',
              iconColor: '#3b82f6'
            }}
          />
        </Map>
      </YMaps>
    </div>
  );
}

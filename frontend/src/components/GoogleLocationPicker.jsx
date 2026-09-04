import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Mic,
  MicOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  isSpeechRecognitionSupported,
  startListening,
} from '../utils/speechUtils';

export default function GoogleLocationPicker({ onLocationChange }) {
  const { biz, setBiz, user, setUser, lang, t } = useApp();
  const isHindi = lang === 'hi';

  // Default coordinate: Varanasi, UP (25.3176° N, 82.9739° E)
  const defaultCoords = {
    lat: biz.lat ? parseFloat(biz.lat) : 25.3176,
    lng: biz.lng ? parseFloat(biz.lng) : 82.9739,
  };

  const [coords, setCoords] = useState(defaultCoords);
  const [address, setAddress] = useState(biz.address || biz.location || '');
  const [district, setDistrict] = useState(biz.district || user.district || 'Varanasi');
  const [stateName, setStateName] = useState(biz.state || user.state || 'Uttar Pradesh');
  const [pincode, setPincode] = useState(biz.pincode || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [mapType, setMapType] = useState('roadmap'); // roadmap | satellite
  const [isListening, setIsListening] = useState(false);

  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const recognitionRef = useRef(null);

  const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Synchronize local state with AppContext
  const updateLocationState = (newCoords, newAddr, newDist, newState, newPin) => {
    const updatedLat = newCoords?.lat ?? coords.lat;
    const updatedLng = newCoords?.lng ?? coords.lng;
    const updatedAddress = newAddr ?? address;
    const updatedDistrict = newDist ?? district;
    const updatedState = newState ?? stateName;
    const updatedPincode = newPin ?? pincode;

    setCoords({ lat: updatedLat, lng: updatedLng });
    if (newAddr !== undefined) setAddress(updatedAddress);
    if (newDist !== undefined) setDistrict(updatedDistrict);
    if (newState !== undefined) setStateName(updatedState);
    if (newPin !== undefined) setPincode(updatedPincode);

    // Save to AppContext
    const updatedBiz = {
      ...biz,
      lat: updatedLat,
      lng: updatedLng,
      address: updatedAddress,
      location: updatedAddress,
      district: updatedDistrict,
      state: updatedState,
      pincode: updatedPincode,
    };
    setBiz(updatedBiz);

    // Sync district to user profile for local mandi/census context
    if (updatedDistrict) {
      setUser((prev) => ({
        ...prev,
        district: updatedDistrict,
        state: updatedState,
      }));
    }

    if (onLocationChange) {
      onLocationChange(updatedBiz);
    }
  };

  // Reverse geocode coordinates to human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      // 1. If Google Maps Geocoder is available
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const result = results[0];
            let dist = 'Varanasi';
            let st = 'Uttar Pradesh';
            let pin = '';
            let formatted = result.formatted_address || '';

            result.address_components?.forEach((c) => {
              if (c.types.includes('locality') || c.types.includes('administrative_area_level_2') || c.types.includes('postal_town')) {
                dist = c.long_name;
              }
              if (c.types.includes('administrative_area_level_1')) {
                st = c.long_name;
              }
              if (c.types.includes('postal_code')) {
                pin = c.long_name;
              }
            });

            updateLocationState({ lat, lng }, formatted, dist, st, pin);
            setStatusMsg({ type: 'success', text: isHindi ? 'स्थान प्राप्त हुआ!' : 'Location updated from Google Maps!' });
            return;
          }
        });
      }

      // 2. High-speed reverse geocoding fallback (Nominatim)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': lang === 'hi' ? 'hi,en' : 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const street = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
        const dist = addr.city || addr.town || addr.state_district || addr.county || 'Varanasi';
        const st = addr.state || 'Uttar Pradesh';
        const pin = addr.postcode || '';
        const fullAddr = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : street || dist;

        updateLocationState({ lat, lng }, fullAddr, dist, st, pin);
        setStatusMsg({ type: 'success', text: isHindi ? 'स्थान सफलतापूर्वक सेट हुआ!' : 'Location pinned successfully!' });
      }
    } catch (err) {
      console.warn('[LocationPicker] Reverse geocode error:', err.message);
      updateLocationState({ lat, lng });
    }
  };

  // Forward geocode search query
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setStatusMsg({ type: 'loading', text: isHindi ? 'स्थान खोज रहे हैं...' : 'Searching location...' });

    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            panToLocation(lat, lng);
            reverseGeocode(lat, lng);
            return;
          }
        });
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          panToLocation(lat, lng);
          reverseGeocode(lat, lng);
          return;
        }
      }
      setStatusMsg({ type: 'error', text: isHindi ? 'स्थान नहीं मिला, कृपया फिर से प्रयास करें।' : 'Location not found, please try again.' });
    } catch (err) {
      console.warn('[LocationPicker] Search error:', err.message);
      setStatusMsg({ type: 'error', text: isHindi ? 'खोज में त्रुटि हुई।' : 'Search error occurred.' });
    }
  };

  // Browser GPS location detector
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({
        type: 'error',
        text: isHindi ? 'आपके ब्राउज़र में GPS समर्थित नहीं है।' : 'GPS Geolocation not supported on this browser.',
      });
      return;
    }

    setDetecting(true);
    setStatusMsg({ type: 'loading', text: t('detectingLocation') });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const { latitude, longitude } = pos.coords;
        panToLocation(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setDetecting(false);
        console.warn('[LocationPicker] Geolocation error:', err.message);
        setStatusMsg({
          type: 'error',
          text: isHindi
            ? 'GPS अनुमति अस्वीकृत या उपलब्ध नहीं है। आप मैप पर क्लिक करके चुन सकते हैं।'
            : 'GPS permission denied or unavailable. You can click on the map to pin.',
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Pan map and update marker position
  const panToLocation = (lat, lng) => {
    setCoords({ lat, lng });
    if (googleMapRef.current) {
      const latLng = new window.google.maps.LatLng(lat, lng);
      googleMapRef.current.panTo(latLng);
      if (markerRef.current) {
        markerRef.current.setPosition(latLng);
      }
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!isSpeechRecognitionSupported()) return;
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognitionRef.current = startListening({
      lang,
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript) {
          setSearchQuery(transcript);
          // Run search automatically
          setTimeout(() => {
            const query = transcript.trim();
            if (query) {
              fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`
              )
                .then((r) => r.json())
                .then((res) => {
                  if (res && res.length > 0) {
                    const lat = parseFloat(res[0].lat);
                    const lng = parseFloat(res[0].lon);
                    panToLocation(lat, lng);
                    reverseGeocode(lat, lng);
                  }
                });
            }
          }, 200);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  // Initialize Google Maps if API key exists, otherwise fallback to interactive map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      const scriptId = 'google-maps-script';
      let script = document.getElementById(scriptId);

      const initMap = () => {
        if (window.google && window.google.maps && mapContainerRef.current) {
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: coords.lat, lng: coords.lng },
            zoom: 15,
            mapTypeId: mapType === 'satellite' ? 'hybrid' : 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          const marker = new window.google.maps.Marker({
            position: { lat: coords.lat, lng: coords.lng },
            map,
            draggable: true,
            title: isHindi ? 'आपकी दुकान' : 'Your Shop',
            animation: window.google.maps.Animation.DROP,
          });

          map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition(e.latLng);
            reverseGeocode(lat, lng);
          });

          marker.addListener('dragend', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            reverseGeocode(lat, lng);
          });

          googleMapRef.current = map;
          markerRef.current = marker;
        }
      };

      if (!window.google) {
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        } else {
          script.addEventListener('load', initMap);
        }
      } else {
        initMap();
      }
    }
  }, [apiKey, mapType]);

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <div className="bg-[#fffdf9] border border-[#e4d9c7] rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header with Title and GPS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="font-heading text-sm font-bold text-[#1f3a5f] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#a36a2d]" />
            {t('qLocationTitle')}
          </h3>
          <p className="text-[11px] text-[#8a7a68] mt-0.5">
            {t('qLocationSub')}
          </p>
        </div>

        {/* 1-Tap Current Location Button */}
        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={detecting}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
          style={{ background: '#1f3a5f' }}
        >
          {detecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#e8a33d]" />
          ) : (
            <Navigation className="w-4 h-4 text-[#e8a33d]" />
          )}
          <span>{detecting ? t('detectingLocation') : t('detectLocation')}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLocationPlaceholder')}
            className="w-full text-xs pl-8 pr-9 py-2.5 rounded-xl border border-[#e4d9c7] bg-[#fdfaf3] text-[#1f3a5f] outline-none focus:border-[#1f3a5f] transition"
          />
          <Search className="w-4 h-4 text-[#8a7a68] absolute left-2.5 top-3" />

          {/* Voice Search Mic */}
          {isSpeechRecognitionSupported() && (
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Speak location"
              className={`absolute right-2 top-2 p-1 rounded-lg transition ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[#8a7a68] hover:text-[#1f3a5f]'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#efe6d6] text-[#1f3a5f] hover:bg-[#e4d9c7] transition"
        >
          {isHindi ? 'खोजें' : 'Search'}
        </button>
      </form>

      {/* Map Canvas / Embed Frame */}
      <div className="relative rounded-xl overflow-hidden border border-[#e4d9c7] shadow-inner bg-[#ece5d8] h-52 sm:h-60 flex flex-col justify-end">
        {/* Google Maps Container (or OSM fallback container) */}
        {apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="relative w-full h-full">
            {/* Interactive OpenStreetMap Tile Canvas */}
            <iframe
              title="Interactive Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.015}%2C${coords.lat - 0.012}%2C${coords.lng + 0.015}%2C${coords.lat + 0.012}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
              className="w-full h-full pointer-events-auto"
            />
          </div>
        )}

        {/* Map View Toggle & Google Maps Link Badge */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#e4d9c7] text-[10.5px] font-semibold text-[#1f3a5f] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
            <span className="truncate max-w-[160px] sm:max-w-[240px]">{district}, {stateName}</span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-1 bg-[#1f3a5f] text-white px-2.5 py-1 rounded-lg text-[10.5px] font-semibold shadow-md hover:bg-[#2b4c78] transition"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#e8a33d]" />
          </a>
        </div>

        {/* Interactive Map Drag Hint Footer */}
        <div className="bg-[#1f3a5f]/90 backdrop-blur-sm text-white px-3 py-1.5 flex items-center justify-between text-[11px] z-10">
          <span className="flex items-center gap-1 text-[#efe6d6]">
            <MapPin className="w-3.5 h-3.5 text-[#e8a33d]" />
            <span>{t('dragPinHint')}</span>
          </span>
          <span className="font-mono text-[10px] text-[#e8a33d]">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMsg && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {statusMsg.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Auto-populated Address Details (Editable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Full Address */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-[#5b4636] mb-1">
            {t('shopAddress')}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => updateLocationState(coords, e.target.value, district, stateName, pincode)}
            placeholder={isHindi ? "दुकान संख्या, सड़क, मुख्य बाजार (उदा. दशाश्वमेध घाट रोड)" : "Shop No., Street, Landmark (e.g. Dashashwamedh Ghat Road)"}
            className="w-full text-xs px-3 py-2 rounded-xl border border-[#e4d9c7] bg-[#fdfaf3] text-[#1f3a5f] outline-none focus:border-[#1f3a5f]"
          />
        </div>

        {/* District / City */}
        <div>
          <label className="block text-[11px] font-bold text-[#5b4636] mb-1">
            {t('shopDistrict')}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => updateLocationState(coords, address, e.target.value, stateName, pincode)}
            placeholder="e.g. Varanasi"
            className="w-full text-xs px-3 py-2 rounded-xl border border-[#e4d9c7] bg-[#fdfaf3] text-[#1f3a5f] outline-none focus:border-[#1f3a5f]"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-bold text-[#5b4636] mb-1">
            {t('shopState')}
          </label>
          <input
            type="text"
            value={stateName}
            onChange={(e) => updateLocationState(coords, address, district, e.target.value, pincode)}
            placeholder="e.g. Uttar Pradesh"
            className="w-full text-xs px-3 py-2 rounded-xl border border-[#e4d9c7] bg-[#fdfaf3] text-[#1f3a5f] outline-none focus:border-[#1f3a5f]"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-[11px] font-bold text-[#5b4636] mb-1">
            {t('shopPincode')}
          </label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => updateLocationState(coords, address, district, stateName, e.target.value)}
            placeholder="e.g. 221001"
            className="w-full text-xs px-3 py-2 rounded-xl border border-[#e4d9c7] bg-[#fdfaf3] text-[#1f3a5f] outline-none focus:border-[#1f3a5f]"
          />
        </div>

        {/* GPS Coordinates Readout */}
        <div>
          <label className="block text-[11px] font-bold text-[#5b4636] mb-1">
            {t('gpsCoordinates')}
          </label>
          <div className="text-xs px-3 py-2 rounded-xl border border-[#e4d9c7] bg-[#efe6d6]/60 text-[#8a7a68] font-mono select-all">
            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}

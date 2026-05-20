import { useState, useEffect, useCallback } from 'react';
import { api, USE_MOCK } from '../services/api';
import { TANKS } from '../mock/tanks.mock';
import { FLOW_METERS } from '../mock/flowMeters.mock';

/**
 * Parses the API date format "DD-MM-YYYY HH:MM:SS" into a JS Date.
 * Also handles ISO-like "YYYY-MM-DD HH:MM:SS" format from last_synced_at.
 */
const parseApiDate = (str) => {
  if (!str || str === '-') return null;
  const ddmm = str.match(/^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/);
  if (ddmm) {
    const [, dd, mm, yyyy, hh, min, ss] = ddmm;
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
  }
  const isoDate = new Date(str.replace(' ', 'T'));
  return isNaN(isoDate) ? null : isoDate;
};

/**
 * Formats a date string (any API format) to a human-readable string.
 */
export const formatApiDate = (str, opts = {}) => {
  const date = parseApiDate(str);
  if (!date) return '—';
  const { timeOnly = false } = opts;
  if (timeOnly) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleString([], {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const buildEventLog = (sensor, item) => {
  const raw = sensor.raw_payload || {};
  const candidates = [
    raw.created_at && { time: raw.created_at, event: 'SENSOR_CREATED', detail: 'Sensor registered in the system', variant: 'info' },
    raw.updated_at && { time: raw.updated_at, event: 'CONFIG_UPDATED', detail: 'Sensor configuration last updated', variant: 'info' },
    raw.value_set_at && { time: raw.value_set_at, event: 'VALUE_SET', detail: `Baseline set: ${sensor.value} ${raw.unit_of_measurement || ''}`, variant: 'success' },
    raw.value_changed_at && { time: raw.value_changed_at, event: 'VALUE_CHANGED', detail: `Reading changed: ${sensor.value} ${raw.unit_of_measurement || ''}`, variant: 'warning' },
    item.time && { time: item.time, event: 'LAST_READING', detail: `Hardware reading: ${sensor.value} ${raw.unit_of_measurement || ''}`, variant: 'success' },
    item.last_synced_at && { time: item.last_synced_at, event: 'DEVICE_SYNCED', detail: 'Device telemetry synced with server', variant: 'info' },
  ].filter(Boolean);

  return candidates.sort((a, b) => {
    const da = parseApiDate(a.time);
    const db = parseApiDate(b.time);
    if (!da || !db) return 0;
    return db - da;
  });
};

export const useDeviceData = () => {
  const [tanks, setTanks] = useState([]);
  const [flowMeters, setFlowMeters] = useState([]);
  const [device, setDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const mapIoParameter = (tagName) => {
      const lower = (tagName || '').toLowerCase();
      if (lower.includes('combinedfuel') || lower.includes('combined_fuel')) return 'Fuel';
      if (lower.includes('ignition')) return 'Ignition Status';
      if (lower.includes('movement')) return 'Movement Status';
      if (lower.includes('ext_voltage')) return 'Power Voltage';
      if (lower.includes('bat_voltage')) return 'Internal Battery';
      if (lower.includes('gnss_status')) return 'GNSS Status';
      if (lower.includes('gsm_signal')) return 'GSM Signal';
      if (lower.includes('total_odometer')) return 'Odometer';
      return tagName;
    };

    const isFuelTankSensor = (sensor) => {
      const raw = sensor.raw_payload || {};
      const searchableText = `${sensor.type || ''} ${sensor.name || ''} ${raw.tag_name || ''} ${raw.type_title || ''}`.toLowerCase();
      return (
        sensor.type === 'fuel_tank' ||
        searchableText.includes('fuel_tank') ||
        searchableText.includes('fuel tank') ||
        searchableText.includes('combinedfuel') ||
        searchableText.includes('combined_fuel') ||
        searchableText.includes('fuel_level') ||
        searchableText.includes('fuel level')
      );
    };

    const isFlowMeterSensor = (sensor) => {
      const raw = sensor.raw_payload || {};
      const searchableText = `${sensor.type || ''} ${sensor.name || ''} ${raw.tag_name || ''} ${raw.type_title || ''}`.toLowerCase();
      return (
        sensor.type === 'fuel_consumption' ||
        searchableText.includes('fuel_consumption') ||
        searchableText.includes('fuel consumption') ||
        searchableText.includes('flow') ||
        searchableText.includes('meter')
      );
    };

    const isBatterySensor = (sensor) => {
      const lower = (sensor.name || '').toLowerCase();
      return sensor.type === 'battery' || lower.includes('battery');
    };

    const parseDeviceItem = (item) => {
      const deviceInfo = {
        id: item.device_id,
        name: item.name,
        status: item.status,
        protocol: item.protocol === 'teltonika' ? 'Techtonics' : item.protocol,
        power: item.power,
        location: item.location,
        lastReadingAt: item.time,
        lastSyncedAt: item.last_synced_at,
      };

      const sensors = Array.isArray(item.sensors) ? item.sensors : [];
      const tankSensors = sensors.filter(isFuelTankSensor);
      const flowSensors = sensors.filter(isFlowMeterSensor);
      const batterySensor = sensors.find(isBatterySensor);

      const batteryLevel = batterySensor ? {
        value: batterySensor.value,
        unit: batterySensor.unit_of_measurement || '%',
        updatedAt: batterySensor.raw_payload?.updated_at || item.time
      } : null;

      const calculateUsageRate = () => {
        if (flowSensors.length === 0) return 0;
        return flowSensors.reduce((acc, fs) => {
          const val = parseFloat(fs.value === '-' ? '0' : fs.value) || 0;
          const raw = fs.raw_payload || {};
          const setAt = parseApiDate(raw.value_set_at);
          const now = parseApiDate(item.time);
          if (setAt && now && now > setAt) {
            const diffDays = (now - setAt) / (1000 * 60 * 60 * 24);
            return acc + (val / (diffDays || 1));
          }
          return acc + (val > 1000 ? val / 30 : val);
        }, 0);
      };

      const networkUsageRate = calculateUsageRate();

      const parsedTanks = tankSensors.map(sensor => {
        const raw = sensor.raw_payload || {};
        const currentVolume = parseFloat(sensor.value === '-' ? '0' : sensor.value) || 0;
        let calibrationMax = 0;
        let calibrationData = null;
        const calRaw = raw.calibrations || raw.calibration;

        if (calRaw) {
          try {
            const cal = typeof calRaw === 'string' ? JSON.parse(calRaw) : calRaw;
            if (Array.isArray(cal)) {
              calibrationData = cal;
              calibrationMax = Math.max(...cal.map(c => parseFloat(c.volume || c.liters || c.y || 0)));
            } else if (typeof cal === 'object' && cal !== null) {
              calibrationData = Object.entries(cal).map(([x, y]) => ({
                x: parseFloat(x),
                y: parseFloat(y),
                raw: x,
                volume: y
              })).sort((a, b) => a.x - b.x);
              if (calibrationData.length > 0) {
                calibrationMax = Math.max(...calibrationData.map(c => parseFloat(c.y || 0)));
              }
            }
          } catch (e) {
            console.warn('Failed to parse calibration for tank:', sensor.sensor_id, e);
          }
        }

        const capacity = calibrationMax || parseFloat(raw.full_tank) || parseFloat(raw.full_tank_value) || 500;
        const fillPct = capacity > 0 ? (currentVolume / capacity) * 100 : 0;
        const tagName = mapIoParameter(raw.tag_name || sensor.name);
        const tankUsageShare = networkUsageRate / (tankSensors.length || 1);
        const daysToEmpty = tankUsageShare > 0
          ? Math.min(99, Math.round(currentVolume / tankUsageShare))
          : 21;

        return {
          id: `tank-${item.device_id}-${sensor.sensor_id}`,
          sensorId: sensor.sensor_id,
          deviceId: item.device_id,
          name: raw.fuel_tank_name || (tagName === 'Fuel' ? `Fuel Tank ${sensor.sensor_id}` : tagName),
          site: item.name || 'Unknown Site',
          currentVolume,
          capacity,
          fillPct: Math.round(fillPct * 100) / 100,
          warningThreshold: 30,
          criticalThreshold: 15,
          daysToEmpty,
          lastReadingAt: item.time,
          lastSyncedAt: item.last_synced_at,
          status: item.status,
          location: item.location,
          isStale: item.status === 'offline',
          activeIncidents: 0,
          linkedFlowMeters: [],
          history: [],
          battery: batteryLevel,
          deviceInfo,
          sensorInfo: {
            sensorId: sensor.sensor_id,
            sensorName: sensor.name,
            tagName,
            type: raw.type_title || sensor.type,
            formula: raw.formula || 'None (raw value)',
            unit: raw.unit_of_measurement || 'Liters',
            fullTank: raw.full_tank || '—',
            fullTankValue: raw.full_tank_value || '—',
            hasCalibration: !!calibrationMax,
            calibrationCapacity: calibrationMax || '—',
            calibrationData: calibrationData,
            addToGraph: raw.add_to_graph === 1,
            addToHistory: raw.add_to_history === 1,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
          },
          eventLog: buildEventLog(sensor, item),
        };
      });

      const parsedFlowMeters = flowSensors.map(sensor => {
        const raw = sensor.raw_payload || {};
        const rawValue = sensor.value === '-' ? '0' : sensor.value;
        const dailyTotal = parseFloat(rawValue) || 0;
        const tagName = mapIoParameter(raw.tag_name || sensor.name);

        return {
          id: `fm-${item.device_id}-${sensor.sensor_id}`,
          sensorId: sensor.sensor_id,
          deviceId: item.device_id,
          serial: sensor.name,
          linkedTankId: '',
          linkedSite: item.name || 'Unknown Site',
          status: item.status === 'offline' ? 'inactive' : 'active',
          currentFlowRate: 0,
          dailyTotal,
          shiftTotal: 0,
          cumulativeVolume: dailyTotal,
          lastReadingAt: item.time,
          lastSyncedAt: item.last_synced_at,
          mismatched: false,
          history: raw.history || sensor.history || [],
          battery: batteryLevel,
          deviceInfo,
          sensorInfo: {
            sensorId: sensor.sensor_id,
            sensorName: sensor.name,
            tagName,
            type: raw.type_title || sensor.type,
            formula: raw.formula || 'None (raw value)',
            unit: raw.unit_of_measurement || 'Liters',
            shownValueBy: raw.shown_value_by || '—',
            addToGraph: raw.add_to_graph === 1,
            addToHistory: raw.add_to_history === 1,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
          },
          eventLog: buildEventLog(sensor, item),
        };
      });

      return {
        deviceInfo,
        tanks: parsedTanks,
        flowMeters: parsedFlowMeters,
      };
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockTanks = TANKS.map(t => ({
            ...t,
            id: `tank-${t.id}`,
            deviceId: t.id,
            location: t.location || 'Terminal A, Zone 1',
            battery: t.battery || { value: '88', unit: '%', updatedAt: new Date().toISOString() },
            lastReadingAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            eventLog: [],
            deviceInfo: { name: t.name, status: 'online', protocol: 'Techtonics' }
          }));
          setTanks(mockTanks);
          setFlowMeters(FLOW_METERS);
          setDevice(mockTanks[0] || null);
          setDevices(mockTanks.map(t => ({ device_id: t.deviceId, name: t.name })));
          return;
        }

        const devicesResponse = await api.get('/devices');
        const deviceList = devicesResponse.data?.returnData?.list_of_item || [];
        const normalizedDevices = Array.isArray(deviceList) ? deviceList : [];
        setDevices(normalizedDevices);

        const deviceDetailRequests = normalizedDevices
          .map(deviceItem => deviceItem.device_id || deviceItem.id)
          .filter(Boolean)
          .map(deviceId => api.get(`/devices/${deviceId}/details-with-sensors`));

        const detailResponses = await Promise.allSettled(deviceDetailRequests);

        const parsedResults = detailResponses
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value.data?.returnData?.item)
          .filter(Boolean)
          .map(parseDeviceItem);

        const allTanks = (parsedResults || []).flatMap(result => result?.tanks || []).filter(Boolean);
        const allFlowMeters = (parsedResults || []).flatMap(result => result?.flowMeters || []).filter(Boolean);
        const allDeviceInfos = (parsedResults || []).map(result => result?.deviceInfo).filter(Boolean);

        setTanks(allTanks);
        setFlowMeters(allFlowMeters);
        setDevice(allDeviceInfos[0] || null);
      } catch (err) {
        console.error('Failed to fetch device data:', err);
        setError(err?.message || 'Unknown error during telemetry sync');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  return { tanks, flowMeters, device, devices, loading, error, refetch };
};

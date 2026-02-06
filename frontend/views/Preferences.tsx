import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Calendar,
  DollarSign,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import Button from "../components/Button";
import { TravelStyle } from "../types";
import { userAPI, getStartLocations } from "../services/apiService";

const BUDGET_RANGE_MAP: Record<string, number> = {
  budget: 50000,
  moderate: 100000,
  comfort: 200000,
  luxury: 400000,
  premium: 500000,
};

const calculateDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const diffTime = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

const Preferences: React.FC = () => {
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [budget, setBudget] = useState(500000);
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startLocations, setStartLocations] = useState<string[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const navigate = useNavigate();

  // Fetch start locations from API
  useEffect(() => {
    const fetchStartLocations = async () => {
      try {
        const locationNames = await getStartLocations();
        setStartLocations(locationNames);
        if (locationNames.length > 0 && !startLocation) {
          setStartLocation(locationNames[0]);
        }
      } catch (error) {
        console.error("Failed to fetch start locations:", error);
        // Fallback to hardcoded values if API fails
        setStartLocations([
          "Colombo Port",
          "Galle Port",
          "Kandy",
          "Anuradhapura",
        ]);
        if (!startLocation) setStartLocation("Colombo Port");
      }
    };

    fetchStartLocations();
  }, []);

  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const prefs = await userAPI.getPreferences();
        if (prefs) {
          if (prefs.preferredTravelStyles?.styles?.length) {
            const mapped = prefs.preferredTravelStyles.styles
              .map((s) => Object.values(TravelStyle).find((ts) => ts === s))
              .filter((s): s is TravelStyle => s !== undefined);
            if (mapped.length > 0) setStyles(mapped);
          }
          if (prefs.preferredStartLocation) {
            setStartLocation(prefs.preferredStartLocation);
          }
          if (
            prefs.preferredBudgetRange &&
            BUDGET_RANGE_MAP[prefs.preferredBudgetRange]
          ) {
            setBudget(BUDGET_RANGE_MAP[prefs.preferredBudgetRange]);
          }
          setPrefsLoaded(true);
        }
      } catch {
        // Not authenticated or no preferences - continue with defaults
      } finally {
        setLoadingPrefs(false);
      }
    };

    loadSavedPreferences();
  }, []);

  const toggle = (s: TravelStyle) => {
    setStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const days = calculateDays(startDate, endDate);
      navigate("/recommendations", {
        state: {
          preferences: {
            travelStyles: styles,
            days,
            startLocation,
            budget,
          },
        },
      });
    }
  };

  const options = [
    { type: TravelStyle.ADVENTURE, icon: "🧗", desc: "Hiking & Surfing" },
    { type: TravelStyle.CULTURAL, icon: "🏛️", desc: "Ancient Temples" },
    { type: TravelStyle.SPIRITUAL, icon: "🧘", desc: "Meditation & Peace" },
    { type: TravelStyle.NATURE, icon: "🐘", desc: "Safaris & Parks" },
  ];

  if (loadingPrefs) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-[#004E89]">
            Your Journey Plan
          </h2>
          <span className="text-sm font-bold text-gray-400">STEP {step}/3</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF6B35]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        {prefsLoaded && step === 1 && (
          <p className="text-sm text-[#06D6A0] mt-3 font-medium">
            Pre-filled from your saved preferences
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 min-h-[500px] flex flex-col">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Compass className="mr-3 text-[#FF6B35]" /> Travel Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((o) => (
                <button
                  key={o.type}
                  onClick={() => toggle(o.type)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center space-x-4 ${
                    styles.includes(o.type)
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-md"
                      : "border-gray-50 hover:border-gray-100"
                  }`}
                >
                  <span className="text-4xl">{o.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{o.type}</p>
                    <p className="text-xs text-gray-400">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Calendar className="mr-3 text-[#FF6B35]" /> Timing & Arrival
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Arrival
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Departure
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                  Start From
                </label>
                <select
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  {startLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <DollarSign className="mr-3 text-[#FF6B35]" /> Total Budget
            </h3>
            <div className="space-y-12 py-8 text-center">
              <span className="text-5xl font-black text-[#004E89]">
                Rs. {budget.toLocaleString()}
              </span>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="50000"
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
              />
            </div>
          </motion.div>
        )}

        <div className="mt-auto pt-12 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === 3 ? "Generate" : "Continue"}{" "}
            <Send className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
